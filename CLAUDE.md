# HandiLearn v3

AI tutor for Caribbean primary and secondary students, Barbados first. This repo
replaces v2 (geodon-tmn/HandiLearn-20 on Replit). The approved design is the
"Handi Learn v3 — Design" doc: https://claude.ai/artifact/A8TqJSEYwKjiUhygY4tytF

## Rules
- Keep it simple: about 18 tables, about 14 screens. Add a table or screen only
  when a requirement needs it.
- One person can finish any task. No second-approver steps.
- Records can be edited and deleted; the audit log keeps history.
- Child data stays strict: Supabase row-level security on every table, guardian
  consent, two-factor for admin roles, no personal details in AI prompts.
- Brand: follow BRAND.md and the components in src/components/ui.tsx.
- A screen still on sample data shows the Preview badge. Remove it only when the
  screen reads and writes real data.

## Product model
- Hierarchy: education system OR school → curriculum → subject → module → topic
  → objective → lesson (an objective holds its lessons). A curriculum belongs to
  exactly one school or one system.
- Territories: schools, students and national systems belong to a territory;
  regional bodies (CXC) have none.
- Learning-path graph between objectives; link types mandatory, recommended,
  supporting; source syllabus, AI or admin. Only mandatory links block a path.
- Placement: adaptive, at most 10 questions, starts on the first 3 objectives
  and moves along the path while the student does well.
- Teaching content is stored per objective + profile key (level, age band,
  learning preference, language) and reused before generating new content.
- School access: school status listed → claimed → subscribed. Staff see a
  student only when the school is subscribed AND the family granted permission
  (students manage it themselves at 18, or per territory privacy law).
- AI by job: Anthropic Claude for syllabus breakdown, learning paths,
  questions, teaching content and tutor; OpenAI for images and voice. All
  calls go through one adapter.

## Stack
Next.js 16 (App Router) on Vercel, Supabase (Postgres, Auth, Storage).
Next 16 differs from older versions: read node_modules/next/dist/docs before
using unfamiliar APIs (e.g. `params` is a Promise).

## Build stages
0 clickable prototype (done) → 1 foundation (Supabase, auth, roles,
territories) → 2 setup screens → 3 syllabus ingestion + AI provider comparison →
4 learning-path graph → 5 enrolment and placement → 6 path, content, tutor →
7 move v2 data and launch.

## Database and auth
- Schema changes are SQL files in supabase/migrations, applied in order by
  scripts/migrate.mjs before every Vercel build (SUPABASE_DB_URL). Never edit an
  applied migration; add a new numbered file.
- Every table has row-level security. Admin writes require role global_admin
  AND a two-factor session (aal2), enforced in the database by is_global_admin().
- Write audit entries with the log_action() RPC from server actions.
- The service-role client (src/lib/supabase/admin.ts) is server-only and used
  only for the first-administrator bootstrap and reading two-factor status.
- Env vars: see .env.example.

## Commands
npm run dev · npm run build · npm run typecheck ·
TEST_DB_URL=postgres://... npm run test:db (migrations + RLS checks on a local Postgres)
