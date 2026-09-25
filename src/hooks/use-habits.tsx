"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useState, type ReactNode, useEffect } from "react";
import { toast } from "sonner";
import * as api from "@/lib/data/api";
import { isDemoMode } from "@/lib/env";
import { setRuntimeSupabase } from "@/lib/runtime-supabase";
import { resetBrowserClient } from "@/lib/supabase/client";
import { demoRepo } from "@/lib/mock/demo-repo";
import { todayInTimezone, addLocalDays } from "@/lib/habits";
import type { HabitCompletion } from "@/lib/types";
import type { HabitFormValues } from "@/lib/validations/schemas";
import type { PublicConfig } from "@/lib/public-config";
import { PublicConfigProvider } from "@/components/providers/public-config";

export function Providers({
  children,
  publicConfig,
}: {
  children: ReactNode;
  publicConfig: PublicConfig;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    if (publicConfig.supabaseUrl && publicConfig.supabaseAnonKey) {
      setRuntimeSupabase(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey);
      resetBrowserClient();
    }
  }, [publicConfig.supabaseUrl, publicConfig.supabaseAnonKey]);

  // Sync before children render on client (first paint after hydrate)
  if (
    typeof window !== "undefined" &&
    publicConfig.supabaseUrl &&
    publicConfig.supabaseAnonKey
  ) {
    setRuntimeSupabase(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey);
  }

  return (
    <PublicConfigProvider value={publicConfig}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </PublicConfigProvider>
  );
}

export function useSession() {
  const demoSession =
    typeof window !== "undefined" && isDemoMode()
      ? (() => {
          const s = demoRepo.getSession();
          return s ? { id: s.userId, email: s.email } : undefined;
        })()
      : undefined;

  return useQuery({
    queryKey: ["session"],
    queryFn: api.getSessionUser,
    initialData: demoSession,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: api.fetchProfile,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: api.fetchSettings,
  });
}

export function useHabits(includeArchived = false) {
  const query = useQuery({
    queryKey: ["habits", { includeArchived }],
    queryFn: () => api.fetchHabits(includeArchived),
  });

  useEffect(() => {
    if (!isDemoMode()) return;
    return demoRepo.subscribe(() => {
      void query.refetch();
    });
  }, [query]);

  return query;
}

export function useTimezone() {
  const profile = useProfile();
  return (
    profile.data?.timezone ||
    (typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "Europe/Paris")
  );
}

export function useCompletions(rangeDays = 62) {
  const tz = useTimezone();
  const today = todayInTimezone(tz);
  const from = addLocalDays(today, -rangeDays);
  const to = today;

  return useQuery({
    queryKey: ["completions", from, to],
    queryFn: () => api.fetchCompletions(from, to),
  });
}

export function useToggleCompletion() {
  const qc = useQueryClient();
  const tz = useTimezone();

  return useMutation({
    mutationFn: ({ habitId, localDate }: { habitId: string; localDate: string }) =>
      api.toggleCompletion(habitId, localDate),
    onMutate: async ({ habitId, localDate }) => {
      await qc.cancelQueries({ queryKey: ["completions"] });
      const previous = qc.getQueriesData({ queryKey: ["completions"] });
      qc.setQueriesData(
        { queryKey: ["completions"] },
        (old: HabitCompletion[] | undefined) => {
          const list = old ?? [];
          const idx = list.findIndex(
            (c) => c.habit_id === habitId && c.completed_on === localDate,
          );
          if (idx >= 0) {
            return list.filter((_, i) => i !== idx);
          }
          return [
            ...list,
            {
              id: `optimistic-${habitId}-${localDate}`,
              habit_id: habitId,
              user_id: "optimistic",
              completed_on: localDate,
              completed_at: new Date().toISOString(),
              note: null,
            },
          ];
        },
      );
      return { previous, tz };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
      toast.error("Impossible de mettre à jour. Réessayez.");
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["completions"] });
    },
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: HabitFormValues) => api.createHabit(values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Habitude créée");
    },
    onError: () => toast.error("Création impossible"),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Parameters<typeof api.updateHabit>[1];
    }) => api.updateHabit(id, values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Habitude mise à jour");
    },
    onError: () => toast.error("Mise à jour impossible"),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteHabit(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["habits"] });
      void qc.invalidateQueries({ queryKey: ["completions"] });
      toast.success("Habitude supprimée");
    },
    onError: () => toast.error("Suppression impossible"),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profil enregistré");
    },
    onError: () => toast.error("Enregistrement impossible"),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateSettings,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Préférences enregistrées");
    },
    onError: () => toast.error("Enregistrement impossible"),
  });
}
