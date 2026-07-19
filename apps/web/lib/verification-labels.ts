export type BadgeTone = "neutral" | "success" | "warning" | "danger";

// Statuts d'un document/certification/expérience (DocumentVerificationStatus).
export const DOCUMENT_VERIFICATION_LABELS: Record<string, string> = {
  DECLARED: "Déclarée",
  UNDER_REVIEW: "En cours de vérification",
  VERIFIED: "Vérifiée",
  REJECTED: "Rejetée",
  EXPIRED: "Expirée",
};

export const DOCUMENT_VERIFICATION_TONE: Record<string, BadgeTone> = {
  DECLARED: "neutral",
  UNDER_REVIEW: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
  EXPIRED: "danger",
};

// Statut global d'un profil technicien (ProfileVerificationStatus).
export const PROFILE_VERIFICATION_LABELS: Record<string, string> = {
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
