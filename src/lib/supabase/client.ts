import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/env";

let browserClient: SupabaseClient | null = null;

export function resetBrowserClient() {
  browserClient = null;
}

export function createClient() {
  if (browserClient) return browserClient;

  if (!hasSupabaseEnv()) {
    throw new Error("Supabase env missing — use demo repository instead");
  }
  browserClient = createBrowserClient(getSupabaseUrl()!, getSupabaseAnonKey()!);
  return browserClient;
}
