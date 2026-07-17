import { TradeCategory } from "@/lib/generated/prisma/enums";

export const TRADE_CATEGORY_LABELS_FR: Record<TradeCategory, string> = {
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
