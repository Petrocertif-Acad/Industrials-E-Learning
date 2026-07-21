import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const registerTechnicianSchema = z.object({
  email: z.email(),
  password: z.string().min(10, "Le mot de passe doit contenir au moins 10 caractères."),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  locale: z.enum(["FR", "EN"]).default("FR"),
});

export type RegisterTechnicianInput = z.infer<typeof registerTechnicianSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(10, "Le mot de passe doit contenir au moins 10 caractères."),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
