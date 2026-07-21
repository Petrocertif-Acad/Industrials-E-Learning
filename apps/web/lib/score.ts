import { prisma } from "@/lib/db/prisma";
import { buildProfileCompletenessChecklist } from "@/lib/technician";

// Moteur de score ATTI — voir cadrage section 6 ("Système de scoring et de
// ranking"). Note globale sur 100, répartie en sous-scores explicables.
// Répartition d'origine du cadrage : compétences vérifiées 25 + évaluations
// pratiques 15 (= 40 pour technicalScore), certifications 20, expérience 15,
// HSE 10, avis employeurs 5, formation continue 5, disponibilité/mobilité 3,
// complétude/vérification du profil 2.
//
// Le MVP ne modélise pas encore les évaluations pratiques (Assessment) ni les
// avis employeurs (EmployerReview) : ces sous-parties valent 0 avec un motif
// explicite plutôt qu'une valeur inventée — jamais de boîte noire (cadrage
// section 13). La formation continue (TechnicianTraining) est modélisée et
// contribue au score.

const SKILL_LEVEL_VALUE: Record<string, number> = {
  NOT_ASSESSED: 0,
  BEGINNER: 0.25,
  INTERMEDIATE: 0.5,
  ADVANCED: 0.75,
  EXPERT: 1,
};

// Coefficients de fiabilité du cadrage section 6.
const DOCUMENT_STATUS_COEFFICIENT: Record<string, number> = {
  DECLARED: 0.4,
  UNDER_REVIEW: 0.4,
  VERIFIED: 0.8,
  REJECTED: 0,
  EXPIRED: 0,
};

const AVAILABILITY_RATIO: Record<string, number> = {
  AVAILABLE: 1,
  AVAILABLE_SOON: 0.6,
  UNAVAILABLE: 0.3,
};

const MOBILITY_SCOPE_RATIO: Record<string, number> = {
  LOCAL: 0.4,
  NATIONAL: 0.7,
  INTERNATIONAL: 1,
};

// Nombre de certifications valides (pondérées par leur coefficient de
// fiabilité) au-delà duquel le sous-score plafonne : plusieurs certifications
// solides comptent davantage qu'une seule, sans devenir infini.
const CERTIFICATION_TARGET_WEIGHTED_COUNT = 2;
const EXPERIENCE_TARGET_YEARS = 10;

// Formation "continue" : seules les formations achevées récemment comptent,
// pour refléter un effort de mise à jour des compétences plutôt qu'un
// historique figé. Fenêtre et cible alignées sur la même logique que les
// certifications (section 6 du cadrage), à une échelle réduite (5 pts).
const CONTINUOUS_TRAINING_WINDOW_YEARS = 3;
const CONTINUOUS_TRAINING_TARGET_WEIGHTED_COUNT = 2;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface ScoreBreakdownItem {
  key: string;
  label: string;
  points: number;
  max: number;
  explanation: string;
}

export interface ScoreCalculationDetails {
  method: string;
  breakdown: ScoreBreakdownItem[];
}

export interface ScoreCalculationResult {
  technicalScore: number;
  certificationScore: number;
  experienceScore: number;
  safetyScore: number;
  employabilityScore: number;
  continuousTrainingScore: number;
  mobilityScore: number;
  verificationScore: number;
  totalScore: number;
  calculationDetails: ScoreCalculationDetails;
}

const UNAVAILABLE_EXPLANATION = "Fonctionnalité non disponible dans cette version d'ATTI.";

export async function calculateTechnicianScore(technicianId: string): Promise<ScoreCalculationResult> {
  const profile = await prisma.technicianProfile.findUniqueOrThrow({
    where: { id: technicianId },
    include: { skills: true, certifications: true, workExperiences: true, trainings: true },
  });

  // --- Compétences techniques vérifiées (25 pts) ---
  let technicalRatio = 0;
  if (profile.skills.length > 0) {
    const sum = profile.skills.reduce((acc, skill) => {
      const levelValue = SKILL_LEVEL_VALUE[skill.verifiedLevel ?? skill.selfLevel] ?? 0;
      const coefficient = skill.verifiedLevel ? 1 : Number(skill.reliabilityCoefficient);
      return acc + levelValue * coefficient;
    }, 0);
    technicalRatio = Math.min(1, sum / profile.skills.length);
  }
  const technicalSkillsPoints = round2(technicalRatio * 25);
  const technicalScore = technicalSkillsPoints; // + 0 pt d'évaluations pratiques (non disponible)

  // --- Certifications et qualifications valides (20 pts) ---
  const now = new Date();
  const validCertifications = profile.certifications.filter(
    (c) => c.verificationStatus !== "REJECTED" && c.verificationStatus !== "EXPIRED" && (!c.expiryDate || c.expiryDate > now)
  );
  const certificationWeightedSum = validCertifications.reduce(
    (acc, c) => acc + (DOCUMENT_STATUS_COEFFICIENT[c.verificationStatus] ?? 0.4),
    0
  );
  const certificationRatio = Math.min(1, certificationWeightedSum / CERTIFICATION_TARGET_WEIGHTED_COUNT);
  const certificationScore = round2(certificationRatio * 20);

  // --- Expérience professionnelle (15 pts) ---
  const yearsRatio = Math.min(1, profile.yearsExperience / EXPERIENCE_TARGET_YEARS);
  const verifiedExperienceRatio =
    profile.workExperiences.length > 0
      ? profile.workExperiences.filter((e) => e.verificationStatus === "VERIFIED").length / profile.workExperiences.length
      : 0;
  const experienceRatio = yearsRatio * 0.7 + verifiedExperienceRatio * 0.3;
  const experienceScore = round2(experienceRatio * 15);

  // --- Disponibilité et mobilité (3 pts) ---
  const mobilityRatio =
    ((AVAILABILITY_RATIO[profile.availability] ?? 0.3) + (MOBILITY_SCOPE_RATIO[profile.mobilityScope] ?? 0.4)) / 2;
  const mobilityScore = round2(mobilityRatio * 3);

  // --- Complétude et vérification du profil (2 pts) ---
  const checklist = buildProfileCompletenessChecklist({
    primaryTradeId: profile.primaryTradeId,
    countryId: profile.countryId,
    skillsCount: profile.skills.length,
    certificationsCount: profile.certifications.length,
    workExperiencesCount: profile.workExperiences.length,
  });
  const completenessRatio = checklist.filter((item) => item.done).length / checklist.length;
  const verificationScore = round2(completenessRatio * 2);

  // --- Formation continue (5 pts) ---
  const trainingWindowStart = new Date(now);
  trainingWindowStart.setFullYear(trainingWindowStart.getFullYear() - CONTINUOUS_TRAINING_WINDOW_YEARS);
  const recentTrainings = profile.trainings.filter(
    (tr) => tr.verificationStatus !== "REJECTED" && tr.completionDate >= trainingWindowStart
  );
  const trainingWeightedSum = recentTrainings.reduce(
    (acc, tr) => acc + (DOCUMENT_STATUS_COEFFICIENT[tr.verificationStatus] ?? 0.4),
    0
  );
  const continuousTrainingRatio = Math.min(1, trainingWeightedSum / CONTINUOUS_TRAINING_TARGET_WEIGHTED_COUNT);
  const continuousTrainingScore = round2(continuousTrainingRatio * 5);

  // --- Sous-parties non disponibles dans le MVP ---
  const safetyScore = 0;
  const employabilityScore = 0;

  const totalScore = round2(
    technicalScore +
      certificationScore +
      experienceScore +
      safetyScore +
      employabilityScore +
      continuousTrainingScore +
      mobilityScore +
      verificationScore
  );

  const breakdown: ScoreBreakdownItem[] = [
    {
      key: "technicalSkills",
      label: "Compétences techniques vérifiées",
      points: technicalSkillsPoints,
      max: 25,
      explanation:
        profile.skills.length > 0
          ? `${profile.skills.length} compétence(s) déclarée(s), niveau moyen pondéré par la fiabilité des preuves : ${Math.round(technicalRatio * 100)}%.`
          : "Aucune compétence déclarée. Ajoutez vos compétences pour faire progresser ce score.",
    },
    {
      key: "practicalAssessment",
      label: "Résultats aux évaluations pratiques",
      points: 0,
      max: 15,
      explanation: UNAVAILABLE_EXPLANATION,
    },
    {
      key: "certification",
      label: "Certifications et qualifications valides",
      points: certificationScore,
      max: 20,
      explanation:
        validCertifications.length > 0
          ? `${validCertifications.length} certification(s) valide(s) et non expirée(s), pondérée(s) par leur statut de vérification.`
          : "Aucune certification valide. Ajoutez vos certificats pour faire progresser ce score.",
    },
    {
      key: "experience",
      label: "Expérience professionnelle",
      points: experienceScore,
      max: 15,
      explanation: `${profile.yearsExperience} an(s) d'expérience déclarés, dont ${profile.workExperiences.filter((e) => e.verificationStatus === "VERIFIED").length}/${profile.workExperiences.length || 0} expérience(s) vérifiée(s).`,
    },
    {
      key: "safety",
      label: "Sécurité et conformité HSE",
      points: 0,
      max: 10,
      explanation: UNAVAILABLE_EXPLANATION,
    },
    {
      key: "employability",
      label: "Évaluations des employeurs",
      points: 0,
      max: 5,
      explanation: UNAVAILABLE_EXPLANATION,
    },
    {
      key: "continuousTraining",
      label: "Formation continue",
      points: continuousTrainingScore,
      max: 5,
      explanation:
        recentTrainings.length > 0
          ? `${recentTrainings.length} formation(s) achevée(s) au cours des ${CONTINUOUS_TRAINING_WINDOW_YEARS} dernières années, pondérée(s) par leur statut de vérification.`
          : "Aucune formation continue déclarée au cours des 3 dernières années. Ajoutez vos formations pour faire progresser ce score.",
    },
    {
      key: "mobility",
      label: "Disponibilité et mobilité",
      points: mobilityScore,
      max: 3,
      explanation: "Basé sur votre statut de disponibilité et votre périmètre de mobilité déclarés.",
    },
    {
      key: "verification",
      label: "Complétude et vérification du profil",
      points: verificationScore,
      max: 2,
      explanation: `${checklist.filter((item) => item.done).length}/${checklist.length} étapes de complétude du profil validées.`,
    },
  ];

  return {
    technicalScore,
    certificationScore,
    experienceScore,
    safetyScore,
    employabilityScore,
    continuousTrainingScore,
    mobilityScore,
    verificationScore,
    totalScore,
    calculationDetails: {
      method: "ATTI v1 — voir la méthode de scoring (cadrage section 6)",
      breakdown,
    },
  };
}

export async function recalculateTechnicianScore(technicianId: string): Promise<void> {
  const result = await calculateTechnicianScore(technicianId);

  const scoreData = {
    technicalScore: result.technicalScore,
    certificationScore: result.certificationScore,
    experienceScore: result.experienceScore,
    safetyScore: result.safetyScore,
    employabilityScore: result.employabilityScore,
    continuousTrainingScore: result.continuousTrainingScore,
    mobilityScore: result.mobilityScore,
    verificationScore: result.verificationScore,
    totalScore: result.totalScore,
    calculationDetails: result.calculationDetails,
    calculatedAt: new Date(),
  };

  await prisma.$transaction([
    prisma.score.upsert({
      where: { technicianId },
      update: { ...scoreData, calculationDetails: scoreData.calculationDetails as unknown as object },
      create: { technicianId, ...scoreData, calculationDetails: scoreData.calculationDetails as unknown as object },
    }),
    prisma.scoreHistory.create({
      data: {
        technicianId,
        totalScore: result.totalScore,
        subScores: {
          technicalScore: result.technicalScore,
          certificationScore: result.certificationScore,
          experienceScore: result.experienceScore,
          safetyScore: result.safetyScore,
          employabilityScore: result.employabilityScore,
          continuousTrainingScore: result.continuousTrainingScore,
          mobilityScore: result.mobilityScore,
          verificationScore: result.verificationScore,
        },
      },
    }),
  ]);
}
