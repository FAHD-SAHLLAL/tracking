import type {
  Habit,
  HabitCompletion,
  Profile,
  UserSettings,
} from "@/lib/types";
import type { HabitFormValues } from "@/lib/validations/schemas";

const STORAGE_KEY = "rythme-demo-v1";

type DemoSession = {
  userId: string;
  email: string;
};

type DemoStore = {
  session: DemoSession | null;
  profiles: Record<string, Profile>;
  settings: Record<string, UserSettings>;
  habits: Habit[];
  completions: HabitCompletion[];
};

function emptyStore(): DemoStore {
  return {
    session: null,
    profiles: {},
    settings: {},
    habits: [],
    completions: [],
  };
}

function uid(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

function seedHabits(userId: string): Habit[] {
  const now = nowIso();
  const created = new Date();
  created.setDate(created.getDate() - 14);
  const createdAt = created.toISOString();
  return [
    {
      id: uid(),
      user_id: userId,
      title: "Lire 20 minutes",
      description: "Un chapitre, sans téléphone.",
      color: "#0F766E",
      icon: "book",
      frequency: "daily",
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      target_per_period: null,
      position: 0,
      archived_at: null,
      created_at: createdAt,
      updated_at: now,
    },
    {
      id: uid(),
      user_id: userId,
      title: "Marche matinale",
      description: "15 minutes dehors.",
      color: "#0369A1",
      icon: "sun",
      frequency: "custom",
      days_of_week: [1, 2, 3, 4, 5],
      target_per_period: null,
      position: 1,
      archived_at: null,
      created_at: createdAt,
      updated_at: now,
    },
    {
      id: uid(),
      user_id: userId,
      title: "Méditation",
      description: null,
      color: "#4338CA",
      icon: "brain",
      frequency: "weekly",
      days_of_week: [0, 3, 6],
      target_per_period: 3,
      position: 2,
      archived_at: null,
      created_at: createdAt,
      updated_at: now,
    },
  ];
}

function readStore(): DemoStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    return JSON.parse(raw) as DemoStore;
  } catch {
    return emptyStore();
  }
}

function writeStore(store: DemoStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("rythme-demo-updated"));
}

function ensureUser(
  store: DemoStore,
  email: string,
  displayName?: string,
): DemoStore {
  const existingId = Object.keys(store.profiles)[0];
  if (store.session && store.profiles[store.session.userId]) {
    return store;
  }

  const userId = existingId ?? uid();
  const now = nowIso();
  if (!store.profiles[userId]) {
    store.profiles[userId] = {
      id: userId,
      display_name: displayName ?? email.split("@")[0] ?? "Vous",
      avatar_url: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris",
      created_at: now,
      updated_at: now,
    };
    store.settings[userId] = {
      user_id: userId,
      week_starts_on: 1,
      theme_preference: "system",
      reminder_defaults: {},
      created_at: now,
      updated_at: now,
    };
    store.habits = [...store.habits, ...seedHabits(userId)];
  }
  store.session = { userId, email };
  return store;
}

export const demoRepo = {
  getSession(): DemoSession | null {
    return readStore().session;
  },

  async signUp(email: string, password: string, displayName: string) {
    void password;
    const store = ensureUser(readStore(), email, displayName);
    writeStore(store);
    return store.session!;
  },

  async signIn(email: string, password: string) {
    void password;
    const store = ensureUser(readStore(), email);
    writeStore(store);
    return store.session!;
  },

  async signOut() {
    const store = readStore();
    store.session = null;
    writeStore(store);
  },

  async requestPasswordReset(email: string) {
    void email;
    return { ok: true as const };
  },

  getProfile(): Profile | null {
    const store = readStore();
    if (!store.session) return null;
    return store.profiles[store.session.userId] ?? null;
  },

  async updateProfile(patch: Partial<Pick<Profile, "display_name" | "timezone" | "avatar_url">>) {
    const store = readStore();
    if (!store.session) throw new Error("Non authentifié");
    const profile = store.profiles[store.session.userId];
    if (!profile) throw new Error("Profil introuvable");
    store.profiles[store.session.userId] = {
      ...profile,
      ...patch,
      avatar_url: patch.avatar_url === "" ? null : (patch.avatar_url ?? profile.avatar_url),
      updated_at: nowIso(),
    };
    writeStore(store);
    return store.profiles[store.session.userId]!;
  },

  getSettings(): UserSettings | null {
    const store = readStore();
    if (!store.session) return null;
    return store.settings[store.session.userId] ?? null;
  },

  async updateSettings(patch: Partial<Pick<UserSettings, "week_starts_on" | "theme_preference">>) {
    const store = readStore();
    if (!store.session) throw new Error("Non authentifié");
    const settings = store.settings[store.session.userId];
    if (!settings) throw new Error("Réglages introuvables");
    store.settings[store.session.userId] = {
      ...settings,
      ...patch,
      updated_at: nowIso(),
    };
    writeStore(store);
    return store.settings[store.session.userId]!;
  },

  listHabits(includeArchived = false): Habit[] {
    const store = readStore();
    if (!store.session) return [];
    return store.habits
      .filter((h) => h.user_id === store.session!.userId)
      .filter((h) => includeArchived || !h.archived_at)
      .sort((a, b) => a.position - b.position);
  },

  async createHabit(values: HabitFormValues): Promise<Habit> {
    const store = readStore();
    if (!store.session) throw new Error("Non authentifié");
    const now = nowIso();
    const habit: Habit = {
      id: uid(),
      user_id: store.session.userId,
      title: values.title,
      description: values.description || null,
      color: values.color,
      icon: values.icon ?? null,
      frequency: values.frequency,
      days_of_week: values.days_of_week,
      target_per_period: values.target_per_period ?? null,
      position: store.habits.filter((h) => h.user_id === store.session!.userId).length,
      archived_at: null,
      created_at: now,
      updated_at: now,
    };
    store.habits.push(habit);
    writeStore(store);
    return habit;
  },

  async updateHabit(id: string, values: Partial<HabitFormValues> & { archived_at?: string | null }) {
    const store = readStore();
    if (!store.session) throw new Error("Non authentifié");
    const idx = store.habits.findIndex(
      (h) => h.id === id && h.user_id === store.session!.userId,
    );
    if (idx < 0) throw new Error("Habitude introuvable");
    const current = store.habits[idx]!;
    store.habits[idx] = {
      ...current,
      ...values,
      description:
        values.description === undefined
          ? current.description
          : values.description || null,
      icon: values.icon === undefined ? current.icon : values.icon,
      target_per_period:
        values.target_per_period === undefined
          ? current.target_per_period
          : values.target_per_period ?? null,
      updated_at: nowIso(),
    };
    writeStore(store);
    return store.habits[idx]!;
  },

  async deleteHabit(id: string) {
    const store = readStore();
    if (!store.session) throw new Error("Non authentifié");
    store.habits = store.habits.filter(
      (h) => !(h.id === id && h.user_id === store.session!.userId),
    );
    store.completions = store.completions.filter((c) => c.habit_id !== id);
    writeStore(store);
  },

  listCompletions(from: string, to: string): HabitCompletion[] {
    const store = readStore();
    if (!store.session) return [];
    return store.completions.filter(
      (c) =>
        c.user_id === store.session!.userId &&
        c.completed_on >= from &&
        c.completed_on <= to,
    );
  },

  async toggleCompletion(habitId: string, localDate: string): Promise<HabitCompletion | null> {
    const store = readStore();
    if (!store.session) throw new Error("Non authentifié");
    const existing = store.completions.findIndex(
      (c) =>
        c.habit_id === habitId &&
        c.completed_on === localDate &&
        c.user_id === store.session!.userId,
    );
    if (existing >= 0) {
      store.completions.splice(existing, 1);
      writeStore(store);
      return null;
    }
    const row: HabitCompletion = {
      id: uid(),
      habit_id: habitId,
      user_id: store.session.userId,
      completed_on: localDate,
      completed_at: nowIso(),
      note: null,
    };
    store.completions.push(row);
    writeStore(store);
    return row;
  },

  subscribe(listener: () => void) {
    if (typeof window === "undefined") return () => undefined;
    const handler = () => listener();
    window.addEventListener("rythme-demo-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("rythme-demo-updated", handler);
      window.removeEventListener("storage", handler);
    };
  },
};
