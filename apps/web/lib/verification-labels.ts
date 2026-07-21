export type BadgeTone = "neutral" | "success" | "warning" | "danger";

// Statuts d'un document/certification/expérience (DocumentVerificationStatus).
const DOCUMENT_VERIFICATION_LABELS_FR: Record<string, string> = {
  DECLARED: "Déclarée",
  UNDER_REVIEW: "En cours de vérification",
  VERIFIED: "Vérifiée",
  REJECTED: "Rejetée",
  EXPIRED: "Expirée",
};

const DOCUMENT_VERIFICATION_LABELS_EN: Record<string, string> = {
  DECLARED: "Declared",
  UNDER_REVIEW: "Under review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export function getDocumentVerificationLabels(locale: string): Record<string, string> {
  return locale === "en" ? DOCUMENT_VERIFICATION_LABELS_EN : DOCUMENT_VERIFICATION_LABELS_FR;
}

export const DOCUMENT_VERIFICATION_TONE: Record<string, BadgeTone> = {
  DECLARED: "neutral",
  UNDER_REVIEW: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
  EXPIRED: "danger",
};

// Statut global d'un profil technicien (ProfileVerificationStatus).
const PROFILE_VERIFICATION_LABELS_FR: Record<string, string> = {
  INCOMPLETE: "Profil incomplet",
  DECLARED: "Profil déclaré",
  IDENTITY_VERIFIED: "Identité vérifiée",
  DOCUMENTS_PENDING: "Documents en cours de vérification",
  PARTIALLY_VERIFIED: "Profil partiellement vérifié",
  PROFESSIONALLY_VERIFIED: "Profil professionnel vérifié",
  PREMIUM_VERIFIED: "Profil premium vérifié",
  SUSPENDED: "Profil suspendu",
  ARCHIVED: "Profil archivé",
};

const PROFILE_VERIFICATION_LABELS_EN: Record<string, string> = {
  INCOMPLETE: "Incomplete profile",
  DECLARED: "Declared profile",
  IDENTITY_VERIFIED: "Identity verified",
  DOCUMENTS_PENDING: "Documents under review",
  PARTIALLY_VERIFIED: "Partially verified profile",
  PROFESSIONALLY_VERIFIED: "Professionally verified profile",
  PREMIUM_VERIFIED: "Premium verified profile",
  SUSPENDED: "Suspended profile",
  ARCHIVED: "Archived profile",
};

export function getProfileVerificationLabels(locale: string): Record<string, string> {
  return locale === "en" ? PROFILE_VERIFICATION_LABELS_EN : PROFILE_VERIFICATION_LABELS_FR;
}

export const PROFILE_VERIFICATION_TONE: Record<string, BadgeTone> = {
  INCOMPLETE: "neutral",
  DECLARED: "neutral",
  IDENTITY_VERIFIED: "warning",
  DOCUMENTS_PENDING: "warning",
  PARTIALLY_VERIFIED: "warning",
  PROFESSIONALLY_VERIFIED: "success",
  PREMIUM_VERIFIED: "success",
  SUSPENDED: "danger",
  ARCHIVED: "danger",
};
