"use client";

import { useCompletions, useHabits, useTimezone } from "@/hooks/use-habits";
import {
  completionRate,
  computeStreaks,
  periodDates,
  todayInTimezone,
  addLocalDays,
} from "@/lib/habits";
import { HabitIcon } from "@/components/habits/habit-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export function StatsView() {
  const tz = useTimezone();
  const today = todayInTimezone(tz);
  const habitsQ = useHabits(false);
  const completionsQ = useCompletions(120);

  if (habitsQ.isLoading || completionsQ.isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  const habits = habitsQ.data ?? [];
  const completions = completionsQ.data ?? [];

  const weekDates = periodDates("week", today, tz, 1);
  const monthDates = periodDates("month", today, tz, 1);
  const last30 = Array.from({ length: 30 }, (_, i) => addLocalDays(today, -29 + i));

  const week = completionRate(habits, completions, weekDates, tz, today);
  const month = completionRate(habits, completions, monthDates, tz, today);
  const overall = completionRate(habits, completions, last30, tz, today);

  const perHabit = habits.map((habit) => {
    const hc = completions.filter((c) => c.habit_id === habit.id);
    const streaks = computeStreaks(habit, hc, tz, today);
    const rate = completionRate([habit], hc, last30, tz, today);
    return { habit, streaks, rate };
  });

  const bestCurrent = Math.max(0, ...perHabit.map((p) => p.streaks.current));
  const bestEver = Math.max(0, ...perHabit.map((p) => p.streaks.best));

  // Simple weekly evolution (last 6 weeks)
  const weeks = Array.from({ length: 6 }, (_, i) => {
    const anchor = addLocalDays(today, -7 * (5 - i));
    const dates = periodDates("week", anchor, tz, 1);
    const r = completionRate(habits, completions, dates, tz, today);
    return { label: `S${i + 1}`, rate: r.rate };
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-teal-950">
          Statistiques
        </h1>
        <p className="mt-1 text-sm text-teal-900/65">
          Taux réels, séries, évolution — pas de vanity metrics.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Taux (30 j)" value={`${Math.round(overall.rate * 100)}%`} hint={`${overall.done}/${overall.due}`} />
        <Metric label="Série actuelle" value={String(bestCurrent)} hint="meilleure en cours" />
        <Metric label="Meilleure série" value={String(bestEver)} hint="record personnel" />
        <Metric label="Semaine" value={`${Math.round(week.rate * 100)}%`} hint={`${week.done}/${week.due}`} />
      </section>

      <section className="rounded-3xl border border-teal-900/8 bg-white/75 p-5">
        <h2 className="font-heading text-lg font-semibold text-teal-950">Évolution (6 semaines)</h2>
        <div className="mt-4 flex h-32 items-end gap-2">
          {weeks.map((w) => (
            <div key={w.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-teal-700/85 transition-[height]"
                style={{ height: `${Math.max(4, Math.round(w.rate * 100))}%` }}
                title={`${Math.round(w.rate * 100)}%`}
              />
              <span className="text-[10px] text-teal-900/50">{w.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-teal-950">Par habitude</h2>
          <p className="text-xs text-teal-900/50">Mois : {Math.round(month.rate * 100)}%</p>
        </div>
        {perHabit.length === 0 ? (
          <p className="text-sm text-teal-900/55">Aucune habitude active.</p>
        ) : (
          <ul className="space-y-2">
            {perHabit.map(({ habit, streaks, rate }) => (
              <li
                key={habit.id}
                className="rounded-2xl border border-teal-900/8 bg-white/75 p-4"
              >
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className="flex size-9 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: habit.color }}
                  >
                    <HabitIcon name={habit.icon} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-teal-950">{habit.title}</p>
                    <p className="text-xs text-teal-900/55">
                      Série {streaks.current} · record {streaks.best}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-teal-900">
                    {Math.round(rate.rate * 100)}%
                  </span>
                </div>
                <Progress value={Math.round(rate.rate * 100)} className="h-1.5" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-teal-900/8 bg-white/75 p-4">
      <p className="text-xs uppercase tracking-wider text-teal-900/45">{label}</p>
      <p className="font-heading mt-1 text-2xl font-semibold text-teal-950">{value}</p>
      <p className="text-xs text-teal-900/50">{hint}</p>
    </div>
  );
}
