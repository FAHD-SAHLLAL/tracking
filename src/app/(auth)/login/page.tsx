import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold text-teal-950">Connexion</h1>
      <LoginForm />
    </div>
  );
}
