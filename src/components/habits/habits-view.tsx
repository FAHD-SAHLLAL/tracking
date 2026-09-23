"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useCreateHabit,
  useDeleteHabit,
  useHabits,
  useUpdateHabit,
} from "@/hooks/use-habits";
import { HabitForm } from "@/components/habits/habit-form";
import { HabitIcon } from "@/components/habits/habit-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Habit } from "@/lib/types";
import type { HabitFormValues } from "@/lib/validations/schemas";

export function HabitsView() {
  const active = useHabits(false);
  const archived = useHabits(true);
  const create = useCreateHabit();
  const update = useUpdateHabit();
  const remove = useDeleteHabit();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  if (active.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  const habits = active.data ?? [];
  const archivedHabits = (archived.data ?? []).filter((h) => h.archived_at);

  async function onCreate(values: HabitFormValues) {
    await create.mutateAsync(values);
    setOpen(false);
  }

  async function onEdit(values: HabitFormValues) {
    if (!editing) return;
    await update.mutateAsync({ id: editing.id, values });
    setEditing(null);
  }

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-teal-950">
            Habitudes
          </h1>
          <p className="mt-1 text-sm text-teal-900/65">
            Créez, archivez, réactivez — sans surcharge.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>Nouvelle</DialogTrigger>
          {/* DialogTrigger uses Base UI render prop */}
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvelle habitude</DialogTitle>
            </DialogHeader>
            <HabitForm onSubmit={onCreate} submitLabel="Créer" />
          </DialogContent>
        </Dialog>
      </header>

      {habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-teal-900/15 bg-white/50 p-8 text-center">
          <p className="text-sm text-teal-900/65">
            Commencez par une seul habitude réaliste.
          </p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            Créer ma première
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className="flex items-center gap-3 rounded-2xl border border-teal-900/8 bg-white/75 p-3"
            >
              <span
                className="flex size-10 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: habit.color }}
              >
                <HabitIcon name={habit.icon} className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-teal-950">{habit.title}</p>
                <p className="text-xs text-teal-900/55">
                  {habit.frequency === "daily"
                    ? "Tous les jours"
                    : `${habit.days_of_week.length} jours / semaine`}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing(habit)}>
                  Éditer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    update.mutate({
                      id: habit.id,
                      values: { archived_at: new Date().toISOString() },
                    })
                  }
                >
                  Archiver
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {archivedHabits.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-teal-950">Archivées</h2>
          <ul className="space-y-2">
            {archivedHabits.map((habit) => (
              <li
                key={habit.id}
                className="flex items-center justify-between rounded-2xl border border-teal-900/8 bg-white/50 px-3 py-2 text-sm"
              >
                <span className="text-teal-900/70">{habit.title}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      update.mutate({ id: habit.id, values: { archived_at: null } })
                    }
                  >
                    Réactiver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-700"
                    onClick={() => {
                      if (confirm("Supprimer définitivement ?")) {
                        remove.mutate(habit.id);
                      }
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;habitude</DialogTitle>
          </DialogHeader>
          {editing && <HabitForm habit={editing} onSubmit={onEdit} />}
        </DialogContent>
      </Dialog>

      <p className="text-center text-xs text-teal-900/45">
        Astuce : cochez depuis{" "}
        <Link href="/dashboard" className="underline">
          Aujourd&apos;hui
        </Link>
        .
      </p>
    </div>
  );
}
