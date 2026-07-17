import { prisma } from "@/lib/db/prisma";

export function getOwnTechnicianProfile(userId: string) {
  return prisma.technicianProfile.findUnique({ where: { userId } });
}
