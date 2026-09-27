"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function FacultyLoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const client = createClient();
    if (!client) { setError("Faculty sign-in is being configured. Please try again later."); return; }
    setBusy(true);
    const { error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) { setError("We couldn't sign you in with those details."); setBusy(false); return; }
    router.replace(nextPath); router.refresh();
  }

  return <form className="login-form" onSubmit={submit}><label>Email address<input type="email" name="email" autoComplete="username" required placeholder="name@ldce.ac.in" /></label><label>Password<input type="password" name="password" autoComplete="current-password" required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in to faculty portal"} <span>→</span></button></form>;
}
