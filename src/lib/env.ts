import { getRuntimeSupabase } from "@/lib/runtime-supabase";

/**
 * Dynamic env read — avoids Next.js build-time inlining of NEXT_PUBLIC_*.
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
    // Prefer non-public names (never inlined empty at build)
    readEnv("SUPABASE_URL") ||
    readEnv("NEXT_PUBLIC_SUPABASE_URL") ||
    undefined
  );
}

/** Accepts classic anon JWT key or new publishable key from Supabase Connect. */
export function getSupabaseAnonKey(): string | undefined {
  return (
    getRuntimeSupabase()?.key ||
    readEnv("SUPABASE_ANON_KEY") ||
    readEnv("SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
    undefined
  );
}

export function hasSupabaseEnv(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function isDemoMode(): boolean {
  return !hasSupabaseEnv();
}

/** Debug-only lengths — never return values. */
export function envValueLengths() {
  const names = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SITE_URL",
  ] as const;
  const lengths: Record<string, number | null> = {};
  for (const name of names) {
    const raw = process.env[name];
    lengths[name] = typeof raw === "string" ? raw.length : null;
  }
  return lengths;
}
