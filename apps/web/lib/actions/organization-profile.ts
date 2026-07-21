"use server";

import { redirectLocalized } from "@/lib/redirect";
import { revalidateLocalizedPath } from "@/lib/revalidate";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/permissions";
import { getOwnOrganization } from "@/lib/organization";
import { organizationProfileSchema } from "@/lib/validation/organization";

export interface OrganizationProfileFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateOrganizationProfileAction(
  _prevState: OrganizationProfileFormState,
  formData: FormData
): Promise<OrganizationProfileFormState> {
  const user = await requireUser();
  if (user.role !== "ORGANIZATION") {
    return { error: "Action réservée aux comptes entreprise." };
  }

  const organization = await getOwnOrganization(user.id);
  if (!organization) {
    return { error: "Organisation introuvable." };
  }

  const parsed = organizationProfileSchema.safeParse({
    name: formData.get("name"),
    countryId: formData.get("countryId"),
    description: formData.get("description"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, countryId, description, website } = parsed.data;

  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      name,
      countryId,
      description: description || null,
      website: website || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "organization.profile_updated",
      targetType: "Organization",
      targetId: organization.id,
    },
  });

  await revalidateLocalizedPath("/organization/dashboard");
  return redirectLocalized("/organization/dashboard?updated=1");
}
