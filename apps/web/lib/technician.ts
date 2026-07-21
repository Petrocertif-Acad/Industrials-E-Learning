import { prisma } from "@/lib/db/prisma";

export function getOwnTechnicianProfile(userId: string) {
  return prisma.technicianProfile.findUnique({ where: { userId } });
}

export interface ProfileCompletenessInput {
  primaryTradeId: string | null;
  countryId: string | null;
  skillsCount: number;
  certificationsCount: number;
  workExperiencesCount: number;
}

export interface ChecklistItem {
  label: string;
  done: boolean;
}

// Logique partagée entre /technician/profile et le tableau de bord : les deux
// doivent afficher exactement la même définition de "profil complet".
export function buildProfileCompletenessChecklist(profile: ProfileCompletenessInput): ChecklistItem[] {
  return [
    { label: "Métier et pays renseignés", done: Boolean(profile.primaryTradeId && profile.countryId) },
    { label: "Au moins une compétence déclarée", done: profile.skillsCount > 0 },
    { label: "Au moins une certification ajoutée", done: profile.certificationsCount > 0 },
    { label: "Au moins une expérience professionnelle", done: profile.workExperiencesCount > 0 },
  ];
}
