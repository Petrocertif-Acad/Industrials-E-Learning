"use server";

import { revalidateLocalizedPath } from "@/lib/revalidate";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/permissions";
import { getOwnOrganization } from "@/lib/organization";

export async function toggleTalentPoolAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (user.role !== "ORGANIZATION") return;

  const organization = await getOwnOrganization(user.id);
  if (!organization) return;

  const technicianId = String(formData.get("technicianId") ?? "");
  if (!technicianId) return;

  const existing = await prisma.talentPoolEntry.findUnique({
    where: { organizationId_technicianId: { organizationId: organization.id, technicianId } },
  });

  if (existing) {
    await prisma.talentPoolEntry.delete({ where: { id: existing.id } });
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "talent_pool.removed",
        targetType: "TechnicianProfile",
        targetId: technicianId,
      },
    });
  } else {
    await prisma.talentPoolEntry.create({
      data: { organizationId: organization.id, technicianId, addedById: user.id },
    });
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "talent_pool.added",
        targetType: "TechnicianProfile",
        targetId: technicianId,
      },
    });
  }

  await revalidateLocalizedPath("/organization/search");
  await revalidateLocalizedPath("/organization/talent-pool");
  await revalidateLocalizedPath(`/technicians/${technicianId}`);
}

export interface TalentPoolNoteFormState {
  error?: string;
}

export async function updateTalentPoolNoteAction(
  _prevState: TalentPoolNoteFormState,
  formData: FormData
): Promise<TalentPoolNoteFormState> {
  const user = await requireUser();
  if (user.role !== "ORGANIZATION") {
    return { error: "Action réservée aux comptes entreprise." };
  }

  const organization = await getOwnOrganization(user.id);
  if (!organization) {
    return { error: "Organisation introuvable." };
  }

  const entryId = String(formData.get("entryId") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);

  const existing = await prisma.talentPoolEntry.findUnique({ where: { id: entryId } });
  if (!existing || existing.organizationId !== organization.id) {
    return { error: "Entrée introuvable." };
  }

  await prisma.talentPoolEntry.update({ where: { id: entryId }, data: { note: note || null } });

  await revalidateLocalizedPath("/organization/talent-pool");
  return {};
}
