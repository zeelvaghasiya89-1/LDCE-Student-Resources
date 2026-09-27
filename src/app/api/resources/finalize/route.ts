import { HeadObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasPortalRole } from "@/lib/auth";
import { getR2 } from "@/lib/r2";

const schema = z.object({ key: z.string().min(1), subjectId: z.string().uuid(), title: z.string().trim().min(3).max(180), description: z.string().trim().max(2000).optional(), type: z.enum(["question_paper", "notes", "study_material", "lab_manual", "syllabus", "question_bank", "reference_material", "other"]), questionPaperType: z.enum(["mid_semester", "university_exam", "practical", "internal", "previous_year", "other"]).nullable().optional(), academicYear: z.string().regex(/^20\d{2}(-\d{2})?$/).optional(), fileName: z.string().trim().min(1).max(180).refine((value) => value.toLowerCase().endsWith(".pdf")) });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const storage = getR2();
  if (!supabase || !storage) return NextResponse.json({ error: "Upload services are not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!await hasPortalRole(supabase, user, "faculty", "admin")) return NextResponse.json({ error: "Faculty access is required." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !user) return NextResponse.json({ error: "Resource details are incomplete." }, { status: 400 });
  const input = parsed.data;
  if (!input.key.startsWith(`resources/${user.id}/`) || !input.key.endsWith(".pdf")) return NextResponse.json({ error: "Invalid storage key." }, { status: 400 });
  if (!await hasPortalRole(supabase, user, "admin")) {
    const { data: assigned } = await supabase.from("faculty_subjects").select("id").eq("faculty_id", user.id).eq("subject_id", input.subjectId).maybeSingle();
    if (!assigned) return NextResponse.json({ error: "You are not assigned to this subject." }, { status: 403 });
  }
  const { client, bucket } = storage;
  let head;
  try { head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: input.key })); }
  catch { return NextResponse.json({ error: "Upload the PDF before submitting it." }, { status: 400 }); }
  if (head.ContentType !== "application/pdf" || !head.ContentLength || head.ContentLength > 20 * 1024 * 1024) return NextResponse.json({ error: "The uploaded file did not pass validation." }, { status: 400 });
  const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 125)}-${randomUUID().slice(0, 8)}`;
  const { data: resource, error } = await supabase.from("resources").insert({ subject_id: input.subjectId, uploaded_by: user.id, title: input.title, slug, description: input.description || null, resource_type: input.type, question_paper_type: input.type === "question_paper" ? input.questionPaperType ?? null : null, academic_year: input.academicYear ?? null, status: "pending_review" }).select("id").single();
  if (error || !resource) return NextResponse.json({ error: "Could not save this resource." }, { status: 400 });
  const { error: fileError } = await supabase.from("resource_files").insert({ resource_id: resource.id, original_filename: input.fileName, storage_key: input.key, mime_type: "application/pdf", file_size: head.ContentLength });
  if (fileError) {
    await supabase.from("resources").delete().eq("id", resource.id);
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: input.key })).catch(() => undefined);
    return NextResponse.json({ error: "Could not save the file record." }, { status: 400 });
  }
  return NextResponse.json({ id: resource.id, slug, status: "pending_review" }, { status: 201 });
}
