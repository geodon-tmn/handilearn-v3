export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
/** False until the Supabase variables are set in Vercel (or .env.local). */
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
