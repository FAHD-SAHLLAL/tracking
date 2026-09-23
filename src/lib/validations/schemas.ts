import { z } from "zod";

export const authCredentialsSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(8, "Au moins 8 caractères"),
});

export const signupSchema = authCredentialsSchema.extend({
  displayName: z.string().min(1, "Nom requis").max(60),
});

export const passwordResetRequestSchema = z.object({
  email: z.email("Email invalide"),
});

export const passwordUpdateSchema = z
  .object({
    password: z.string().min(8, "Au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const profileUpdateSchema = z.object({
  display_name: z.string().min(1).max(60),
  timezone: z.string().min(1),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export const habitFormSchema = z.object({
  title: z.string().trim().min(1, "Titre requis").max(80),
  description: z.string().max(280).optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().nullable().optional(),
  frequency: z.enum(["daily", "weekly", "custom"]),
  days_of_week: z.array(z.number().int().min(0).max(6)).min(1, "Choisir au moins un jour"),
  target_per_period: z.number().int().positive().nullable().optional(),
});

export type HabitFormValues = z.infer<typeof habitFormSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
