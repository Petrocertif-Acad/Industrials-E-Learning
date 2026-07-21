import { z } from "zod";

export const employerReviewSchema = z.object({
  technicianId: z.uuid("Technicien introuvable."),
  rating: z.coerce.number().int().min(1, "La note doit être comprise entre 1 et 5.").max(5, "La note doit être comprise entre 1 et 5."),
  context: z.string().trim().max(200).optional().or(z.literal("")),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type EmployerReviewInput = z.infer<typeof employerReviewSchema>;
