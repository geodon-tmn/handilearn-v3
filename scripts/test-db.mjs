// Tests the migrations and row-level security against a disposable local
// Postgres (TEST_DB_URL). Supabase's auth schema and roles are imitated.
// Usage: TEST_DB_URL=postgres://... npm run test:db
import { execFileSync } from "node:child_process";
import postgres from "postgres";

const url = process.env.TEST_DB_URL;
if (!url) { console.error("Set TEST_DB_URL to an empty local database"); process.exit(1); }
const sql = postgres(url, { max: 1, onnotice: () => {} });

const shim = `
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end $$;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}'::jsonb);
create or replace function auth.jwt() returns jsonb language sql stable as $f$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $f$;
create or replace function auth.uid() returns uuid language sql stable as $f$ select nullif(auth.jwt() ->> 'sub', '')::uuid $f$;
grant usage on schema auth to anon, authenticated;`;

let failures = 0;
const check = (name, ok) => { console.log(`${ok ? "✓" : "✗"} ${name}`); if (!ok) failures++; };
async function as(role, claims, fn) {
  try {
    return await sql.begin(async tx => {
      await tx.unsafe(`set local role ${role}`);
      await tx`select set_config('request.jwt.claims', ${JSON.stringify(claims ?? {})}, true)`;
      return await fn(tx);
    });
  } catch (e) { return { error: e.message }; }
}

try {
  await sql.unsafe(shim);
  execFileSync("node", ["scripts/migrate.mjs"], { env: { ...process.env, SUPABASE_DB_URL: url }, stdio: "inherit" });
  execFileSync("node", ["scripts/migrate.mjs"], { env: { ...process.env, SUPABASE_DB_URL: url }, stdio: "ignore" });
  check("migrations are idempotent", true);

  const [a] = await sql`insert into auth.users (email, raw_user_meta_data) values ('admin@test.local', '{"full_name":"Ada Admin"}') returning id`;
  const [b] = await sql`insert into auth.users (email) values ('parent@test.local') returning id`;
  const [pa] = await sql`select * from public.profiles where id = ${a.id}`;
  check("sign-up creates a parent profile with the name", pa?.role === "parent" && pa.full_name === "Ada Admin");
  await sql`update public.profiles set role = 'global_admin' where id = ${a.id}`;
  check("server-side setup can make the first administrator", (await sql`select role from public.profiles where id = ${a.id}`)[0].role === "global_admin");

  const admin1 = { sub: a.id, aal: "aal1" }, admin2 = { sub: a.id, aal: "aal2" }, parent = { sub: b.id, aal: "aal2" };
  check("seed territories present", (await sql`select count(*)::int n from public.territories`)[0].n === 4);
  const anonRead = await as("anon", {}, tx => tx`select code from public.territories`);
  check("anyone can read territories", Array.isArray(anonRead) && anonRead.length === 4);
  const aal1 = await as("authenticated", admin1, tx => tx`insert into public.territories (code, name) values ('GD', 'Grenada') returning code`);
  check("admin without two-factor cannot add a territory", !!aal1.error || aal1.length === 0);
  const aal2 = await as("authenticated", admin2, tx => tx`insert into public.territories (code, name) values ('GD', 'Grenada') returning code`);
  check("admin with two-factor adds a territory", Array.isArray(aal2) && aal2[0]?.code === "GD");
  const parentWrite = await as("authenticated", parent, tx => tx`insert into public.territories (code, name) values ('LC', 'Saint Lucia') returning code`);
  check("parent cannot add a territory", !!parentWrite.error);
  const parentProfiles = await as("authenticated", parent, tx => tx`select id from public.profiles`);
  check("parent sees only their own profile", Array.isArray(parentProfiles) && parentProfiles.length === 1 && parentProfiles[0].id === b.id);
  const selfPromote = await as("authenticated", parent, tx => tx`update public.profiles set role = 'global_admin' where id = ${b.id}`);
  check("parent cannot change their own role", !!selfPromote.error);
  const nameEdit = await as("authenticated", parent, tx => tx`update public.profiles set full_name = 'Pat Parent' where id = ${b.id} returning full_name`);
  check("parent can edit their own name", Array.isArray(nameEdit) && nameEdit[0]?.full_name === "Pat Parent");
  const promote = await as("authenticated", admin2, tx => tx`update public.profiles set role = 'teacher' where id = ${b.id} returning role`);
  check("admin changes another person's role", Array.isArray(promote) && promote[0]?.role === "teacher");
  const demoteSelf = await as("authenticated", admin2, tx => tx`update public.profiles set role = 'parent' where id = ${a.id}`);
  check("admin cannot change their own role", !!demoteSelf.error);
  await as("authenticated", admin2, tx => tx`select public.log_action('territory.added', 'Grenada')`);
  const adminAudit = await as("authenticated", admin2, tx => tx`select action, actor_id from public.audit_log`);
  check("audit entry recorded with the caller as actor", Array.isArray(adminAudit) && adminAudit.some(r => r.action === "territory.added" && r.actor_id === a.id));
  const parentAudit = await as("authenticated", parent, tx => tx`select id from public.audit_log`);
  check("non-admins cannot read the audit log", Array.isArray(parentAudit) && parentAudit.length === 0);
  const anonLog = await as("anon", {}, tx => tx`select public.log_action('x')`);
  check("signed-out callers cannot write the audit log", !!anonLog.error);
  const twoOwners = await as("authenticated", admin2, async tx => {
    const [sys] = await tx`select id from public.education_systems where code = 'CSEC'`;
    const [sch] = await tx`insert into public.schools (name, territory_code) values ('Test School', 'BB') returning id`;
    return tx`insert into public.curricula (subject, school_id, education_system_id) values ('Maths', ${sch.id}, ${sys.id})`;
  });
  check("a curriculum cannot belong to both a school and a system", !!twoOwners.error);
  const draftHidden = await as("authenticated", admin2, async tx => {
    const [sys] = await tx`select id from public.education_systems where code = 'CSEC'`;
    await tx`insert into public.curricula (subject, education_system_id) values ('Maths', ${sys.id})`;
    return "ok";
  });
  const parentCurricula = await as("authenticated", parent, tx => tx`select id from public.curricula`);
  check("draft curricula are hidden from non-admins", draftHidden === "ok" && Array.isArray(parentCurricula) && parentCurricula.length === 0);
} catch (e) {
  console.error(e); failures++;
} finally {
  await sql.end();
}
console.log(failures ? `\n${failures} check(s) failed` : "\nAll database checks passed");
process.exit(failures ? 1 : 0);
