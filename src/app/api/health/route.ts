import { NextResponse } from "next/server";
import { getPublicConfig } from "@/lib/public-config";

export const dynamic = "force-dynamic";

/** Safe diagnostics — never returns secret values. */
export async function GET() {
  const config = getPublicConfig();
  return NextResponse.json({
    demoMode: config.demoMode,
    hasSupabaseUrl: Boolean(config.supabaseUrl),
    hasSupabaseKey: Boolean(config.supabaseAnonKey),
    siteUrlSet: Boolean(config.siteUrl),
    supabaseHost: config.supabaseUrl
      ? (() => {
          try {
            return new URL(config.supabaseUrl).host;
          } catch {
            return "invalid-url";
          }
        })()
      : null,
  });
}
