"use client";

import { useState } from "react";
import { habitFormSchema, type HabitFormValues } from "@/lib/validations/schemas";
import { HABIT_COLORS, HABIT_ICONS, type Habit } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HabitIcon } from "@/components/habits/habit-icon";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { v: 1, l: "L" },
  { v: 2, l: "M" },
  { v: 3, l: "M" },
  { v: 4, l: "J" },
  { v: 5, l: "V" },
  { v: 6, l: "S" },
  { v: 0, l: "D" },
];

const defaults: HabitFormValues = {
  title: "",
  description: "",
  color: HABIT_COLORS[0],
  icon: "flame",
  frequency: "daily",
  days_of_week: [0, 1, 2, 3, 4, 5, 6],
  target_per_period: null,
};

function fromHabit(habit?: Habit | null): HabitFormValues {
  if (!habit) return defaults;
  return {
    title: habit.title,
    description: habit.description ?? "",
    color: habit.color,
    icon: habit.icon,
    frequency: habit.frequency,
    days_of_week: habit.days_of_week,
    target_per_period: habit.target_per_period,
  };
}

type Props = {
  habit?: Habit | null;
  onSubmit: (values: HabitFormValues) => Promise<void> | void;
  submitLabel?: string;
};

export function HabitForm({ habit, onSubmit, submitLabel = "Enregistrer" }: Props) {
  const [values, setValues] = useState<HabitFormValues>(() => fromHabit(habit));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = habitFormSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      await onSubmit(parsed.data);
    } finally {
      setPending(false);
    }
  }

  function toggleDay(day: number) {
    setValues((prev) => {
      const has = prev.days_of_week.includes(day);
      const days = has
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day];
      return { ...prev, days_of_week: days };
    });
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          placeholder="Ex. Lire 20 minutes"
          required
        />
        {errors.title && <p className="text-sm text-rose-700">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <Textarea
          id="description"
          value={values.description ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Couleur</Label>
        <div className="flex flex-wrap gap-2">
          {HABIT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Couleur ${color}`}
              className={cn(
                "size-8 rounded-full ring-offset-2",
                values.color === color && "ring-2 ring-teal-800",
              )}
              style={{ backgroundColor: color }}
              onClick={() => setValues((v) => ({ ...v, color }))}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Icône</Label>
        <div className="flex flex-wrap gap-2">
          {HABIT_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              aria-label={icon}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg border",
                values.icon === icon
                  ? "border-teal-800 bg-teal-900 text-white"
                  : "border-teal-900/10 bg-white text-teal-900",
              )}
              onClick={() => setValues((v) => ({ ...v, icon }))}
            >
              <HabitIcon name={icon} className="size-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frequency">Fréquence</Label>
        <select
          id="frequency"
          className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm"
          value={values.frequency}
          onChange={(e) => {
            const frequency = e.target.value as HabitFormValues["frequency"];
            setValues((v) => ({
              ...v,
              frequency,
              days_of_week:
                frequency === "daily"
                  ? [0, 1, 2, 3, 4, 5, 6]
                  : v.days_of_week.length
                    ? v.days_of_week
                    : [1, 2, 3, 4, 5],
            }));
          }}
        >
          <option value="daily">Tous les jours</option>
          <option value="weekly">Jours précis (hebdo)</option>
          <option value="custom">Personnalisé</option>
        </select>
      </div>

      {values.frequency !== "daily" && (
        <div className="space-y-2">
          <Label>Jours</Label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => (
              <button
                key={d.v}
                type="button"
                className={cn(
                  "size-9 rounded-full text-sm font-medium",
                  values.days_of_week.includes(d.v)
                    ? "bg-teal-900 text-white"
                    : "bg-teal-900/8 text-teal-950",
                )}
                onClick={() => toggleDay(d.v)}
              >
                {d.l}
              </button>
            ))}
          </div>
          {errors.days_of_week && (
            <p className="text-sm text-rose-700">{errors.days_of_week}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="target">Objectif / période (optionnel)</Label>
        <Input
          id="target"
          type="number"
          min={1}
          placeholder="Ex. 3"
          value={values.target_per_period ?? ""}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              target_per_period: e.target.value ? Number(e.target.value) : null,
            }))
          }
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enregistrement…" : submitLabel}
      </Button>
    </form>
  );
}
