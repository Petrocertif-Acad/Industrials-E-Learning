import { prisma } from "@/lib/db/prisma";

export function getOwnTechnicianProfile(userId: string) {
  return prisma.technicianProfile.findUnique({ where: { userId } });
}

// Requête partagée entre le profil public (/technicians/[id]) et la
// génération du passeport PDF : les deux doivent afficher exactement les
// mêmes données.
export function getTechnicianProfileForDisplay(id: string) {
  return prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      primaryTrade: true,
      secondaryTrades: { include: { trade: true } },
      country: true,
      score: true,
      skills: { include: { skill: { include: { trade: true } } }, orderBy: { updatedAt: "desc" } },
      certifications: { include: { certification: true }, orderBy: { createdAt: "desc" } },
      workExperiences: { include: { country: true }, orderBy: { startDate: "desc" } },
      languages: true,
    },
  });
}

export type TechnicianProfileForDisplay = NonNullable<
  Awaited<ReturnType<typeof getTechnicianProfileForDisplay>>
>;

interface SessionLike {
  user?: { id: string; role: string };
}

// Un profil "PUBLIC_LIMITED" ne montre que le bandeau de confiance ; le
// détail complet (compétences, certifications, expériences, score détaillé,
// passeport PDF) n'est visible que par son propriétaire, un administrateur,
// ou si le technicien a choisi la visibilité complète.
export function canViewFullTechnicianProfile(
  profile: { userId: string; visibility: string },
  session: SessionLike | null
): boolean {
  const isOwner = session?.user?.id !== undefined && profile.userId === session.user.id;
  const isAdmin = session?.user?.role === "ADMIN";
  return isOwner || isAdmin || profile.visibility === "PUBLIC_FULL";
}

export function isTechnicianProfilePublishable(profile: { primaryTradeId: string | null; countryId: string | null }): boolean {
  return Boolean(profile.primaryTradeId && profile.countryId);
}

export function isTechnicianProfileHidden(profile: { verificationStatus: string }): boolean {
  return profile.verificationStatus === "SUSPENDED" || profile.verificationStatus === "ARCHIVED";
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
