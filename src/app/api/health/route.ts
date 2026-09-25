import { NextResponse } from "next/server";
import { envValueLengths, getPublicConfig } from "@/lib/public-config";

export const dynamic = "force-dynamic";

/** Safe diagnostics — never returns secret values. */
export async function GET() {
  const config = getPublicConfig();
  const relatedKeys = Object.keys(process.env)
    .filter(
      (k) =>
        k.includes("SUPABASE") ||
        k.includes("SITE_URL") ||
        k.startsWith("NEXT_PUBLIC_"),
    )
    .sort();

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
    relatedEnvNames: relatedKeys,
    envValueLengths: envValueLengths(),
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}
