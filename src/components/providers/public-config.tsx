"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicConfig } from "@/lib/public-config";

const PublicConfigContext = createContext<PublicConfig>({
  supabaseUrl: null,
  supabaseAnonKey: null,
  siteUrl: null,
  demoMode: true,
});

export function PublicConfigProvider({
  value,
  children,
}: {
  value: PublicConfig;
  children: ReactNode;
}) {
  return (
    <PublicConfigContext.Provider value={value}>{children}</PublicConfigContext.Provider>
  );
}

export function usePublicConfig(): PublicConfig {
  return useContext(PublicConfigContext);
}
