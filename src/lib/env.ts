import { getRuntimeSupabase } from "@/lib/runtime-supabase";

export function getSupabaseUrl(): string | undefined {
  return getRuntimeSupabase()?.url || process.env.NEXT_PUBLIC_SUPABASE_URL || undefined;
}

/** Accepts classic anon JWT key or new publishable key from Supabase Connect. */
export function getSupabaseAnonKey(): string | undefined {
  return (
    getRuntimeSupabase()?.key ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    undefined
  );
}

export function hasSupabaseEnv(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function isDemoMode(): boolean {
  return !hasSupabaseEnv();
}
