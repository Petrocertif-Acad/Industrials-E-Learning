"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { registerOrganizationSchema } from "@/lib/validation/organization";

export interface RegisterOrganizationFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const PASSWORD_HASH_ROUNDS = 12;

export async function registerOrganizationAction(
  _prevState: RegisterOrganizationFormState,
  formData: FormData
): Promise<RegisterOrganizationFormState> {
  const parsed = registerOrganizationSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    countryId: formData.get("countryId"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password, name, countryId } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cette adresse email." };
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name, countryId, type: "COMPANY", verificationStatus: "PENDING" },
    });

    return tx.user.create({
      data: {
        email,
        passwordHash,
        role: "ORGANIZATION",
        locale: "FR",
        organizationMemberships: {
          create: { organizationId: organization.id, role: "OWNER" },
        },
      },
    });
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "organization.registered",
      targetType: "User",
      targetId: user.id,
    },
  });

  redirect("/login?registered=1");
}
