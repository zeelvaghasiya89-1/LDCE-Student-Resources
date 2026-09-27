import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ResourceUploadForm, type SubjectOption } from "@/components/resource-upload-form";

export const metadata: Metadata = { title: "Add a resource" };

export default async function NewResourcePage() {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  let subjects: SubjectOption[] = [];
  if (supabase && user) {
    const { data: assignmentRows } = await supabase.from("faculty_subjects").select("subject_id").eq("faculty_id", user.id);
    const ids = assignmentRows?.map((row) => row.subject_id) ?? [];
    if (ids.length) {
      const { data } = await supabase.from("subjects").select("id, name, code, semesters(name, programs(name))").in("id", ids).eq("is_active", true).order("name");
      subjects = (data ?? []).map((item) => { const semester = item.semesters as unknown as { name: string; programs: { name: string } }; return { id: item.id, name: item.name, code: item.code, context: `${semester.programs.name} · ${semester.name}` }; });
    }
  }
  return <div className="dashboard-page upload-page"><Link href="/faculty/resources" className="back-link"><ArrowLeft size={14} /> Your resources</Link><div className="dashboard-top"><div><span className="eyebrow">FACULTY PORTAL</span><h1>Add a resource</h1><p>Share a PDF with students in your assigned subjects.</p></div></div><ResourceUploadForm subjects={subjects} />{!subjects.length && <p className="assignment-note">No subjects are assigned to your account yet. Ask the portal administrator to assign a subject before uploading.</p>}</div>;
}
