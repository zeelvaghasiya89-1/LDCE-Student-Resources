import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPortalRole } from "@/lib/auth";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!await hasPortalRole(supabase, user, "admin")) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const { data, error } = await supabase.from("resources").select("id, title, description, resource_type, academic_year, created_at, uploaded_by, subjects(name, code, semesters(name, programs(name)))").eq("status", "pending_review").order("created_at");
  if (error) return NextResponse.json({ error: "Could not load pending resources." }, { status: 500 });
  return NextResponse.json({ resources: data });
}
