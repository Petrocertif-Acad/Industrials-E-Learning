"use server";

import { revalidateLocalizedPath } from "@/lib/revalidate";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/permissions";
import { getOwnOrganization } from "@/lib/organization";
import { employerReviewSchema } from "@/lib/validation/employer-review";
import { recalculateTechnicianScore } from "@/lib/score";

export interface EmployerReviewFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitEmployerReviewAction(
  _prevState: EmployerReviewFormState,
  formData: FormData
): Promise<EmployerReviewFormState> {
  const user = await requireUser();
  if (user.role !== "ORGANIZATION") {
    return { error: "Action réservée aux comptes entreprise." };
  }

  const organization = await getOwnOrganization(user.id);
  if (!organization) {
    return { error: "Organisation introuvable." };
  }
  // Seules les entreprises vérifiées peuvent laisser un avis : sans modèle de
  // mission/engagement dans ce MVP, c'est le seul garde-fou disponible contre
  // les faux avis (voir le commentaire du modèle EmployerReview).
  if (organization.verificationStatus !== "VERIFIED") {
    return { error: "Seules les entreprises vérifiées peuvent laisser un avis." };
  }

  const parsed = employerReviewSchema.safeParse({
    technicianId: formData.get("technicianId"),
    rating: formData.get("rating"),
    context: formData.get("context"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const technician = await prisma.technicianProfile.findUnique({ where: { id: parsed.data.technicianId } });
  if (!technician) {
    return { error: "Technicien introuvable." };
  }

  const existing = await prisma.employerReview.findUnique({
    where: {
      organizationId_technicianId: { organizationId: organization.id, technicianId: parsed.data.technicianId },
    },
  });

  await prisma.employerReview.upsert({
    where: {
      organizationId_technicianId: { organizationId: organization.id, technicianId: parsed.data.technicianId },
    },
    update: {
      rating: parsed.data.rating,
      context: parsed.data.context || null,
      comment: parsed.data.comment || null,
      authorId: user.id,
    },
    create: {
      organizationId: organization.id,
      technicianId: parsed.data.technicianId,
      authorId: user.id,
      rating: parsed.data.rating,
      context: parsed.data.context || null,
      comment: parsed.data.comment || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: existing ? "employer_review.updated" : "employer_review.created",
      targetType: "EmployerReview",
      targetId: existing?.id ?? parsed.data.technicianId,
      metadata: { organizationId: organization.id },
    },
  });

  await recalculateTechnicianScore(parsed.data.technicianId);

  await revalidateLocalizedPath(`/technicians/${parsed.data.technicianId}`);
  return {};
}

export async function deleteEmployerReviewAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (user.role !== "ORGANIZATION") return;

  const organization = await getOwnOrganization(user.id);
  if (!organization) return;

  const technicianId = String(formData.get("technicianId") ?? "");
  const existing = await prisma.employerReview.findUnique({
    where: { organizationId_technicianId: { organizationId: organization.id, technicianId } },
  });
  if (!existing) return;

  await prisma.employerReview.delete({ where: { id: existing.id } });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "employer_review.deleted",
      targetType: "EmployerReview",
      targetId: existing.id,
      metadata: { organizationId: organization.id },
    },
  });

  await recalculateTechnicianScore(technicianId);

  await revalidateLocalizedPath(`/technicians/${technicianId}`);
}
