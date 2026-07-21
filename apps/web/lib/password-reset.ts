import crypto from "crypto";

export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

export function generatePasswordResetToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, tokenHash: hashPasswordResetToken(token) };
}

// Seul ce hash est stocké en base : une fuite de la base ne permet jamais de
// reconstituer un lien de réinitialisation utilisable.
export function hashPasswordResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
