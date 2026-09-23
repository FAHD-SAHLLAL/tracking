"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authCredentialsSchema } from "@/lib/validations/schemas";
import { signIn } from "@/lib/data/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isDemoMode } from "@/lib/env";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(isDemoMode() ? "demo@rythme.app" : "");
  const [password, setPassword] = useState(isDemoMode() ? "demo1234" : "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = authCredentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await signIn(parsed.data.email, parsed.data.password);
      toast.success("Bienvenue");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      {isDemoMode() && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Mode démo : n&apos;importe quel email/mot de passe fonctionne.
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
      <p className="text-center text-sm text-teal-900/60">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-medium text-teal-900 underline">
          Créer un compte
        </Link>
      </p>
      <p className="text-center text-sm text-teal-900/60">
        <Link href="/reset-password" className="underline">
          Mot de passe oublié
        </Link>
      </p>
    </form>
  );
}
