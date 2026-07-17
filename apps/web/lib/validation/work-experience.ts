import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const workExperienceSchema = z
  .object({
    projectName: z.string().trim().min(1, "Le nom du projet est requis.").max(200),
    employer: z.string().trim().min(1, "L'entreprise est requise.").max(200),
    client: optionalText(200),
    countryId: z.uuid("Sélectionnez un pays."),
    sector: optionalText(100),
    role: z.string().trim().min(1, "Le poste occupé est requis.").max(200),
    startDate: z.coerce.date({ error: "Date de début invalide." }),
    endDate: z.coerce.date({ error: "Date de fin invalide." }).optional(),
    description: optionalText(2000),
    equipmentUsed: optionalText(500),
    materialsWorked: optionalText(500),
    processesApplied: optionalText(500),
    standardsUsed: optionalText(500),
    responsibilities: optionalText(2000),
    referenceContact: optionalText(200),
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: "La date de fin doit être postérieure à la date de début.",
    path: ["endDate"],
  });

export type WorkExperienceInput = z.infer<typeof workExperienceSchema>;
