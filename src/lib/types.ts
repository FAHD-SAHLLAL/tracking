export type Frequency = "daily" | "weekly" | "custom";

export type Habit = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  color: string;
  icon: string | null;
  frequency: Frequency;
  /** 0 = Sunday … 6 = Saturday */
  days_of_week: number[];
  target_per_period: number | null;
  position: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type HabitCompletion = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_on: string; // YYYY-MM-DD in user timezone
  completed_at: string;
  note: string | null;
};

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  user_id: string;
  week_starts_on: number;
  theme_preference: "light" | "dark" | "system";
  reminder_defaults: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Reminder = {
  id: string;
  habit_id: string;
  user_id: string;
  time_local: string;
  days_of_week: number[];
  enabled: boolean;
  channel: string;
  created_at: string;
  updated_at: string;
};

export type DayStatus = "success" | "partial" | "missed" | "empty" | "future";

export type HabitDayOutcome = "completed" | "missed" | "incomplete" | "skipped";

export const HABIT_COLORS = [
  "#0F766E",
  "#0369A1",
  "#4338CA",
  "#A16207",
  "#BE123C",
  "#15803D",
  "#0E7490",
  "#C2410C",
] as const;

export const HABIT_ICONS = [
  "flame",
  "book",
  "dumbbell",
  "heart",
  "moon",
  "sun",
  "leaf",
  "droplets",
  "brain",
  "coffee",
] as const;
