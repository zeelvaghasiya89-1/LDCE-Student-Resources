import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ subjectSlug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subjectSlug } = await params;
  const supabase = await createClient();
  const { data } = supabase ? await supabase.from("subjects").select("name, code").eq("slug", subjectSlug).maybeSingle() : { data: null };
  return { title: data ? `${data.name} resources` : "Subject resources" };
}

export default async function SubjectPage({ params }: Props) {
  const { subjectSlug } = await params;
  const supabase = await createClient();
  if (!supabase) return <div className="resource-page"><span className="eyebrow">SUBJECT LIBRARY</span><h1>Connect the course catalogue</h1><p>Subject listings appear here after the verified curriculum is added to the portal.</p><Link href="/programs">Browse programs</Link></div>;
  const { data: subject } = await supabase.from("subjects").select("id, name, code, slug, semester_id, semesters(name, semester_number, shared_year, programs(name, slug))").eq("slug", subjectSlug).eq("is_active", true).maybeSingle();
  if (!subject) notFound();
  const { data: resources } = await supabase.from("resources").select("id, title, slug, description, resource_type, question_paper_type, academic_year, created_at").eq("subject_id", subject.id).eq("status", "published").order("created_at", { ascending: false });
  const semester = subject.semesters as unknown as { name: string; semester_number: number; shared_year: number | null; programs: { name: string; slug: string } | null };
  const backHref = semester.programs?.slug ? `/programs/${semester.programs.slug}` : "/first-year";
  return <div className="resource-page"><Link href={backHref} className="back-link"><ArrowLeft size={14} /> {semester.programs?.name ?? "First Year (Common)"}</Link><span className="eyebrow">{semester.name} · {subject.code ?? "SUBJECT"}</span><h1>{subject.name}</h1><p className="resource-lede">Find notes, previous question papers, syllabi and more for this subject.</p><div className="resource-list">{resources?.map((resource) => <Link className="resource-row" href={`/resources/${resource.slug}`} key={resource.id}><span className="resource-type-icon"><FileText size={18} /></span><span className="resource-row-copy"><strong>{resource.title}</strong><small>{resource.resource_type.replaceAll("_", " ")} {resource.academic_year ? `· ${resource.academic_year}` : ""}</small></span><ArrowUpRight size={16} /></Link>)}{!resources?.length && <div className="catalog-empty"><h3>Nothing shared here just yet.</h3><p>Approved faculty resources will show up here when they are added.</p></div>}</div></div>;
}
