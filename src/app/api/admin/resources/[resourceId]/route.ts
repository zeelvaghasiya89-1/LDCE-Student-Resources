import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasPortalRole } from "@/lib/auth";

const schema = z.object({ status: z.enum(["published", "rejected"]), reason: z.string().trim().max(1000).optional() });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ resourceId: string }> }) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!await hasPortalRole(supabase, user, "admin")) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.status === "rejected" && !parsed.data.reason) return NextResponse.json({ error: "Choose a status and include a reason when rejecting." }, { status: 400 });
  const { resourceId } = await params;
  const { data, error } = await supabase.from("resources").update({ status: parsed.data.status, rejection_reason: parsed.data.status === "rejected" ? parsed.data.reason : null, published_at: parsed.data.status === "published" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", resourceId).eq("status", "pending_review").select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "This pending resource could not be updated." }, { status: 400 });
  return NextResponse.json({ id: data.id, status: parsed.data.status });
}
