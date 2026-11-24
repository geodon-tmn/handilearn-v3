import Link from "next/link";
import { ArrowRight, BookOpenCheck, GraduationCap, School, ShieldCheck, Sparkles, Users } from "lucide-react";
import { ButtonLink, Eyebrow, IconBubble, Logo, Panel } from "@/components/ui";
import { PreviewBadge } from "@/components/app-shell";

const roles = [
  { href: "/admin", icon: <ShieldCheck />, tone: "ink" as const, title: "Global Administrator", body: "Set up territories, schools and curricula. Upload a syllabus and review its outline and learning path." },
  { href: "/parent", icon: <Users />, tone: "sky" as const, title: "Parent", body: "Add your children, enrol them in subjects and decide which schools can see their progress." },
  { href: "/student", icon: <GraduationCap />, tone: "sun" as const, title: "Student", body: "Take a short placement test, follow your own path and ask the tutor when you're stuck." },
  { href: "/teacher", icon: <School />, tone: "leaf" as const, title: "Teacher", body: "See who is moving ahead and who is stuck, for students whose families agreed." },
];

export default function Home() {
  return (
    <div className="min-h-[100dvh]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <div className="flex items-center gap-3"><Logo /><PreviewBadge /></div>
        <div className="flex items-center gap-2"><ButtonLink href="/login" variant="ghost" size="sm">Sign in</ButtonLink><ButtonLink href="/signup" variant="ink" size="sm">Create an account <ArrowRight /></ButtonLink></div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-12 pt-8 md:px-8 md:pt-16">
        <div className="hl-rise max-w-3xl">
          <Eyebrow>Barbados first · built for the Caribbean</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">Learning that adapts to <span className="relative whitespace-nowrap"><span className="relative z-10">every student</span><span className="absolute inset-x-0 bottom-1 -z-0 h-4 rounded-full bg-primary/60" aria-hidden="true" /></span>.</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">HandiLearn reads your syllabus, maps the best route through it, and gives each student a path that starts where they are, with an AI tutor beside them.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/student/placement" size="lg">Try the placement test <Sparkles /></ButtonLink>
            <ButtonLink href="/admin/review" variant="outline" size="lg">See a syllabus load <BookOpenCheck /></ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <h2 className="text-xl font-extrabold">Explore the prototype as</h2>
        <p className="mt-1 text-sm text-muted-foreground">Screens marked Preview still use sample data. The admin portal needs a Global Administrator sign-in.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map(r => (
            <Link key={r.href} href={r.href} className="group">
              <Panel className="h-full transition-transform duration-200 group-hover:-translate-y-1">
                <IconBubble tone={r.tone}>{r.icon}</IconBubble>
                <h3 className="mt-4 text-lg font-extrabold">{r.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">Open <ArrowRight className="h-4 w-4" /></p>
              </Panel>
            </Link>
          ))}
        </div>
      </section>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">© HandiLearn · Prototype · Sample data only</footer>
    </div>
  );
}
