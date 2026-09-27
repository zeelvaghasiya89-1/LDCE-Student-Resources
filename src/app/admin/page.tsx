import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [{ count: total }, { count: published }, { count: pending }, { count: faculty }] = await Promise.all([
    supabase ? supabase.from("resources").select("id", { count: "exact", head: true }) : Promise.resolve({ count: null }),
    supabase ? supabase.from("resources").select("id", { count: "exact", head: true }).eq("status", "published") : Promise.resolve({ count: null }),
    supabase ? supabase.from("resources").select("id", { count: "exact", head: true }).eq("status", "pending_review") : Promise.resolve({ count: null }),
    supabase ? supabase.from("profiles").select("user_id", { count: "exact", head: true }).eq("role", "faculty") : Promise.resolve({ count: null }),
  ]);
  return <div className="dashboard-page"><div className="dashboard-top"><div><span className="eyebrow">ADMINISTRATION</span><h1>Portal overview</h1><p>Keep the academic library accurate, helpful and up to date.</p></div><span className="admin-badge"><ShieldCheck size={17} /> ADMIN</span></div><div className="dashboard-stats"><article><small>ALL RESOURCES</small><strong>{total ?? 0}</strong></article><article><small>PUBLISHED</small><strong>{published ?? 0}</strong></article><article><small>AWAITING REVIEW</small><strong>{pending ?? 0}</strong></article><article><small>FACULTY ACCOUNTS</small><strong>{faculty ?? 0}</strong></article></div><div className="admin-links"><Link href="/admin/resources/pending"><span><small>MODERATION</small><strong>Review pending resources</strong></span><ArrowRight size={17} /></Link><a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer"><span><small>ACADEMIC CATALOGUE</small><strong>Manage programs, semesters & subjects</strong></span><ArrowRight size={17} /></a></div></div>;
}
