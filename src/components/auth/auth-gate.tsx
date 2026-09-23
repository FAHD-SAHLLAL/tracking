"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-habits";
import { isDemoMode } from "@/lib/env";
import { Skeleton } from "@/components/ui/skeleton";

/** Client gate for demo mode (middleware only enforces when Supabase env is set). */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isDemoMode()) return;
    if (session.isLoading) return;
    if (!session.data) {
      router.replace("/login");
    }
  }, [session.data, session.isLoading, router]);

  if (isDemoMode() && (session.isLoading || !session.data)) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return <>{children}</>;
}
