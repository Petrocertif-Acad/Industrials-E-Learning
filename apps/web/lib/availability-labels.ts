import type { BadgeTone } from "@/lib/verification-labels";

const AVAILABILITY_LABELS_FR: Record<string, string> = {
  AVAILABLE: "Disponible",
  AVAILABLE_SOON: "Disponible prochainement",
  UNAVAILABLE: "Non disponible",
};

const AVAILABILITY_LABELS_EN: Record<string, string> = {
  AVAILABLE: "Available",
  AVAILABLE_SOON: "Available soon",
  UNAVAILABLE: "Unavailable",
};

export function getAvailabilityLabels(locale: string): Record<string, string> {
  return locale === "en" ? AVAILABILITY_LABELS_EN : AVAILABILITY_LABELS_FR;
}

export const AVAILABILITY_TONE: Record<string, BadgeTone> = {
  AVAILABLE: "success",
  AVAILABLE_SOON: "warning",
  UNAVAILABLE: "neutral",
};

const MOBILITY_LABELS_FR: Record<string, string> = {
  LOCAL: "Mobilité locale",
  NATIONAL: "Mobilité nationale",
  INTERNATIONAL: "Mobilité internationale",
};

const MOBILITY_LABELS_EN: Record<string, string> = {
  LOCAL: "Local mobility",
  NATIONAL: "National mobility",
  INTERNATIONAL: "International mobility",
};

export function getMobilityLabels(locale: string): Record<string, string> {
  return locale === "en" ? MOBILITY_LABELS_EN : MOBILITY_LABELS_FR;
}
