import { prisma } from "@/lib/db/prisma";
import type { AvailabilityStatus, MobilityScope } from "@/lib/generated/prisma/enums";

export interface TechnicianSearchFilters {
  tradeId?: string;
  countryId?: string;
  availability?: AvailabilityStatus;
  mobilityScope?: MobilityScope;
  certificationId?: string;
  minScore?: number;
}

// Un technicien n'est visible en recherche que s'il remplit les mêmes
// conditions de publication que sa page publique (voir /technicians/[id]) :
// métier et pays renseignés, profil ni suspendu ni archivé.
export async function searchTechnicians(filters: TechnicianSearchFilters) {
  const technicians = await prisma.technicianProfile.findMany({
    where: {
      primaryTradeId: { not: null },
      countryId: { not: null },
      verificationStatus: { notIn: ["SUSPENDED", "ARCHIVED"] },
      ...(filters.tradeId && { primaryTradeId: filters.tradeId }),
      ...(filters.countryId && { countryId: filters.countryId }),
      ...(filters.availability && { availability: filters.availability }),
      ...(filters.mobilityScope && { mobilityScope: filters.mobilityScope }),
      ...(filters.certificationId && {
        certifications: { some: { certificationId: filters.certificationId } },
      }),
      ...(filters.minScore !== undefined && {
        score: { totalScore: { gte: filters.minScore } },
      }),
    },
    include: {
      primaryTrade: true,
      country: true,
      score: true,
      certifications: { select: { verificationStatus: true, expiryDate: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 40,
  });

  // Trié en mémoire (score le plus élevé d'abord, non calculé en dernier) :
  // le tri par relation optionnelle n'est pas fiable côté requête Prisma.
  return technicians.sort((a, b) => {
    const scoreA = a.score ? Number(a.score.totalScore) : -1;
    const scoreB = b.score ? Number(b.score.totalScore) : -1;
    return scoreB - scoreA;
  });
}
