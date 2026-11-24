// Applies supabase/migrations/*.sql in order, once each. Runs before every
// Vercel build using SUPABASE_DB_URL; skipped when the variable is not set.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";

const url = process.env.SUPABASE_DB_URL;
if (!url) { console.log("migrate: SUPABASE_DB_URL not set, skipping"); process.exit(0); }
const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url) || url.includes("host=/");
const sql = postgres(url, { ssl: local ? false : "require", prepare: false, max: 1, onnotice: () => {} });
const dir = join(process.cwd(), "supabase", "migrations");
try {
  await sql`create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
  await sql`alter table public.schema_migrations enable row level security`;
  const done = new Set((await sql`select name from public.schema_migrations`).map(r => r.name));
  const files = (await readdir(dir)).filter(f => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (done.has(file)) continue;
    const body = await readFile(join(dir, file), "utf8");
    await sql.begin(async tx => {
      await tx.unsafe(body);
      await tx`insert into public.schema_migrations (name) values (${file})`;
    });
    console.log(`migrate: applied ${file}`);
  }
  console.log("migrate: database is up to date");
} catch (e) {
  console.error("migrate: failed:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
