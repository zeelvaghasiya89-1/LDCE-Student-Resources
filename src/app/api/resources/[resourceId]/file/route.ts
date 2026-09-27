import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPortalRole } from "@/lib/auth";
import { getR2 } from "@/lib/r2";

export async function GET(request: NextRequest, { params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params;
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "File storage is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  const { data: resource } = await supabase.from("resources").select("id, status, uploaded_by").eq("id", resourceId).maybeSingle();
  const isAdmin = await hasPortalRole(supabase, user, "admin");
  const allowed = resource && (resource.status === "published" || resource.uploaded_by === user?.id || isAdmin);
  if (!allowed) return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  const { data: file } = await supabase.from("resource_files").select("storage_key, original_filename").eq("resource_id", resourceId).maybeSingle();
  const storage = getR2();
  if (!file || !storage) return NextResponse.json({ error: "File is unavailable." }, { status: 404 });
  const download = request.nextUrl.searchParams.get("download") === "1";
  const command = new GetObjectCommand({ Bucket: storage.bucket, Key: file.storage_key, ResponseContentType: "application/pdf", ResponseContentDisposition: `${download ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(file.original_filename)}` });
  const url = await getSignedUrl(storage.client, command, { expiresIn: 180 });
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "private, no-store" } });
}
