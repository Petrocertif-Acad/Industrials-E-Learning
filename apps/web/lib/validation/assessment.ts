import { z } from "zod";

export const assessmentSchema = z.object({
  technicianId: z.uuid("Technicien introuvable."),
  skillId: z.uuid().optional(),
  title: z.string().trim().min(1, "L'intitulé de l'évaluation est requis.").max(200),
  score: z.coerce.number().int().min(0, "La note doit être comprise entre 0 et 100.").max(100, "La note doit être comprise entre 0 et 100."),
  evaluatorName: z.string().trim().min(1, "Le nom de l'évaluateur est requis.").max(200),
  assessedAt: z.coerce.date({ error: "Date d'évaluation invalide." }).max(new Date(), {
    message: "La date d'évaluation ne peut pas être dans le futur.",
  }),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type AssessmentInput = z.infer<typeof assessmentSchema>;
