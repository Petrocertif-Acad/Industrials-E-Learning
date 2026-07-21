"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/permissions";
import { getOwnTechnicianProfile } from "@/lib/technician";
import { profileBasicsSchema, technicianSkillsSchema } from "@/lib/validation/technician-profile";
import { recalculateTechnicianScore } from "@/lib/score";

export interface ProfileBasicsFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateProfileBasicsAction(
  _prevState: ProfileBasicsFormState,
  formData: FormData
): Promise<ProfileBasicsFormState> {
  const user = await requireUser();
  if (user.role !== "TECHNICIAN") {
    return { error: "Action réservée aux comptes technicien." };
  }

  const profile = await getOwnTechnicianProfile(user.id);
  if (!profile) {
    return { error: "Profil introuvable." };
  }

  const secondaryTradeIds = formData.getAll("secondaryTradeIds").map(String).filter(Boolean);

  const parsed = profileBasicsSchema.safeParse({
    primaryTradeId: formData.get("primaryTradeId"),
    secondaryTradeIds,
    countryId: formData.get("countryId"),
    city: formData.get("city"),
    yearsExperience: formData.get("yearsExperience"),
    availability: formData.get("availability"),
    mobilityScope: formData.get("mobilityScope"),
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const {
    primaryTradeId,
    secondaryTradeIds: secondaryIds,
    countryId,
    city,
    yearsExperience,
    availability,
    mobilityScope,
    visibility,
  } = parsed.data;

  const nextVerificationStatus =
    profile.verificationStatus === "INCOMPLETE" ? "DECLARED" : profile.verificationStatus;

  await prisma.$transaction([
    prisma.technicianProfile.update({
      where: { id: profile.id },
      data: {
        primaryTradeId,
        countryId,
        city: city || null,
        yearsExperience,
        availability,
        mobilityScope,
        visibility,
        verificationStatus: nextVerificationStatus,
      },
    }),
    prisma.technicianSecondaryTrade.deleteMany({ where: { technicianId: profile.id } }),
    ...secondaryIds.map((tradeId) =>
      prisma.technicianSecondaryTrade.create({ data: { technicianId: profile.id, tradeId } })
    ),
  ]);

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "technician_profile.basics_updated",
      targetType: "TechnicianProfile",
      targetId: profile.id,
    },
  });

  await recalculateTechnicianScore(profile.id);

  revalidatePath("/technician/dashboard");
  redirect("/technician/dashboard?updated=1");
}

export interface SkillsFormState {
  error?: string;
}

export async function updateTechnicianSkillsAction(
  _prevState: SkillsFormState,
  formData: FormData
): Promise<SkillsFormState> {
  const user = await requireUser();
  if (user.role !== "TECHNICIAN") {
    return { error: "Action réservée aux comptes technicien." };
  }

  const profile = await getOwnTechnicianProfile(user.id);
  if (!profile) {
    return { error: "Profil introuvable." };
  }

  const catalogSkillIds = (await prisma.skill.findMany({ select: { id: true } })).map((s) => s.id);

  const selected = catalogSkillIds.flatMap((skillId) => {
    const checked = formData.get(`skill-${skillId}`);
    if (!checked) return [];
    const level = formData.get(`level-${skillId}`);
    return [{ skillId, selfLevel: String(level ?? "BEGINNER") }];
  });

  const parsed = technicianSkillsSchema.safeParse({ skills: selected });
  if (!parsed.success) {
    return { error: "Données de compétences invalides." };
  }

  const selectedSkillIds = parsed.data.skills.map((s) => s.skillId);

  await prisma.$transaction([
    prisma.technicianSkill.deleteMany({
      where: { technicianId: profile.id, skillId: { notIn: selectedSkillIds } },
    }),
    ...parsed.data.skills.map((skill) =>
      prisma.technicianSkill.upsert({
        where: { technicianId_skillId: { technicianId: profile.id, skillId: skill.skillId } },
        update: { selfLevel: skill.selfLevel },
        create: { technicianId: profile.id, skillId: skill.skillId, selfLevel: skill.selfLevel },
      })
    ),
  ]);

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "technician_profile.skills_updated",
      targetType: "TechnicianProfile",
      targetId: profile.id,
      metadata: { skillCount: selectedSkillIds.length },
    },
  });

  await recalculateTechnicianScore(profile.id);

  revalidatePath("/technician/skills");
  revalidatePath("/technician/dashboard");
  redirect("/technician/dashboard?updated=1");
}
