"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Habit } from "@/lib/types";
import { HabitIcon } from "@/components/habits/habit-icon";

type Props = {
  habit: Habit;
  completed: boolean;
  streak?: number;
  onToggle: () => void;
  disabled?: boolean;
};

export function HabitCheckRow({ habit, completed, streak, onToggle, disabled }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      layout={!reduce}
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors",
        completed
          ? "border-teal-700/20 bg-teal-50/80"
          : "border-teal-900/8 bg-white/75 hover:border-teal-800/20 hover:bg-white",
        disabled && "opacity-60",
      )}
      aria-pressed={completed}
      aria-label={`${completed ? "Décocher" : "Cocher"} ${habit.title}`}
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
        style={{ backgroundColor: habit.color }}
        aria-hidden
      >
        <HabitIcon name={habit.icon} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate font-medium text-teal-950", completed && "line-through opacity-70")}>
          {habit.title}
        </span>
        {typeof streak === "number" && streak > 0 && (
          <span className="text-xs text-teal-800/60">{streak} j. de suite</span>
        )}
      </span>
      <motion.span
        className={cn(
          "flex size-8 items-center justify-center rounded-full border-2",
          completed
            ? "border-teal-700 bg-teal-700 text-white"
            : "border-teal-900/20 bg-transparent text-transparent",
        )}
        animate={
          reduce
            ? undefined
            : completed
              ? { scale: [1, 1.15, 1] }
              : { scale: 1 }
        }
        transition={{ duration: 0.28 }}
      >
        <Check className="size-4" strokeWidth={3} />
      </motion.span>
    </motion.button>
  );
}
