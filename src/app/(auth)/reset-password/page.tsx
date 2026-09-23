import type { Metadata } from "next";
import { ResetRequestForm } from "@/components/auth/reset-request-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold text-teal-950">
        Réinitialiser le mot de passe
      </h1>
      <ResetRequestForm />
    </div>
  );
}
