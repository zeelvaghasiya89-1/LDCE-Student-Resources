import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, Layers3 } from "lucide-react";
import { getPrograms } from "@/lib/programs";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ programSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { programSlug } = await params;
  const program = (await getPrograms()).find((item) => item.slug === programSlug);
  return { title: program ? `${program.name} resources` : "Program resources" };
}

export default async function ProgramPage({ params }: Props) {
  const { programSlug } = await params;
  const program = (await getPrograms()).find((item) => item.slug === programSlug);
  if (!program) notFound();
  const supabase = await createClient();
  const { data: dbProgram } = supabase ? await supabase.from("programs").select("id").eq("slug", programSlug).maybeSingle() : { data: null };
  const { data: semesters } = supabase && dbProgram ? await supabase.from("semesters").select("id, semester_number, name").eq("program_id", dbProgram.id).eq("is_active", true).order("semester_number") : { data: [] };
  const { data: subjects } = supabase && semesters?.length ? await supabase.from("subjects").select("id, name, code, slug, semester_id").in("semester_id", semesters.map((semester) => semester.id)).eq("is_active", true).order("name") : { data: [] };

  return <div className="program-page"><Link className="back-link" href="/programs"><ArrowLeft size={15} /> All programs</Link><div className="program-hero"><span className="eyebrow">LDCE UNDERGRADUATE PROGRAM</span><h1>{program.name}</h1><p>Make this your starting point for notes, question papers, syllabi and study material.</p><div className="program-stats"><span><strong>{semesters?.length ?? "—"}</strong> semesters</span><span><strong>{subjects?.length ?? "—"}</strong> subjects</span><span>Open library · No sign-in</span></div></div>
    <div className="semester-header"><div><span className="eyebrow">COURSE MAP</span><h2>Browse by semester</h2></div><span className="live-pill"><span className="status-dot" /> CURRICULUM INDEX</span></div>
    {semesters?.length ? <div className="semester-grid">{semesters.map((semester) => { const items = subjects?.filter((subject) => subject.semester_id === semester.id) ?? []; return <article key={semester.id} className="semester-card"><div className="semester-card-top"><span className="semester-index">{String(semester.semester_number).padStart(2, "0")}</span><Layers3 size={18} /></div><h3>{semester.name}</h3><p>{items.length} {items.length === 1 ? "subject" : "subjects"}</p>{items.map((subject) => <Link key={subject.id} className="subject-row" href={`/subjects/${subject.slug}`}><span>{subject.name}</span><ArrowUpRight size={14} /></Link>)}</article>; })}</div> : <div className="catalog-empty"><span className="empty-icon"><BookOpen size={22} /></span><div><h3>The course map is taking shape.</h3><p>Semester and subject listings will appear as verified curriculum data is added by the portal team.</p></div><a href="https://www.ldce.ac.in/admissions/gtu-affiliation" target="_blank" rel="noreferrer">Official curriculum sources <ArrowUpRight size={14} /></a></div>}
  </div>;
}
