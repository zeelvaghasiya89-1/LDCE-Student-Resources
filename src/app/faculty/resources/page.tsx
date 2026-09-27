import Link from "next/link";
import { ArrowLeft, FilePlus2, Files } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function FacultyResourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const { data: resources } = supabase ? await supabase.from("resources").select("id, title, status, resource_type, academic_year, created_at, subjects(name)").eq("uploaded_by", user!.id).order("created_at", { ascending: false }) : { data: [] };
  return <div className="dashboard-page"><Link href="/faculty" className="back-link"><ArrowLeft size={14} /> Dashboard</Link><div className="dashboard-top"><div><span className="eyebrow">FACULTY PORTAL</span><h1>Your resources</h1><p>Manage the material you’ve shared with students.</p></div><Link className="button button-dark" href="/faculty/resources/new"><FilePlus2 size={16} /> Add a resource</Link></div><div className="resource-table">{resources?.map((resource) => <div className="resource-table-row" key={resource.id}><span className="table-file"><Files size={15} /></span><span className="table-title"><strong>{resource.title}</strong><small>{(resource.subjects as unknown as { name: string } | null)?.name ?? "Subject"} · {resource.resource_type.replaceAll("_", " ")}</small></span><span className={`status-pill status-${resource.status}`}>{resource.status.replaceAll("_", " ")}</span><span className="table-date">{resource.academic_year ?? new Date(resource.created_at).toLocaleDateString("en-IN")}</span></div>)}{!resources?.length && <div className="empty-dashboard"><Files size={24} /><h3>No resources yet</h3><p>Your approved resources are published to the student library.</p></div>}</div></div>;
}
