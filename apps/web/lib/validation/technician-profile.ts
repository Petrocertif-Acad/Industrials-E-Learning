import { z } from "zod";

export const profileBasicsSchema = z
  .object({
    primaryTradeId: z.uuid("Sélectionnez votre métier principal."),
    secondaryTradeIds: z.array(z.uuid()).max(5, "5 métiers secondaires maximum."),
    countryId: z.uuid("Sélectionnez votre pays."),
    city: z.string().trim().max(100).optional().or(z.literal("")),
    yearsExperience: z.coerce.number().int().min(0).max(60),
    availability: z.enum(["AVAILABLE", "AVAILABLE_SOON", "UNAVAILABLE"]),
    mobilityScope: z.enum(["LOCAL", "NATIONAL", "INTERNATIONAL"]),
  })
  .refine((data) => !data.secondaryTradeIds.includes(data.primaryTradeId), {
    message: "Un métier secondaire ne peut pas être identique au métier principal.",
    path: ["secondaryTradeIds"],
  });

export type ProfileBasicsInput = z.infer<typeof profileBasicsSchema>;

const skillLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]);

export const technicianSkillsSchema = z.object({
  skills: z.array(
    z.object({
      skillId: z.uuid(),
      selfLevel: skillLevelEnum,
    })
  ),
});

export type TechnicianSkillsInput = z.infer<typeof technicianSkillsSchema>;
