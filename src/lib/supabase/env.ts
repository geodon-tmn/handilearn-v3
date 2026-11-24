export const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
export const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
/** False until valid Supabase settings are present. /status explains what's wrong. */
export const supabaseConfigured = /^https?:\/\/\S+$/.test(supabaseUrl) && Boolean(supabaseAnonKey);
