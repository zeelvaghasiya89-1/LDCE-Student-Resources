import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasPortalRole } from "@/lib/auth";
import { getR2 } from "@/lib/r2";

const schema = z.object({ subjectId: z.string().uuid(), mimeType: z.literal("application/pdf"), fileName: z.string().trim().min(1).max(180).refine((value) => value.toLowerCase().endsWith(".pdf")), fileSize: z.number().int().positive().max(20 * 1024 * 1024) });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const storage = getR2();
  if (!supabase || !storage) return NextResponse.json({ error: "Upload services are not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!await hasPortalRole(supabase, user, "faculty", "admin")) return NextResponse.json({ error: "Faculty access is required." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the PDF file details and try again." }, { status: 400 });
  if (!await hasPortalRole(supabase, user, "admin")) {
    const { data: assigned } = await supabase.from("faculty_subjects").select("id").eq("faculty_id", user!.id).eq("subject_id", parsed.data.subjectId).maybeSingle();
    if (!assigned) return NextResponse.json({ error: "You are not assigned to this subject." }, { status: 403 });
  }
  const key = `resources/${user!.id}/${randomUUID()}.pdf`;
  const command = new PutObjectCommand({ Bucket: storage.bucket, Key: key, ContentType: "application/pdf", ContentLength: parsed.data.fileSize });
  const uploadUrl = await getSignedUrl(storage.client, command, { expiresIn: 300 });
  return NextResponse.json({ uploadUrl, key, expiresIn: 300, maxBytes: 20 * 1024 * 1024 });
}
