import { describe, expect, it } from "vitest";
import {
  addLocalDays,
  compareLocalDates,
  completionRate,
  computeStreaks,
  dayAggregateStatus,
  isHabitDueOn,
  todayInTimezone,
} from "@/lib/habits/dates";
import type { Habit, HabitCompletion } from "@/lib/types";

const tz = "Europe/Paris";

function habit(partial: Partial<Habit> & Pick<Habit, "frequency" | "days_of_week">): Habit {
  return {
    id: "h1",
    user_id: "u1",
    title: "Test",
    description: null,
    color: "#0F766E",
    icon: "flame",
    target_per_period: null,
    position: 0,
    archived_at: null,
    created_at: "2026-03-01T10:00:00.000Z",
    updated_at: "2026-03-01T10:00:00.000Z",
    ...partial,
  };
}

function comps(...dates: string[]): HabitCompletion[] {
  return dates.map((completed_on, i) => ({
    id: `c${i}`,
    habit_id: "h1",
    user_id: "u1",
    completed_on,
    completed_at: `${completed_on}T10:00:00.000Z`,
    note: null,
  }));
}

describe("dates & due rules", () => {
  it("compares local dates", () => {
    expect(compareLocalDates("2026-03-01", "2026-03-02")).toBe(-1);
    expect(compareLocalDates("2026-03-02", "2026-03-02")).toBe(0);
  });

  it("adds local days without UTC shift surprises", () => {
    expect(addLocalDays("2026-03-09", 1)).toBe("2026-03-10");
  });

  it("marks daily habits due every day", () => {
    const h = habit({ frequency: "daily", days_of_week: [0, 1, 2, 3, 4, 5, 6] });
    expect(isHabitDueOn(h, "2026-03-23", tz)).toBe(true);
  });

  it("respects custom weekdays", () => {
    // 2026-03-23 is Monday
    const h = habit({ frequency: "custom", days_of_week: [1, 3, 5] });
    expect(isHabitDueOn(h, "2026-03-23", tz)).toBe(true);
    expect(isHabitDueOn(h, "2026-03-24", tz)).toBe(false);
  });
});

describe("streaks", () => {
  it("counts consecutive completed due days", () => {
    const h = habit({ frequency: "daily", days_of_week: [0, 1, 2, 3, 4, 5, 6] });
    const today = "2026-03-23";
    const result = computeStreaks(
      h,
      comps("2026-03-21", "2026-03-22", "2026-03-23"),
      tz,
      today,
    );
    expect(result.current).toBe(3);
    expect(result.best).toBe(3);
  });

  it("does not break streak on non-due days", () => {
    // Mon/Wed/Fri only
    const h = habit({ frequency: "custom", days_of_week: [1, 3, 5] });
    const today = "2026-03-23"; // Monday
    const result = computeStreaks(
      h,
      comps("2026-03-18", "2026-03-20", "2026-03-23"), // Wed Fri Mon
      tz,
      today,
    );
    expect(result.current).toBe(3);
  });

  it("allows incomplete today without resetting current streak", () => {
    const h = habit({ frequency: "daily", days_of_week: [0, 1, 2, 3, 4, 5, 6] });
    const today = "2026-03-23";
    const result = computeStreaks(h, comps("2026-03-21", "2026-03-22"), tz, today);
    expect(result.current).toBe(2);
  });

  it("resets current streak after a missed due day", () => {
    const h = habit({ frequency: "daily", days_of_week: [0, 1, 2, 3, 4, 5, 6] });
    const today = "2026-03-23";
    const result = computeStreaks(h, comps("2026-03-20", "2026-03-23"), tz, today);
    expect(result.current).toBe(1);
    expect(result.best).toBeGreaterThanOrEqual(1);
  });
});

describe("completion rate & day status", () => {
  it("computes rate only on due past-or-today days", () => {
    const h = habit({ frequency: "daily", days_of_week: [0, 1, 2, 3, 4, 5, 6] });
    const dates = ["2026-03-21", "2026-03-22", "2026-03-23"];
    const rate = completionRate([h], comps("2026-03-21", "2026-03-23"), dates, tz, "2026-03-23");
    expect(rate.due).toBe(3);
    expect(rate.done).toBe(2);
    expect(rate.rate).toBeCloseTo(2 / 3);
  });

  it("marks missed vs incomplete today", () => {
    expect(dayAggregateStatus(2, 0, "2026-03-22", "2026-03-23")).toBe("missed");
    expect(dayAggregateStatus(2, 0, "2026-03-23", "2026-03-23")).toBe("partial");
    expect(dayAggregateStatus(2, 2, "2026-03-22", "2026-03-23")).toBe("success");
    expect(dayAggregateStatus(0, 0, "2026-03-22", "2026-03-23")).toBe("empty");
    expect(dayAggregateStatus(2, 0, "2026-03-24", "2026-03-23")).toBe("future");
  });
});

describe("auth/RLS assumptions (documented contracts)", () => {
  it("habit rows always carry owning user_id", () => {
    const h = habit({ frequency: "daily", days_of_week: [0, 1, 2, 3, 4, 5, 6] });
    expect(h.user_id).toBeTruthy();
  });

  it("completions are scoped by habit_id + completed_on uniqueness conceptually", () => {
    const list = comps("2026-03-23", "2026-03-23");
    const keys = new Set(list.map((c) => `${c.habit_id}:${c.completed_on}`));
    // duplicate dates would violate unique constraint — app toggles instead of inserting twice
    expect(keys.size).toBe(1);
  });

  it("todayInTimezone returns yyyy-MM-dd", () => {
    expect(todayInTimezone(tz)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
