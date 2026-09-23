"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ChartColumn,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/data/api";
import { useQueryClient } from "@tanstack/react-query";
import { isDemoMode } from "@/lib/env";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Aujourd'hui", icon: LayoutDashboard },
  { href: "/habits", label: "Habitudes", icon: CheckCircle2 },
  { href: "/calendar", label: "Calendrier", icon: CalendarDays },
  { href: "/stats", label: "Stats", icon: ChartColumn },
  { href: "/profile", label: "Profil", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();

  async function handleLogout() {
    await signOut();
    await qc.clear();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(15,118,110,0.14),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(3,105,161,0.12),_transparent_50%),linear-gradient(180deg,#f4f7f6_0%,#eef3f2_45%,#e8eef0_100%)]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl motion-safe:animate-pulse" />
        <div className="absolute -right-16 bottom-32 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" />
      </div>

      {isDemoMode() && (
        <div className="border-b border-amber-500/30 bg-amber-50/90 px-4 py-2 text-center text-xs text-amber-950 backdrop-blur">
          Mode démo local — configurez Supabase via les variables d&apos;environnement pour la production.
        </div>
      )}

      <div className="mx-auto flex min-h-dvh max-w-6xl gap-0 md:gap-8 md:px-6 md:py-6">
        <aside className="sticky top-6 hidden h-[calc(100dvh-3rem)] w-56 shrink-0 flex-col rounded-2xl border border-teal-900/8 bg-white/70 p-4 shadow-sm backdrop-blur-md md:flex">
          <Link href="/dashboard" className="mb-8 px-2">
            <span className="font-heading text-2xl font-semibold tracking-tight text-teal-950">
              Rythme
            </span>
            <p className="mt-1 text-xs text-teal-900/55">Vos habitudes, sans bruit</p>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-teal-900 text-teal-50"
                      : "text-teal-950/70 hover:bg-teal-900/5 hover:text-teal-950",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Button
            variant="ghost"
            className="justify-start gap-3 text-teal-950/70"
            onClick={() => void handleLogout()}
          >
            <LogOut className="size-4" />
            Déconnexion
          </Button>
        </aside>

        <main className="flex-1 px-4 pb-24 pt-6 md:px-0 md:pb-6 md:pt-0">{children}</main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-teal-900/10 bg-white/90 backdrop-blur-md md:hidden"
        aria-label="Navigation principale"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium",
                    active ? "text-teal-800" : "text-teal-950/45",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
