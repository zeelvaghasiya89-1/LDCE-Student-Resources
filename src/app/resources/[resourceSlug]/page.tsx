import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownToLine, ArrowLeft, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ resourceSlug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resourceSlug } = await params;
  const supabase = await createClient();
  const { data } = supabase ? await supabase.from("resources").select("title, description").eq("slug", resourceSlug).eq("status", "published").maybeSingle() : { data: null };
  return { title: data?.title ?? "Academic resource", description: data?.description ?? "LDCE undergraduate academic resource." };
}

export default async function ResourcePage({ params }: Props) {
  const { resourceSlug } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();
  const { data: resource } = await supabase.from("resources").select("id, title, description, resource_type, question_paper_type, academic_year, subject_id, subjects(name, slug, code, semesters(name, program_id, programs(name, slug)))").eq("slug", resourceSlug).eq("status", "published").maybeSingle();
  if (!resource) notFound();
  const subject = resource.subjects as unknown as { name: string; slug: string; code: string | null; semesters: { name: string; programs: { name: string; slug: string } | null } };
  const { data: file } = await supabase.from("resource_files").select("id, original_filename, file_size").eq("resource_id", resource.id).maybeSingle();
  if (!file) notFound();
  const program = subject.semesters.programs;
  return <div className="resource-page"><Link className="back-link" href={`/subjects/${subject.slug}`}><ArrowLeft size={14} /> {subject.name}</Link><span className="eyebrow">{program?.name ?? "FIRST YEAR COMMON"} · {subject.semesters.name}</span><h1>{resource.title}</h1><p className="resource-lede">{resource.description}</p><div className="resource-meta"><span>{resource.resource_type.replaceAll("_", " ")}</span>{resource.academic_year && <span>Academic year {resource.academic_year}</span>}{resource.question_paper_type && <span>{resource.question_paper_type.replaceAll("_", " ")}</span>}<span>{(file.file_size / 1048576).toFixed(1)} MB · PDF</span></div><div className="pdf-toolbar"><span><FileText size={15} /> {file.original_filename}</span><a className="button button-dark" href={`/api/resources/${resource.id}/file?download=1`}><ArrowDownToLine size={15} /> Download PDF</a></div><iframe className="pdf-frame" title={`PDF preview: ${resource.title}`} src={`/api/resources/${resource.id}/file`} /><p className="pdf-fallback">If the preview doesn’t load, <a href={`/api/resources/${resource.id}/file?download=1`}>download the PDF</a>.</p></div>;
}
