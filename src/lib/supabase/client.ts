import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/env";

export function createClient() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase env missing — use demo repository instead");
  }
  return createBrowserClient(getSupabaseUrl()!, getSupabaseAnonKey()!);
}
