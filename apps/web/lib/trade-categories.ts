import { TradeCategory } from "@/lib/generated/prisma/enums";

const TRADE_CATEGORY_LABELS_FR: Record<TradeCategory, string> = {
  WELDING: "Soudage",
  BOILERMAKING: "Chaudronnerie",
  PIPING: "Tuyauterie",
  METAL_STRUCTURES: "Structures métalliques",
  MECHANICAL_MANUFACTURING: "Fabrication mécanique",
  INDUSTRIAL_MAINTENANCE: "Maintenance industrielle",
  QUALITY_CONTROL: "Contrôle qualité et inspection",
  NON_DESTRUCTIVE_TESTING: "Contrôle non destructif",
  SUPERVISION: "Supervision",
  OTHER: "Autres métiers techniques",
};

const TRADE_CATEGORY_LABELS_EN: Record<TradeCategory, string> = {
  WELDING: "Welding",
  BOILERMAKING: "Boilermaking",
  PIPING: "Piping",
  METAL_STRUCTURES: "Metal structures",
  MECHANICAL_MANUFACTURING: "Mechanical manufacturing",
  INDUSTRIAL_MAINTENANCE: "Industrial maintenance",
  QUALITY_CONTROL: "Quality control and inspection",
  NON_DESTRUCTIVE_TESTING: "Non-destructive testing",
  SUPERVISION: "Supervision",
  OTHER: "Other technical trades",
};

export function getTradeCategoryLabels(locale: string): Record<TradeCategory, string> {
  return locale === "en" ? TRADE_CATEGORY_LABELS_EN : TRADE_CATEGORY_LABELS_FR;
}
