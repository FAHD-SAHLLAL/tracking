import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import {
  addDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isAfter,
  isBefore,
  isEqual,
} from "date-fns";
import type { Frequency, Habit, HabitCompletion } from "@/lib/types";

/** Local calendar date YYYY-MM-DD in the given IANA timezone. */
export function localDateString(date: Date, timeZone: string): string {
  return formatInTimeZone(date, timeZone, "yyyy-MM-dd");
}

export function todayInTimezone(timeZone: string, now = new Date()): string {
  return localDateString(now, timeZone);
}

/** Weekday 0=Sun … 6=Sat in user timezone for a local date string. */
export function weekdayForLocalDate(localDate: string, timeZone: string): number {
  const instant = toZonedTime(`${localDate}T12:00:00`, timeZone);
  return instant.getDay();
}

export function parseLocalDate(localDate: string): Date {
  return parseISO(`${localDate}T12:00:00`);
}

export function addLocalDays(localDate: string, days: number): string {
  return format(addDays(parseLocalDate(localDate), days), "yyyy-MM-dd");
}

export function compareLocalDates(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function isHabitDueOn(
  habit: Pick<Habit, "frequency" | "days_of_week">,
  localDate: string,
  timeZone: string,
): boolean {
  const weekday = weekdayForLocalDate(localDate, timeZone);
  if (habit.frequency === "daily") return true;
  return habit.days_of_week.includes(weekday);
}

export function dueWeekdays(frequency: Frequency, days: number[]): number[] {
  if (frequency === "daily") return [0, 1, 2, 3, 4, 5, 6];
  return [...new Set(days)].sort((a, b) => a - b);
}

export type StreakResult = {
  current: number;
  best: number;
};

/**
 * Streak rules:
 * - Only due days count.
 * - Non-due days never break a streak.
 * - Current streak counts consecutive completed due days ending at today
 *   (if completed or not yet due-missed) or yesterday's last completed due day.
 */
export function computeStreaks(
  habit: Pick<Habit, "frequency" | "days_of_week" | "created_at">,
  completions: Pick<HabitCompletion, "completed_on">[],
  timeZone: string,
  today: string,
): StreakResult {
  const completedSet = new Set(completions.map((c) => c.completed_on));
  const createdOn = localDateString(new Date(habit.created_at), timeZone);
  const start = createdOn < today ? createdOn : today;

  // Walk from start → today to compute best + gather due history
  const dueDates: string[] = [];
  let cursor = start;
  while (compareLocalDates(cursor, today) <= 0) {
    if (isHabitDueOn(habit, cursor, timeZone)) {
      dueDates.push(cursor);
    }
    cursor = addLocalDays(cursor, 1);
  }

  let best = 0;
  let run = 0;
  for (const d of dueDates) {
    if (completedSet.has(d)) {
      run += 1;
      best = Math.max(best, run);
    } else if (d === today) {
      // today incomplete does not reset best mid-day; current handled below
      break;
    } else {
      run = 0;
    }
  }

  // Current streak: walk backwards from today
  let current = 0;
  for (let i = dueDates.length - 1; i >= 0; i -= 1) {
    const d = dueDates[i]!;
    if (d === today && !completedSet.has(d)) {
      // skip today if not done — streak may still continue from yesterday
      continue;
    }
    if (completedSet.has(d)) {
      current += 1;
    } else {
      break;
    }
  }

  return { current, best: Math.max(best, current) };
}

export function periodDates(
  kind: "week" | "month",
  anchorLocalDate: string,
  timeZone: string,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
): string[] {
  const anchor = parseLocalDate(anchorLocalDate);
  const range =
    kind === "week"
      ? {
          start: startOfWeek(anchor, { weekStartsOn }),
          end: endOfWeek(anchor, { weekStartsOn }),
        }
      : {
          start: startOfMonth(anchor),
          end: endOfMonth(anchor),
        };
  return eachDayOfInterval(range).map((d) => format(d, "yyyy-MM-dd"));
}

export function completionRate(
  habits: Pick<Habit, "id" | "frequency" | "days_of_week" | "archived_at" | "created_at">[],
  completions: Pick<HabitCompletion, "habit_id" | "completed_on">[],
  dates: string[],
  timeZone: string,
  today: string,
): { due: number; done: number; rate: number } {
  const byHabit = new Map<string, Set<string>>();
  for (const c of completions) {
    if (!byHabit.has(c.habit_id)) byHabit.set(c.habit_id, new Set());
    byHabit.get(c.habit_id)!.add(c.completed_on);
  }

  let due = 0;
  let done = 0;
  for (const habit of habits) {
    if (habit.archived_at) continue;
    const set = byHabit.get(habit.id) ?? new Set();
    const createdOn = localDateString(new Date(habit.created_at), timeZone);
    for (const d of dates) {
      if (compareLocalDates(d, today) > 0) continue;
      if (compareLocalDates(d, createdOn) < 0) continue;
      if (!isHabitDueOn(habit, d, timeZone)) continue;
      due += 1;
      if (set.has(d)) done += 1;
    }
  }
  return { due, done, rate: due === 0 ? 0 : done / due };
}

export function dayAggregateStatus(
  dueCount: number,
  doneCount: number,
  localDate: string,
  today: string,
): "success" | "partial" | "missed" | "empty" | "future" {
  if (compareLocalDates(localDate, today) > 0) return "future";
  if (dueCount === 0) return "empty";
  if (doneCount === dueCount) return "success";
  if (doneCount > 0) return "partial";
  if (localDate === today) return "partial"; // incomplete today, not missed yet
  return "missed";
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  const d = parseLocalDate(date);
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  return (
    (isAfter(d, s) || isEqual(d, s)) && (isBefore(d, e) || isEqual(d, e))
  );
}
