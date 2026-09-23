"use client";

import { HabitCheckRow } from "@/components/habits/habit-check-row";
import {
  useCompletions,
  useHabits,
  useTimezone,
  useToggleCompletion,
} from "@/hooks/use-habits";
import {
  computeStreaks,
  isHabitDueOn,
  todayInTimezone,
  completionRate,
  periodDates,
} from "@/lib/habits";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function DashboardView() {
  const tz = useTimezone();
  const today = todayInTimezone(tz);
  const habitsQ = useHabits(false);
  const completionsQ = useCompletions(40);
  const toggle = useToggleCompletion();
  const reduce = useReducedMotion();

  if (habitsQ.isLoading || completionsQ.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    );
  }

  if (habitsQ.isError || completionsQ.isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
        Impossible de charger vos données.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => {
            void habitsQ.refetch();
            void completionsQ.refetch();
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  const habits = habitsQ.data ?? [];
  const completions = completionsQ.data ?? [];
  const dueToday = habits.filter((h) => isHabitDueOn(h, today, tz));
  const doneIds = new Set(
    completions.filter((c) => c.completed_on === today).map((c) => c.habit_id),
  );
  const done = dueToday.filter((h) => doneIds.has(h.id)).length;
  const remaining = dueToday.length - done;
  const progress = dueToday.length === 0 ? 0 : Math.round((done / dueToday.length) * 100);

  const weekDates = periodDates("week", today, tz, 1);
  const week = completionRate(habits, completions, weekDates, tz, today);

  const recent = [...completions]
    .sort((a, b) => b.completed_at.localeCompare(a.completed_at))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-sm text-teal-900/55">
          {format(parseISO(`${today}T12:00:00`), "EEEE d MMMM", { locale: fr })}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-teal-950 md:text-4xl">
          Aujourd&apos;hui
        </h1>
        <p className="max-w-xl text-sm text-teal-900/65">
          {dueToday.length === 0
            ? "Aucune habitude prévue — respirez ou ajoutez-en une."
            : remaining === 0
              ? "Tout est fait pour aujourd'hui. Belle constance."
              : `${done} faites · ${remaining} restantes`}
        </p>
      </header>

      <motion.section
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-teal-900/8 bg-white/70 p-5 shadow-sm backdrop-blur"
      >
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-teal-900/45">
              Progression du jour
            </p>
            <p className="font-heading text-3xl font-semibold text-teal-950">{progress}%</p>
          </div>
          <div className="text-right text-sm text-teal-900/60">
            <p>Semaine : {Math.round(week.rate * 100)}%</p>
            <p>
              {week.done}/{week.due} dues
            </p>
          </div>
        </div>
        <Progress value={progress} className="h-2.5" />
      </motion.section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-teal-950">Habitudes du jour</h2>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/habits" />}
          >
            Gérer
          </Button>
        </div>
        {dueToday.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-teal-900/15 bg-white/50 p-6 text-center">
            <p className="text-sm text-teal-900/65">Rien de planifié aujourd&apos;hui.</p>
            <Button
              className="mt-3"
              nativeButton={false}
              render={<Link href="/habits" />}
            >
              Ajouter une habitude
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {dueToday.map((habit) => {
              const streak = computeStreaks(
                habit,
                completions.filter((c) => c.habit_id === habit.id),
                tz,
                today,
              ).current;
              return (
                <li key={habit.id}>
                  <HabitCheckRow
                    habit={habit}
                    completed={doneIds.has(habit.id)}
                    streak={streak}
                    disabled={toggle.isPending}
                    onToggle={() =>
                      toggle.mutate({ habitId: habit.id, localDate: today })
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Faites" value={String(done)} />
        <StatTile label="Restantes" value={String(Math.max(remaining, 0))} />
        <StatTile
          label="Meilleure série (active)"
          value={String(
            Math.max(
              0,
              ...habits.map(
                (h) =>
                  computeStreaks(
                    h,
                    completions.filter((c) => c.habit_id === h.id),
                    tz,
                    today,
                  ).best,
              ),
            ),
          )}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold text-teal-950">Historique récent</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-teal-900/55">Pas encore de complétions.</p>
        ) : (
          <ul className="divide-y divide-teal-900/8 overflow-hidden rounded-2xl border border-teal-900/8 bg-white/70">
            {recent.map((c) => {
              const habit = habits.find((h) => h.id === c.habit_id);
              return (
                <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-medium text-teal-950">{habit?.title ?? "Habitude"}</span>
                  <span className="text-teal-900/55">{c.completed_on}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-teal-900/8 bg-white/70 p-4">
      <p className="text-xs uppercase tracking-wider text-teal-900/45">{label}</p>
      <p className="font-heading mt-1 text-2xl font-semibold text-teal-950">{value}</p>
    </div>
  );
}
