"use server";

import { revalidateLocalizedPath } from "@/lib/revalidate";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/permissions";
import { UserRole } from "@/lib/generated/prisma/enums";
import { verificationDecisionSchema, type VerificationDecisionInput } from "@/lib/validation/verification";
import { recalculateTechnicianScore } from "@/lib/score";

// Chaque bouton "Valider"/"Rejeter" utilise `formAction` pour invoquer une
// action dédiée (voir ReviewForm dans app/admin/verifications/page.tsx).
// On évite volontairement un unique formulaire avec deux boutons de
// soumission nommés : Next.js n'associe pas de façon fiable le bouton
// cliqué à la FormData transmise à la Server Action.

function readReviewInput(formData: FormData, decision: VerificationDecisionInput["decision"]) {
  const parsed = verificationDecisionSchema.safeParse({
    id: formData.get("id"),
    decision,
    note: formData.get("note"),
  });
  if (!parsed.success) {
    throw new Error("Décision de vérification invalide.");
  }
  return parsed.data;
}

async function reviewTechnicianCertification(formData: FormData, decision: VerificationDecisionInput["decision"]) {
  const admin = await requireRole(UserRole.ADMIN);
  const { id, note } = readReviewInput(formData, decision);

  const entry = await prisma.technicianCertification.findUnique({ where: { id } });
  if (!entry) return;

  await prisma.$transaction(async (tx) => {
    await tx.technicianCertification.update({ where: { id }, data: { verificationStatus: decision } });
    if (entry.documentId) {
      await tx.document.update({
        where: { id: entry.documentId },
        data: { verificationStatus: decision, verifiedById: admin.id, verifiedAt: new Date() },
      });
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: decision === "VERIFIED" ? "technician_certification.verified" : "technician_certification.rejected",
      targetType: "TechnicianCertification",
      targetId: id,
      metadata: note ? { note } : undefined,
    },
  });

  await recalculateTechnicianScore(entry.technicianId);

  await revalidateLocalizedPath("/admin/verifications");
  await revalidateLocalizedPath("/admin/dashboard");
  await revalidateLocalizedPath("/technician/certifications");
  await revalidateLocalizedPath("/technician/dashboard");
}

async function reviewWorkExperience(formData: FormData, decision: VerificationDecisionInput["decision"]) {
  const admin = await requireRole(UserRole.ADMIN);
  const { id, note } = readReviewInput(formData, decision);

  const entry = await prisma.workExperience.findUnique({ where: { id } });
  if (!entry) return;

  await prisma.$transaction(async (tx) => {
    await tx.workExperience.update({ where: { id }, data: { verificationStatus: decision } });
    if (entry.documentId) {
      await tx.document.update({
        where: { id: entry.documentId },
        data: { verificationStatus: decision, verifiedById: admin.id, verifiedAt: new Date() },
      });
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: decision === "VERIFIED" ? "work_experience.verified" : "work_experience.rejected",
      targetType: "WorkExperience",
      targetId: id,
      metadata: note ? { note } : undefined,
    },
  });

  await recalculateTechnicianScore(entry.technicianId);

  await revalidateLocalizedPath("/admin/verifications");
  await revalidateLocalizedPath("/admin/dashboard");
  await revalidateLocalizedPath("/technician/experiences");
  await revalidateLocalizedPath("/technician/dashboard");
}

export async function verifyTechnicianCertificationAction(formData: FormData): Promise<void> {
  await reviewTechnicianCertification(formData, "VERIFIED");
}

export async function rejectTechnicianCertificationAction(formData: FormData): Promise<void> {
  await reviewTechnicianCertification(formData, "REJECTED");
}

export async function verifyWorkExperienceAction(formData: FormData): Promise<void> {
  await reviewWorkExperience(formData, "VERIFIED");
}

export async function rejectWorkExperienceAction(formData: FormData): Promise<void> {
  await reviewWorkExperience(formData, "REJECTED");
}
