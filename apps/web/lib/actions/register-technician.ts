"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { registerTechnicianSchema } from "@/lib/validation/auth";

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
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "user.registered",
      targetType: "User",
      targetId: user.id,
    },
  });

  redirect("/login?registered=1");
}
