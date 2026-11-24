import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

/** Supabase client for server components, server actions and route handlers.
 *  Acts as the signed-in person, so row-level security applies. */
export async function createClient() {
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* Server components cannot set cookies; the proxy refreshes them. */ }
      },
    },
  });
}
