"use server";

import { redirectLocalized } from "@/lib/redirect";
import { revalidateLocalizedPath } from "@/lib/revalidate";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/permissions";
import { getOwnTechnicianProfile } from "@/lib/technician";
import { workExperienceSchema } from "@/lib/validation/work-experience";
import { recalculateTechnicianScore } from "@/lib/score";

export interface WorkExperienceFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function readFormInput(formData: FormData) {
  return {
    projectName: formData.get("projectName"),
    employer: formData.get("employer"),
    client: formData.get("client"),
    countryId: formData.get("countryId"),
    sector: formData.get("sector"),
    role: formData.get("role"),
    startDate: formData.get("startDate"),
    endDate: (formData.get("endDate") as string) || undefined,
    description: formData.get("description"),
    equipmentUsed: formData.get("equipmentUsed"),
    materialsWorked: formData.get("materialsWorked"),
    processesApplied: formData.get("processesApplied"),
    standardsUsed: formData.get("standardsUsed"),
    responsibilities: formData.get("responsibilities"),
    referenceContact: formData.get("referenceContact"),
  };
}

async function requireOwnTechnicianProfile() {
  const user = await requireUser();
  if (user.role !== "TECHNICIAN") {
    throw new Error("Action réservée aux comptes technicien.");
  }
  const profile = await getOwnTechnicianProfile(user.id);
  if (!profile) {
    throw new Error("Profil introuvable.");
  }
  return { user, profile };
}

export async function createWorkExperienceAction(
  _prevState: WorkExperienceFormState,
  formData: FormData
): Promise<WorkExperienceFormState> {
  const { user, profile } = await requireOwnTechnicianProfile();

  const parsed = workExperienceSchema.safeParse(readFormInput(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const experience = await prisma.workExperience.create({
    data: { technicianId: profile.id, ...parsed.data, client: parsed.data.client || null, sector: parsed.data.sector || null },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "work_experience.created",
      targetType: "WorkExperience",
      targetId: experience.id,
    },
  });

  await recalculateTechnicianScore(profile.id);

  await revalidateLocalizedPath("/technician/experiences");
  await revalidateLocalizedPath("/technician/dashboard");
  return redirectLocalized("/technician/experiences?saved=1");
}

export async function updateWorkExperienceAction(
  _prevState: WorkExperienceFormState,
  formData: FormData
): Promise<WorkExperienceFormState> {
  const { user, profile } = await requireOwnTechnicianProfile();

  const experienceId = String(formData.get("id") ?? "");
  const existing = await prisma.workExperience.findUnique({ where: { id: experienceId } });
  if (!existing || existing.technicianId !== profile.id) {
    return { error: "Expérience introuvable." };
  }

  const parsed = workExperienceSchema.safeParse(readFormInput(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.workExperience.update({
    where: { id: experienceId },
    data: { ...parsed.data, client: parsed.data.client || null, sector: parsed.data.sector || null },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "work_experience.updated",
      targetType: "WorkExperience",
      targetId: experienceId,
    },
  });

  await recalculateTechnicianScore(profile.id);

  await revalidateLocalizedPath("/technician/experiences");
  await revalidateLocalizedPath("/technician/dashboard");
  return redirectLocalized("/technician/experiences?saved=1");
}

export async function deleteWorkExperienceAction(formData: FormData): Promise<void> {
  const { user, profile } = await requireOwnTechnicianProfile();

  const experienceId = String(formData.get("id") ?? "");
  const existing = await prisma.workExperience.findUnique({ where: { id: experienceId } });
  if (!existing || existing.technicianId !== profile.id) {
    return;
  }

  await prisma.workExperience.delete({ where: { id: experienceId } });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "work_experience.deleted",
      targetType: "WorkExperience",
      targetId: experienceId,
    },
  });

  await recalculateTechnicianScore(profile.id);

  await revalidateLocalizedPath("/technician/experiences");
  await revalidateLocalizedPath("/technician/dashboard");
}
