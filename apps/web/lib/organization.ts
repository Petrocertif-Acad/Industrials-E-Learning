import { prisma } from "@/lib/db/prisma";

export async function getOwnOrganization(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: { include: { country: true } } },
  });
  return membership?.organization ?? null;
}
