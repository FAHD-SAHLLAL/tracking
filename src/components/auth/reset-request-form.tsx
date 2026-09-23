"use client";

import { useState } from "react";
import Link from "next/link";
import { passwordResetRequestSchema } from "@/lib/validations/schemas";
import { requestPasswordReset } from "@/lib/data/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ResetRequestForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = passwordResetRequestSchema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Email invalide");
      return;
    }
    setPending(true);
    try {
      await requestPasswordReset(parsed.data.email);
      setSent(true);
      toast.success("Si un compte existe, un email a été envoyé.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'envoi");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-sm text-teal-900/80">
        <p>Consultez votre boîte mail pour réinitialiser le mot de passe.</p>
        <Link href="/login" className="underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer le lien"}
      </Button>
      <p className="text-center text-sm">
        <Link href="/login" className="underline">
          Annuler
        </Link>
      </p>
    </form>
  );
}
