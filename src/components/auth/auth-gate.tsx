"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-habits";
import { isDemoMode } from "@/lib/env";
import { demoRepo } from "@/lib/mock/demo-repo";
import { Skeleton } from "@/components/ui/skeleton";

/** Client gate for demo mode (middleware only enforces when Supabase env is set). */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const [demoReady, setDemoReady] = useState(() => !isDemoMode());

  useEffect(() => {
    if (!isDemoMode()) {
      setDemoReady(true);
      return;
    }
    const local = demoRepo.getSession();
    setDemoReady(true);
    if (!local && !session.isLoading && !session.data) {
      router.replace("/login");
    }
  }, [session.data, session.isLoading, router]);

  if (isDemoMode()) {
    const local = typeof window !== "undefined" ? demoRepo.getSession() : null;
    const authed = Boolean(local || session.data);
    if (!demoReady || (!authed && session.isLoading)) {
      return (
        <div className="space-y-3 p-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      );
    }
    if (!authed) {
      return (
        <div className="space-y-3 p-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      );
    }
  }

  return <>{children}</>;
}
