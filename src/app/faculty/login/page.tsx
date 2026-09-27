import type { Metadata } from "next";
import Link from "next/link";
import { FacultyLoginForm } from "@/components/faculty-login-form";

export const metadata: Metadata = { title: "Faculty sign in" };

export default async function FacultyLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/faculty" } = await searchParams;
  return <div className="login-page"><Link href="/" className="back-link">← Back to the library</Link><div className="login-card"><span className="eyebrow">LDCE RESOURCE PORTAL</span><h1>Good to have<br /><em>you here.</em></h1><p>Sign in with your faculty account to manage course resources.</p><FacultyLoginForm nextPath={next.startsWith("/") && !next.startsWith("//") ? next : "/faculty"} /><small>Faculty and administrator accounts are provisioned by the portal administrator.</small></div><div className="login-note">Private sign-in · Supabase Auth</div></div>;
}
