"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, PageTitle, Panel, inputClass } from "@/components/ui";
import { createClient } from "@/lib/supabase/browser";

export function VerifyClient({ next }: { next: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const factor = data?.totp?.[0];
    if (!factor) { router.replace(`/account/security?required=1&next=${encodeURIComponent(next)}`); return; }
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.trim() });
    setBusy(false);
    if (error) { setError("That code didn't work. Try the newest one from your app."); return; }
    router.replace(next); router.refresh();
  };
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Security" title="Enter your code" intro="Open your authenticator app and type the 6-digit code for HandiLearn." />
      <Panel>
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
          <div><Field label="Code"><input autoFocus inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required className={`${inputClass} w-40 tracking-[0.3em]`} value={code} onChange={e => setCode(e.target.value)} /></Field></div>
          <Button type="submit" disabled={busy}>{busy ? "Checking…" : "Continue"}</Button>
        </form>
        {error && <p role="alert" className="mt-3 text-sm font-semibold text-coral">{error}</p>}
      </Panel>
    </div>
  );
}
