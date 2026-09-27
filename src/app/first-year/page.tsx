import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "First-year common resources", description: "Browse shared first-year courses for LDCE undergraduate students." };

export default async function FirstYearPage() {
  const supabase = await createClient();
  const { data: semesters } = supabase ? await supabase.from("semesters").select("id, semester_number, name").eq("shared_year", 1).eq("is_active", true).order("semester_number") : { data: [] };
  const { data: subjects } = supabase && semesters?.length ? await supabase.from("subjects").select("id, name, slug, code, semester_id").in("semester_id", semesters.map((item) => item.id)).eq("is_active", true).order("name") : { data: [] };
  return <div className="program-page"><Link className="back-link" href="/programs"><ArrowLeft size={14} /> All programs</Link><div className="program-hero"><span className="eyebrow">SHARED ACADEMIC LIBRARY</span><h1>First year,<br />together.</h1><p>Common first-year courses shared across LDCE undergraduate programs.</p></div><div className="semester-header"><div><span className="eyebrow">FIRST YEAR</span><h2>Browse by semester</h2></div></div>{semesters?.length ? <div className="semester-grid">{semesters.map((semester) => { const items = subjects?.filter((subject) => subject.semester_id === semester.id) ?? []; return <article className="semester-card" key={semester.id}><div className="semester-card-top"><span className="semester-index">{String(semester.semester_number).padStart(2, "0")}</span><BookOpen size={17} /></div><h3>{semester.name}</h3>{items.map((subject) => <Link className="subject-row" href={`/subjects/${subject.slug}`} key={subject.id}><span>{subject.name} {subject.code && <small>· {subject.code}</small>}</span><ArrowUpRight size={14} /></Link>)}</article>; })}</div> : <div className="catalog-empty"><span className="empty-icon"><BookOpen size={22} /></span><div><h3>First-year courses are being verified.</h3><p>The shared course map will appear here once the official curriculum is confirmed.</p></div><a href="https://www.ldce.ac.in/admissions/gtu-affiliation" target="_blank" rel="noreferrer">Official curriculum sources <ArrowUpRight size={14} /></a></div>}</div>;
}
