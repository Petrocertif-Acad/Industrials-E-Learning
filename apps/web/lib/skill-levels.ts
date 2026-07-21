const SKILL_LEVEL_LABELS_FR: Record<string, string> = {
  NOT_ASSESSED: "Non évalué",
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
  EXPERT: "Expert",
};

const SKILL_LEVEL_LABELS_EN: Record<string, string> = {
  NOT_ASSESSED: "Not assessed",
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

export function getSkillLevelLabels(locale: string): Record<string, string> {
  return locale === "en" ? SKILL_LEVEL_LABELS_EN : SKILL_LEVEL_LABELS_FR;
}
