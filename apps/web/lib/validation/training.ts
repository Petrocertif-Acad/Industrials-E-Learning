import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

const tradeCategoryEnum = z.enum([
  "WELDING",
  "BOILERMAKING",
  "PIPING",
  "METAL_STRUCTURES",
  "MECHANICAL_MANUFACTURING",
  "INDUSTRIAL_MAINTENANCE",
  "QUALITY_CONTROL",
  "NON_DESTRUCTIVE_TESTING",
  "SUPERVISION",
  "OTHER",
]);

export const trainingSchema = z.object({
  title: z.string().trim().min(1, "L'intitulé de la formation est requis.").max(200),
  provider: z.string().trim().min(1, "L'organisme de formation est requis.").max(200),
  category: tradeCategoryEnum.optional(),
  hours: z.coerce.number().int().min(1).max(2000).optional(),
  completionDate: z.coerce.date({ error: "Date d'obtention invalide." }).max(new Date(), {
    message: "La date d'obtention ne peut pas être dans le futur.",
  }),
  description: optionalText(2000),
});

export type TrainingInput = z.infer<typeof trainingSchema>;
