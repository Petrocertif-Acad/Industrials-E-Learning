"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { redirectLocalized } from "@/lib/redirect";
import { requestPasswordResetSchema, resetPasswordSchema } from "@/lib/validation/auth";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  PASSWORD_RESET_TOKEN_TTL_MS,
} from "@/lib/password-reset";

const PASSWORD_HASH_ROUNDS = 12;

export interface RequestPasswordResetFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  submitted?: boolean;
  // Mode développement uniquement : aucune infrastructure d'envoi d'email
  // n'existe encore dans le projet (décision explicite de l'utilisateur).
  // Le lien est affiché directement dans l'UI et journalisé côté serveur,
  // en attendant qu'un vrai fournisseur d'email soit branché ici.
  devResetUrl?: string;
}

export async function requestPasswordResetAction(
  _prevState: RequestPasswordResetFormState,
  formData: FormData
): Promise<RequestPasswordResetFormState> {
  const parsed = requestPasswordResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Toujours la même réponse, que l'email existe ou non : ne jamais révéler
  // si une adresse est enregistrée (protection contre l'énumération de comptes).
  if (!user) {
    return { submitted: true };
  }

  const { token, tokenHash } = generatePasswordResetToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

  await prisma.$transaction([
    // Un seul lien actif à la fois : les précédents deviennent inutilisables.
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } }),
  ]);

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  // TODO(email) : envoyer resetUrl par email au lieu de le journaliser/afficher,
  // une fois un fournisseur d'email choisi et configuré.
  console.log(`[password-reset] Lien de réinitialisation pour ${user.email} : ${resetUrl}`);

  return { submitted: true, devResetUrl: resetUrl };
}

export interface ResetPasswordFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const tokenHash = hashPasswordResetToken(parsed.data.token);
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "Ce lien de réinitialisation est invalide ou a expiré." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, PASSWORD_HASH_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    prisma.auditLog.create({
      data: {
        actorId: resetToken.userId,
        action: "user.password_reset",
        targetType: "User",
        targetId: resetToken.userId,
      },
    }),
  ]);

  return redirectLocalized("/login?reset=1");
}
