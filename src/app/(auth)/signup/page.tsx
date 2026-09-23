import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Inscription",
};

export default function SignupPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold text-teal-950">Créer un compte</h1>
      <SignupForm />
    </div>
  );
}
