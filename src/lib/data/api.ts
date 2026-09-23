"use client";

import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { demoRepo } from "@/lib/mock/demo-repo";
import type { Habit, HabitCompletion, Profile, UserSettings } from "@/lib/types";
import type { HabitFormValues } from "@/lib/validations/schemas";

export type SessionUser = {
  id: string;
  email: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  if (isDemoMode()) {
    const s = demoRepo.getSession();
    return s ? { id: s.userId, email: s.email } : null;
  }
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return null;
  return { id: data.user.id, email: data.user.email };
}

export async function signIn(email: string, password: string) {
  if (isDemoMode()) {
    await demoRepo.signIn(email, password);
    return;
  }
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email: string, password: string, displayName: string, timezone: string) {
  if (isDemoMode()) {
    await demoRepo.signUp(email, password, displayName);
    return;
  }
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, timezone },
    },
  });
  if (error) throw error;
}

export async function signOut() {
  if (isDemoMode()) {
    await demoRepo.signOut();
    return;
  }
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(email: string) {
  if (isDemoMode()) {
    return demoRepo.requestPasswordReset(email);
  }
  const supabase = createClient();
  const redirectTo = `${window.location.origin}/reset-password/update`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  if (isDemoMode()) {
    return;
  }
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function fetchProfile(): Promise<Profile | null> {
  if (isDemoMode()) return demoRepo.getProfile();
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(
  patch: Partial<Pick<Profile, "display_name" | "timezone" | "avatar_url">>,
) {
  if (isDemoMode()) return demoRepo.updateProfile(patch);
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) throw new Error("Non authentifié");
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function fetchSettings(): Promise<UserSettings | null> {
  if (isDemoMode()) return demoRepo.getSettings();
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateSettings(
  patch: Partial<Pick<UserSettings, "week_starts_on" | "theme_preference">>,
) {
  if (isDemoMode()) return demoRepo.updateSettings(patch);
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) throw new Error("Non authentifié");
  const { data, error } = await supabase
    .from("user_settings")
    .update(patch)
    .eq("user_id", user.id)
    .select("*")
    .single();
  if (error) throw error;
  return data as UserSettings;
}

export async function fetchHabits(includeArchived = false): Promise<Habit[]> {
  if (isDemoMode()) return demoRepo.listHabits(includeArchived);
  const supabase = createClient();
  let query = supabase.from("habits").select("*").order("position", { ascending: true });
  if (!includeArchived) query = query.is("archived_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Habit[];
}

export async function createHabit(values: HabitFormValues): Promise<Habit> {
  if (isDemoMode()) return demoRepo.createHabit(values);
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) throw new Error("Non authentifié");
  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: user.id,
      title: values.title,
      description: values.description || null,
      color: values.color,
      icon: values.icon ?? null,
      frequency: values.frequency,
      days_of_week: values.days_of_week,
      target_per_period: values.target_per_period ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Habit;
}

export async function updateHabit(
  id: string,
  values: Partial<HabitFormValues> & { archived_at?: string | null },
): Promise<Habit> {
  if (isDemoMode()) return demoRepo.updateHabit(id, values);
  const supabase = createClient();
  const payload: Record<string, unknown> = { ...values };
  if (values.description !== undefined) {
    payload.description = values.description || null;
  }
  const { data, error } = await supabase
    .from("habits")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Habit;
}

export async function deleteHabit(id: string) {
  if (isDemoMode()) return demoRepo.deleteHabit(id);
  const supabase = createClient();
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchCompletions(from: string, to: string): Promise<HabitCompletion[]> {
  if (isDemoMode()) return demoRepo.listCompletions(from, to);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("habit_completions")
    .select("*")
    .gte("completed_on", from)
    .lte("completed_on", to);
  if (error) throw error;
  return (data ?? []) as HabitCompletion[];
}

export async function toggleCompletion(
  habitId: string,
  localDate: string,
): Promise<HabitCompletion | null> {
  if (isDemoMode()) return demoRepo.toggleCompletion(habitId, localDate);
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) throw new Error("Non authentifié");

  const { data: existing } = await supabase
    .from("habit_completions")
    .select("*")
    .eq("habit_id", habitId)
    .eq("completed_on", localDate)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("habit_completions")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return null;
  }

  const { data, error } = await supabase
    .from("habit_completions")
    .insert({
      habit_id: habitId,
      user_id: user.id,
      completed_on: localDate,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as HabitCompletion;
}
