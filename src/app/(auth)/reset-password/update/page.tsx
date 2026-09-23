import type { Metadata } from "next";
import { ResetUpdateForm } from "@/components/auth/reset-update-form";

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
};

export default function ResetUpdatePage() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold text-teal-950">
        Choisir un nouveau mot de passe
      </h1>
      <ResetUpdateForm />
    </div>
  );
}
