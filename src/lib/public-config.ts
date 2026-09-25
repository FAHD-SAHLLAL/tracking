import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

export type PublicConfig = {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  siteUrl: string | null;
  demoMode: boolean;
};

export function getPublicConfig(): PublicConfig {
  const supabaseUrl = getSupabaseUrl() ?? null;
  const supabaseAnonKey = getSupabaseAnonKey() ?? null;
  return {
    supabaseUrl,
    supabaseAnonKey,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    demoMode: !(supabaseUrl && supabaseAnonKey),
  };
}
