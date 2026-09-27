import { createClient } from "@/lib/supabase/server";
import { officialPrograms, type Program } from "@/lib/data/programs";

export async function getPrograms(): Promise<Program[]> {
  const supabase = await createClient();
  if (!supabase) return officialPrograms;
  const { data, error } = await supabase.from("programs").select("name, slug, short_name, accent, category").eq("is_active", true).order("name");
  if (error || !data?.length) return officialPrograms;
  return data.map((row) => ({ name: row.name, slug: row.slug, shortName: row.short_name, accent: row.accent ?? "#a9c5ff", category: row.category ?? "Engineering" }));
}
