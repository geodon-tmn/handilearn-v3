"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Trash2 } from "lucide-react";
import { Button, Field, Notice, PageTitle, Panel, inputClass } from "@/components/ui";
import { createClient } from "@/lib/supabase/browser";

type Factor = { id: string; friendly_name?: string; status: string; factor_type: string };

export function SecurityClient({ required, next }: { required: boolean; next: string | null }) {
  const router = useRouter();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const { data } = await createClient().auth.mfa.listFactors();
    setFactors((data?.all ?? []) as Factor[]);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const verified = factors.filter(f => f.status === "verified" && f.factor_type === "totp");

  const start = async () => {
    setError(null); setBusy(true);
    const supabase = createClient();
    // Clear any half-finished setup first.
    for (const f of factors.filter(f => f.status !== "verified")) await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${new Date().toLocaleDateString()}` });
    setBusy(false);
    if (error || !data) { setError(error?.message ?? "Could not start setup."); return; }
    setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };
  const confirm = async (e: React.FormEvent) => {
    e.preventDefault(); if (!enrolling) return;
    setError(null); setBusy(true);
    const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId: enrolling.id, code: code.trim() });
    setBusy(false);
    if (error) { setError("That code didn't work. Check the time on your phone and try the newest code."); return; }
    setEnrolling(null); setCode(""); await load();
    if (next) { router.replace(next); router.refresh(); }
  };
  const remove = async (id: string) => {
    setError(null);
    const { error } = await createClient().auth.mfa.unenroll({ factorId: id });
    if (error) setError(error.message); else { await load(); router.refresh(); }
  };

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Security" title="Two-factor sign-in" intro="Use an authenticator app such as Google Authenticator, Microsoft Authenticator or 1Password." />
      {required && verified.length === 0 && <Notice tone="locked" title="Administrators must turn this on">Set it up once below, then you'll go straight to the admin portal.</Notice>}
      {verified.length > 0 && (
        <Panel>
          <h2 className="font-extrabold">Your authenticators</h2>
          <ul className="mt-3 space-y-2">{verified.map(f => (
            <li key={f.id} className="flex items-center justify-between rounded-2xl border p-3 text-sm">
              <span className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-leaf" />{f.friendly_name ?? "Authenticator app"}</span>
              <button onClick={() => remove(f.id)} className="rounded-full p-2 text-muted-foreground hover:bg-coral-soft hover:text-coral" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
            </li>))}
          </ul>
        </Panel>
      )}
      {!enrolling && verified.length === 0 && <Button onClick={start} disabled={busy}>{busy ? "Starting…" : "Set up two-factor sign-in"}</Button>}
      {enrolling && (
        <Panel tone="sky">
          <ol className="space-y-4 text-sm">
            <li><p className="font-semibold">1. Scan this with your authenticator app</p>
              {/* Supabase returns the QR code as an SVG data URI. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={enrolling.qr} alt="QR code for your authenticator app" className="mt-3 h-48 w-48 rounded-2xl bg-white p-2" />
              <p className="mt-2 text-xs text-muted-foreground">Can't scan? Enter this key: <span className="font-mono">{enrolling.secret}</span></p></li>
            <li><form onSubmit={confirm} className="flex flex-wrap items-end gap-3">
              <div><Field label="2. Enter the 6-digit code"><input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required className={`${inputClass} w-40 tracking-[0.3em]`} value={code} onChange={e => setCode(e.target.value)} /></Field></div>
              <Button type="submit" disabled={busy}>{busy ? "Checking…" : "Turn on"}</Button>
            </form></li>
          </ol>
        </Panel>
      )}
      {error && <p role="alert" className="text-sm font-semibold text-coral">{error}</p>}
    </div>
  );
}
