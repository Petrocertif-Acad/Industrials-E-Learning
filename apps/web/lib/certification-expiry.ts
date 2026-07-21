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
