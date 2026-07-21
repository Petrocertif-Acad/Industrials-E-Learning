"use server";

import bcrypt from "bcryptjs";
import { redirectLocalized } from "@/lib/redirect";
import { prisma } from "@/lib/db/prisma";
import { registerTechnicianSchema } from "@/lib/validation/auth";
import { recalculateTechnicianScore } from "@/lib/score";

export interface RegisterFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const PASSWORD_HASH_ROUNDS = 12;

export async function registerTechnicianAction(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const parsed = registerTechnicianSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password, firstName, lastName, locale } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cette adresse email." };
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "TECHNICIAN",
      locale,
      technicianProfile: {
        create: {
          firstName,
          lastName,
          verificationStatus: "INCOMPLETE",
        },
      },
    },
    include: { technicianProfile: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "user.registered",
      targetType: "User",
      targetId: user.id,
    },
  });

  if (user.technicianProfile) {
    await recalculateTechnicianScore(user.technicianProfile.id);
  }

  return redirectLocalized("/login?registered=1");
}
