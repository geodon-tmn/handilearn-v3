import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-sky-soft/50">
      <header className="border-b bg-background/90">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Logo href="/account" />
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link href="/account" className="rounded-full px-3 py-1.5 hover:bg-secondary">Account</Link>
            <form action="/auth/signout" method="post"><button className="rounded-full px-3 py-1.5 hover:bg-secondary">Sign out</button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10">{children}</main>
    </div>
  );
}
