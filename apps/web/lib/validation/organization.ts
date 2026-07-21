import { z } from "zod";

export const registerOrganizationSchema = z.object({
  email: z.email(),
  password: z.string().min(10, "Le mot de passe doit contenir au moins 10 caractères."),
  name: z.string().trim().min(1, "Le nom de l'entreprise est requis.").max(200),
  countryId: z.uuid("Sélectionnez un pays."),
});

export type RegisterOrganizationInput = z.infer<typeof registerOrganizationSchema>;

export const organizationProfileSchema = z.object({
  name: z.string().trim().min(1, "Le nom de l'entreprise est requis.").max(200),
  countryId: z.uuid("Sélectionnez un pays."),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  website: z.url("URL invalide.").max(300).optional().or(z.literal("")),
});

export type OrganizationProfileInput = z.infer<typeof organizationProfileSchema>;
