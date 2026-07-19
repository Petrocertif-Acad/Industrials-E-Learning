import { z } from "zod";

export const verificationDecisionSchema = z.object({
  id: z.uuid(),
  decision: z.enum(["VERIFIED", "REJECTED"]),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export type VerificationDecisionInput = z.infer<typeof verificationDecisionSchema>;
