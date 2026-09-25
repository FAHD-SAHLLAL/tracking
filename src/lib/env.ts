import { getRuntimeSupabase } from "@/lib/runtime-supabase";

/**
 * Read env by dynamic key so Next.js does not inline empty NEXT_PUBLIC_* at build time.
 * (Static process.env.NEXT_PUBLIC_FOO is replaced at build; bracket access stays runtime.)
 */
function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getSupabaseUrl(): string | undefined {
  return (
    getRuntimeSupabase()?.url ||
    readEnv("NEXT_PUBLIC_SUPABASE_URL") ||
    readEnv("SUPABASE_URL") ||
    undefined
  );
}

/** Accepts classic anon JWT key or new publishable key from Supabase Connect. */
export function getSupabaseAnonKey(): string | undefined {
  return (
    getRuntimeSupabase()?.key ||
    readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("SUPABASE_ANON_KEY") ||
    readEnv("SUPABASE_PUBLISHABLE_KEY") ||
    undefined
  );
}

export function hasSupabaseEnv(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function isDemoMode(): boolean {
  return !hasSupabaseEnv();
}
