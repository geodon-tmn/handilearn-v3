import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "@/lib/supabase/env";

/** Keeps the Supabase sign-in fresh on every page request, and sends signed-out
 *  visitors away from the admin and account areas. */
export async function proxy(request: NextRequest) {
  if (!supabaseConfigured) return NextResponse.next();
  const url = supabaseUrl, key = supabaseAnonKey;
  let response = NextResponse.next({ request });
  try {
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (!user && (path.startsWith("/admin") || path.startsWith("/account"))) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(login);
  }
  return response;
  } catch (e) {
    // Never take the whole site down because the sign-in check failed;
    // the protected pages still check again on the server.
    console.error("proxy: Supabase session check failed:", e instanceof Error ? e.message : e);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.svg|brand/|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)"],
};
