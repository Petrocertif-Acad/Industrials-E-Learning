import type { BadgeTone } from "@/lib/verification-labels";

export const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  AVAILABLE_SOON: "Disponible prochainement",
  UNAVAILABLE: "Non disponible",
};

export const AVAILABILITY_TONE: Record<string, BadgeTone> = {
  AVAILABLE: "success",
  AVAILABLE_SOON: "warning",
  UNAVAILABLE: "neutral",
};

export const MOBILITY_LABELS: Record<string, string> = {
  LOCAL: "Mobilité locale",
  NATIONAL: "Mobilité nationale",
  INTERNATIONAL: "Mobilité internationale",
};
