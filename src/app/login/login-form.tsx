"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Notice, inputClass } from "@/components/ui";
import { createClient } from "@/lib/supabase/browser";
import { supabaseConfigured } from "@/lib/supabase/env";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!supabaseConfigured) return <Notice tone="locked" title="Sign-in isn't connected yet">The Supabase settings are missing from this deployment.</Notice>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setError(error.message === "Email not confirmed" ? "Please confirm your email first. Check your inbox for the link." : "That email and password don't match."); return; }
    router.replace(next); router.refresh();
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email"><input type="email" required autoComplete="email" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} /></Field>
      <Field label="Password"><input type="password" required autoComplete="current-password" className={inputClass} value={password} onChange={e => setPassword(e.target.value)} /></Field>
      {error && <p role="alert" className="text-sm font-semibold text-coral">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
      <p className="text-center text-sm text-muted-foreground">New to HandiLearn? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-accent">Create an account</Link></p>
    </form>
  );
}
