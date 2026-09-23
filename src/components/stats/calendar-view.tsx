"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompletions, useHabits, useTimezone } from "@/hooks/use-habits";
import {
  dayAggregateStatus,
  isHabitDueOn,
  todayInTimezone,
} from "@/lib/habits";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const STATUS_CLASS = {
  success: "bg-teal-700 text-white",
  partial: "bg-amber-400/90 text-amber-950",
  missed: "bg-rose-400/80 text-rose-950",
  empty: "bg-teal-900/5 text-teal-900/40",
  future: "bg-transparent text-teal-900/30",
} as const;

export function CalendarView() {
  const tz = useTimezone();
  const today = todayInTimezone(tz);
  const [cursor, setCursor] = useState(() => parseISO(`${today}T12:00:00`));
  const habitsQ = useHabits(false);
  const completionsQ = useCompletions(400);

  const days = useMemo(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  if (habitsQ.isLoading || completionsQ.isLoading) {
    return <Skeleton className="h-80 w-full rounded-2xl" />;
  }

  const habits = habitsQ.data ?? [];
  const completions = completionsQ.data ?? [];

  const startPad = (days[0]?.getDay() + 6) % 7; // Monday-first

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-teal-950">
          Calendrier
        </h1>
        <p className="mt-1 text-sm text-teal-900/65">
          Succès, partiel, manqué — au fil des semaines.
        </p>
      </header>

      <div className="rounded-3xl border border-teal-900/8 bg-white/75 p-4 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mois précédent"
            onClick={() => setCursor((d) => subMonths(d, 1))}
          >
            <ChevronLeft />
          </Button>
          <h2 className="font-heading text-lg font-semibold capitalize text-teal-950">
            {format(cursor, "MMMM yyyy", { locale: fr })}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mois suivant"
            onClick={() => setCursor((d) => addMonths(d, 1))}
          >
            <ChevronRight />
          </Button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-teal-900/45">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={`${d}-${i}`}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const local = format(day, "yyyy-MM-dd");
            let due = 0;
            let done = 0;
            for (const habit of habits) {
              if (!isHabitDueOn(habit, local, tz)) continue;
              due += 1;
              if (
                completions.some(
                  (c) => c.habit_id === habit.id && c.completed_on === local,
                )
              ) {
                done += 1;
              }
            }
            const status = dayAggregateStatus(due, done, local, today);
            const isToday = local === today;
            return (
              <div
                key={local}
                title={`${local}: ${done}/${due}`}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-xl text-xs font-medium",
                  STATUS_CLASS[status],
                  isToday && "ring-2 ring-teal-900 ring-offset-2",
                )}
              >
                {format(day, "d")}
              </div>
            );
          })}
        </div>

        <ul className="mt-5 flex flex-wrap gap-3 text-xs text-teal-900/70">
          <Legend swatch="bg-teal-700" label="Succès" />
          <Legend swatch="bg-amber-400" label="Partiel / en cours" />
          <Legend swatch="bg-rose-400" label="Manqué" />
          <Legend swatch="bg-teal-900/10" label="Rien de dû" />
        </ul>
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={cn("size-3 rounded-sm", swatch)} />
      {label}
    </li>
  );
}
