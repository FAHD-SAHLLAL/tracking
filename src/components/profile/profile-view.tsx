"use client";

import { useRouter } from "next/navigation";
import {
  useProfile,
  useSettings,
  useUpdateProfile,
  useUpdateSettings,
} from "@/hooks/use-habits";
import { signOut } from "@/lib/data/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const COMMON_TZ = [
  "Europe/Paris",
  "Europe/Brussels",
  "Europe/Zurich",
  "Africa/Casablanca",
  "America/Montreal",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

export function ProfileView() {
  const profileQ = useProfile();
  const settingsQ = useSettings();

  if (profileQ.isLoading || settingsQ.isLoading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  if (!profileQ.data) {
    return (
      <p className="text-sm text-teal-900/65">
        Profil indisponible.{" "}
        <button type="button" className="underline" onClick={() => void profileQ.refetch()}>
          Réessayer
        </button>
      </p>
    );
  }

  return (
    <ProfileForm
      key={`${profileQ.data.updated_at}-${settingsQ.data?.updated_at ?? "s"}`}
      displayName={profileQ.data.display_name ?? ""}
      timezone={profileQ.data.timezone}
      weekStartsOn={settingsQ.data?.week_starts_on ?? 1}
    />
  );
}

function ProfileForm({
  displayName: initialName,
  timezone: initialTz,
  weekStartsOn: initialWeek,
}: {
  displayName: string;
  timezone: string;
  weekStartsOn: number;
}) {
  const updateProfile = useUpdateProfile();
  const updateSettings = useUpdateSettings();
  const router = useRouter();
  const qc = useQueryClient();

  const [displayName, setDisplayName] = useState(initialName);
  const [timezone, setTimezone] = useState(initialTz);
  const [weekStartsOn, setWeekStartsOn] = useState(initialWeek);

  async function save() {
    await updateProfile.mutateAsync({ display_name: displayName, timezone });
    await updateSettings.mutateAsync({ week_starts_on: weekStartsOn });
  }

  async function logout() {
    await signOut();
    await qc.clear();
    router.push("/login");
  }

  const tzOptions = Array.from(
    new Set([
      timezone,
      ...(typeof Intl !== "undefined"
        ? [Intl.DateTimeFormat().resolvedOptions().timeZone]
        : []),
      ...COMMON_TZ,
    ]),
  );

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-teal-950">
          Profil
        </h1>
        <p className="mt-1 text-sm text-teal-900/65">
          Identité, fuseau horaire, préférences.
        </p>
      </header>

      <div className="space-y-4 rounded-3xl border border-teal-900/8 bg-white/75 p-5">
        <div className="space-y-2">
          <Label htmlFor="displayName">Nom affiché</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Fuseau horaire</Label>
          <select
            id="timezone"
            className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            {tzOptions.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <p className="text-xs text-teal-900/50">
            Les séries et le jour « aujourd&apos;hui » utilisent ce fuseau.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="weekStart">Début de semaine</Label>
          <select
            id="weekStart"
            className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm"
            value={weekStartsOn}
            onChange={(e) => setWeekStartsOn(Number(e.target.value))}
          >
            <option value={1}>Lundi</option>
            <option value={0}>Dimanche</option>
          </select>
        </div>
        <Button onClick={() => void save()} disabled={updateProfile.isPending}>
          Enregistrer
        </Button>
      </div>

      <section className="rounded-3xl border border-dashed border-teal-900/15 bg-white/40 p-5">
        <h2 className="font-heading text-lg font-semibold text-teal-950">Rappels</h2>
        <p className="mt-2 text-sm text-teal-900/65">
          Le schéma de rappels est prêt côté base. La livraison (push / email) arrive
          dans une prochaine version — aucune infra de notification dans v1.
        </p>
      </section>

      <Button variant="outline" className="w-full md:hidden" onClick={() => void logout()}>
        Déconnexion
      </Button>
    </div>
  );
}
