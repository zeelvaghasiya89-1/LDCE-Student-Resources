import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function hasPortalRole(supabase: SupabaseClient, user: User | null, ...roles: string[]) {
  if (!user) return false;
  const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("user_id", user.id).maybeSingle();
  return Boolean(profile?.is_active && roles.includes(profile.role));
}
