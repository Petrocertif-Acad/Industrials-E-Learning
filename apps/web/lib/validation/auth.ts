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
