import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (path.startsWith("/faculty") || path.startsWith("/admin")) {
    if (!user) {
      const target = request.nextUrl.clone();
      target.pathname = "/faculty/login";
      target.searchParams.set("next", path);
      return NextResponse.redirect(target);
    }
    const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("user_id", user.id).maybeSingle();
    const role = profile?.is_active ? profile.role : null;
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/faculty", request.url));
    }
    if (path.startsWith("/faculty") && role !== "faculty" && role !== "admin" && path !== "/faculty/login") {
      return NextResponse.redirect(new URL("/faculty/login", request.url));
    }
  }
  return response;
}
