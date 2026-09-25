import { envValueLengths, getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

export type PublicConfig = {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  siteUrl: string | null;
  demoMode: boolean;
};

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getPublicConfig(): PublicConfig {
  const supabaseUrl = getSupabaseUrl() ?? null;
  const supabaseAnonKey = getSupabaseAnonKey() ?? null;
  return {
    supabaseUrl,
    supabaseAnonKey,
    siteUrl: readEnv("NEXT_PUBLIC_SITE_URL") ?? readEnv("SITE_URL") ?? null,
    demoMode: !(supabaseUrl && supabaseAnonKey),
  };
}

export { envValueLengths };
