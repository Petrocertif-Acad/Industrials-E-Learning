import { prisma } from "@/lib/db/prisma";

export function getOwnTalentPoolEntries(organizationId: string) {
  return prisma.talentPoolEntry.findMany({
    where: { organizationId },
    include: {
      technician: { include: { primaryTrade: true, country: true, score: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTalentPoolTechnicianIds(organizationId: string): Promise<Set<string>> {
  const entries = await prisma.talentPoolEntry.findMany({
    where: { organizationId },
    select: { technicianId: true },
  });
  return new Set(entries.map((entry) => entry.technicianId));
}
