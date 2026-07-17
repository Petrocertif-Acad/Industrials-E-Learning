import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const technicianCertificationSchema = z
  .object({
    certificationId: z.uuid("Sélectionnez une certification."),
    issueDate: z.coerce.date({ error: "Date d'obtention invalide." }).optional(),
    expiryDate: z.coerce.date({ error: "Date d'expiration invalide." }).optional(),
    weldingProcess: optionalText(50),
    materialType: optionalText(100),
    materialGroup: optionalText(100),
    qualifiedThickness: optionalText(100),
    qualifiedDiameter: optionalText(100),
    weldingPosition: optionalText(50),
    jointType: optionalText(100),
    fillerMetal: optionalText(100),
    shieldingGas: optionalText(100),
  })
  .refine((data) => !data.issueDate || !data.expiryDate || data.expiryDate >= data.issueDate, {
    message: "La date d'expiration doit être postérieure à la date d'obtention.",
    path: ["expiryDate"],
  });

export type TechnicianCertificationInput = z.infer<typeof technicianCertificationSchema>;
