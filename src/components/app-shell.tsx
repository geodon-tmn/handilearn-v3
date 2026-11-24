"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Eye, LogOut, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./ui";

export type Role = "admin" | "parent" | "student" | "teacher";

const NAV: Record<Role, { label: string; home: string; links: { href: string; label: string }[] }> = {
  admin: { label: "Global Administrator", home: "/admin", links: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/setup", label: "Territories and schools" },
    { href: "/admin/curricula", label: "Curricula" },
    { href: "/admin/review", label: "Upload and review" },
    { href: "/admin/map", label: "Learning path" },
    { href: "/admin/people", label: "People" },
    { href: "/admin/audit", label: "Audit and usage" },
  ] },
  parent: { label: "Parent", home: "/parent", links: [
    { href: "/parent", label: "My children" },
    { href: "/parent/progress", label: "Progress" },
    { href: "/settings/data-sharing", label: "Data sharing" },
  ] },
  student: { label: "Student", home: "/student", links: [
    { href: "/student", label: "Home" },
    { href: "/student/placement", label: "Placement test" },
    { href: "/student/lesson", label: "Lesson" },
    { href: "/student/tutor", label: "Tutor" },
  ] },
  teacher: { label: "Teacher", home: "/teacher", links: [{ href: "/teacher", label: "Class progress" }] },
};

/** Signed-in shell. In the prototype a switcher lets you view each role. */
export type ShellUser = { name: string; email: string; roleLabel: string };

export function AppShell({ role, children, wide, user, preview = true }: { role: Role; children: ReactNode; wide?: boolean; user?: ShellUser; preview?: boolean }) {
  const path = usePathname();
  const nav = NAV[role];
  return (
    <div className="min-h-[100dvh] bg-sky-soft/50">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <Logo href={nav.home} />
            <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-semibold sm:inline">{user?.roleLabel ?? nav.label}</span>
            {preview && <PreviewBadge />}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RoleSwitcher role={role} />
            {user && <>
              <Link href="/account" title={user.email} className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold hover:border-accent"><UserRound className="h-3.5 w-3.5" />{user.name || user.email}</Link>
              <form action="/auth/signout" method="post"><button aria-label="Sign out" className="rounded-full border bg-card p-1.5 hover:border-accent"><LogOut className="h-3.5 w-3.5" /></button></form>
            </>}
          </div>
          <nav aria-label="Main" className="-mx-1 flex w-full gap-1 overflow-x-auto pb-1">
            {nav.links.map(l => {
              const active = path === l.href;
              return <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}
                className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors", active ? "bg-foreground text-background" : "hover:bg-secondary")}>{l.label}</Link>;
            })}
          </nav>
        </div>
      </header>
      <main className={cn("mx-auto px-5 py-8 md:px-8 md:py-12", wide ? "max-w-6xl" : "max-w-5xl")}>{children}</main>
    </div>
  );
}

/** Marks screens that still run on sample data. Removed screen by screen as the backend connects. */
export function PreviewBadge() {
  return (
    <span title="This screen shows sample data. It becomes real when the backend is connected." className="inline-flex items-center gap-1 rounded-full border border-[hsl(42_70%_70%)] bg-sun-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[hsl(32_70%_32%)]">
      <Eye className="h-3 w-3" aria-hidden="true" /> Preview
    </span>
  );
}

function RoleSwitcher({ role }: { role: Role }) {
  return (
    <div className="flex items-center gap-1 rounded-full border bg-card p-1 text-xs font-semibold" aria-label="View the prototype as">
      <span className="hidden px-2 text-muted-foreground md:inline">View as</span>
      {(Object.keys(NAV) as Role[]).map(r => (
        <Link key={r} href={NAV[r].home} className={cn("rounded-full px-2.5 py-1 capitalize", r === role ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}>{r}</Link>
      ))}
    </div>
  );
}
