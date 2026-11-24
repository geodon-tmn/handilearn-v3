"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Notice, inputClass } from "@/components/ui";
import { createClient } from "@/lib/supabase/browser";
import { supabaseConfigured } from "@/lib/supabase/env";

export function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!supabaseConfigured) return <Notice tone="locked" title="Sign-up isn't connected yet">The Supabase settings are missing from this deployment.</Notice>;
  if (sent) return <Notice tone="success" title="Check your email">We sent a link to {form.email}. Open it to confirm your account, then sign in.</Notice>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    const { data, error } = await createClient().auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.name.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setBusy(false);
    if (error) { setError(error.message); return; }
    if (data.session) { router.replace(next); router.refresh(); } else setSent(true);
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Your name"><input required autoComplete="name" className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Email"><input type="email" required autoComplete="email" className={inputClass} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
      <Field label="Password" hint="At least 8 characters."><input type="password" required minLength={8} autoComplete="new-password" className={inputClass} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></Field>
      {error && <p role="alert" className="text-sm font-semibold text-coral">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating…" : "Create account"}</Button>
      <p className="text-center text-sm text-muted-foreground">Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-accent">Sign in</Link></p>
    </form>
  );
}
