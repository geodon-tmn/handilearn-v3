import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button, ButtonLink, Field, Notice, PageTitle, Panel, Pill, inputClass } from "@/components/ui";
import { ROLE_LABEL, ensureBootstrapAdmin, getSession } from "@/lib/auth";
import { updateName } from "./actions";

export const metadata = { title: "Your account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  let s = await getSession();
  if (!s) redirect("/login?next=/account");
  if (s.profile?.role !== "global_admin" && await ensureBootstrapAdmin(s.user.email, s.user.id)) s = await getSession();
  const profile = s!.profile;
  const role = profile?.role ?? "parent";
  const isAdmin = role === "global_admin" || role === "school_admin";
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Account" title={profile?.full_name ? `Hello, ${profile.full_name.split(" ")[0]}` : "Your account"} />
      {denied && <Notice tone="warn" title="That area is for Global Administrators">Ask a Global Administrator to change your role if you need access.</Notice>}
      <Panel>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="font-semibold text-muted-foreground">Email</dt><dd className="mt-1">{s!.user.email}</dd></div>
          <div><dt className="font-semibold text-muted-foreground">Role</dt><dd className="mt-1"><Pill tone={role === "global_admin" ? "info" : "neutral"}>{ROLE_LABEL[role]}</Pill></dd></div>
        </dl>
        <form action={updateName} className="mt-6 flex flex-wrap items-end gap-3">
          <div className="min-w-60 flex-1"><Field label="Your name"><input name="full_name" defaultValue={profile?.full_name ?? ""} className={inputClass} /></Field></div>
          <Button type="submit" variant="outline">Save</Button>
        </form>
      </Panel>
      <Panel className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {s!.mfaEnrolled ? <ShieldCheck className="mt-0.5 h-5 w-5 text-leaf" /> : <ShieldAlert className="mt-0.5 h-5 w-5 text-[hsl(38_85%_40%)]" />}
          <div><p className="font-semibold">Two-factor sign-in {s!.mfaEnrolled ? "is on" : "is off"}</p>
            <p className="text-sm text-muted-foreground">{isAdmin ? "Required for administrators." : "Optional. Adds a code from an authenticator app when you sign in."}</p></div>
        </div>
        <ButtonLink href="/account/security" variant="outline" size="sm">Manage</ButtonLink>
      </Panel>
      {role === "global_admin" && <Panel tone="sun" className="flex flex-wrap items-center justify-between gap-4"><p className="font-semibold">Go to the admin portal</p><ButtonLink href="/admin">Open admin <ArrowRight /></ButtonLink></Panel>}
      {role === "parent" && <p className="text-sm text-muted-foreground">Adding children and enrolling them in subjects arrives in a later stage. <Link href="/parent" className="font-semibold text-accent">See the preview</Link></p>}
    </div>
  );
}
