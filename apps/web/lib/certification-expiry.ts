import type { BadgeTone } from "@/lib/verification-labels";

const EXPIRY_WARNING_WINDOW_DAYS = 60;

export function getExpiryBadge(expiryDate: Date | null): { label: string; tone: BadgeTone } | null {
  if (!expiryDate) return null;
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry < 0) return { label: "Expirée", tone: "danger" };
  if (daysUntilExpiry <= EXPIRY_WARNING_WINDOW_DAYS) {
    return { label: `Expire dans ${daysUntilExpiry} j`, tone: "warning" };
  }
  return null;
}

export function isExpiringSoonOrExpired(expiryDate: Date | null): boolean {
  return getExpiryBadge(expiryDate) !== null;
}

// Une certification "vérifiée" dont la date d'expiration est passée n'est
// plus une preuve valide : ne jamais la compter comme un indicateur de
// confiance actif (badges, statistiques) sans vérifier aussi l'expiration.
export function isCertificationCurrentlyValid(certification: {
  verificationStatus: string;
  expiryDate: Date | null;
}): boolean {
  if (certification.verificationStatus !== "VERIFIED") return false;
  if (!certification.expiryDate) return true;
  return certification.expiryDate.getTime() > Date.now();
}
