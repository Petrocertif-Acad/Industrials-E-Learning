import { describe, it, expect, vi, beforeEach } from "vitest";

const findUniqueOrThrow = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    technicianProfile: { findUniqueOrThrow: (...args: unknown[]) => findUniqueOrThrow(...args) },
  },
}));

const { calculateTechnicianScore } = await import("./score");

interface FixtureOverrides {
  primaryTradeId?: string | null;
  countryId?: string | null;
  yearsExperience?: number;
  availability?: string;
  mobilityScope?: string;
  skills?: unknown[];
  certifications?: unknown[];
  workExperiences?: unknown[];
  trainings?: unknown[];
  employerReviews?: unknown[];
  assessments?: unknown[];
}

function buildProfile(overrides: FixtureOverrides = {}) {
  return {
    id: "technician-1",
    primaryTradeId: "trade-1",
    countryId: "country-1",
    yearsExperience: 0,
    availability: "UNAVAILABLE",
    mobilityScope: "LOCAL",
    skills: [],
    certifications: [],
    workExperiences: [],
    trainings: [],
    employerReviews: [],
    assessments: [],
    ...overrides,
  };
}

const oneYearAgo = () => new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
const fiveYearsAgo = () => new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000);

beforeEach(() => {
  findUniqueOrThrow.mockReset();
});

describe("calculateTechnicianScore", () => {
  it("scores an empty profile at (close to) zero, with only mobility/verification contributing", () => {
    findUniqueOrThrow.mockResolvedValue(buildProfile());

    return calculateTechnicianScore("technician-1").then((result) => {
      expect(result.technicalScore).toBe(0);
      expect(result.certificationScore).toBe(0);
      expect(result.experienceScore).toBe(0);
      expect(result.safetyScore).toBe(0);
      expect(result.employabilityScore).toBe(0);
      expect(result.continuousTrainingScore).toBe(0);
      // UNAVAILABLE (0.3) + LOCAL (0.4) averaged, over 3 points.
      expect(result.mobilityScore).toBeCloseTo(1.05, 2);
      // Trade + country are set, but no skills/certs/experience: 1/4 checklist items done.
      expect(result.verificationScore).toBeCloseTo(0.5, 2);
    });
  });

  it("gives full marks for an ideal candidate across every computable sub-score", async () => {
    findUniqueOrThrow.mockResolvedValue(
      buildProfile({
        yearsExperience: 20, // capped at the 10-year target
        availability: "AVAILABLE",
        mobilityScope: "INTERNATIONAL",
        skills: [
          { verifiedLevel: "EXPERT", selfLevel: "EXPERT", reliabilityCoefficient: "0.40" },
          { verifiedLevel: "EXPERT", selfLevel: "EXPERT", reliabilityCoefficient: "0.40" },
        ],
        // 3 VERIFIED certs needed to reach the ratio cap: coefficient 0.8 each,
        // target weighted count is 2 -> 3 * 0.8 = 2.4 >= 2.
        certifications: [
          { verificationStatus: "VERIFIED", expiryDate: null },
          { verificationStatus: "VERIFIED", expiryDate: null },
          { verificationStatus: "VERIFIED", expiryDate: null },
        ],
        workExperiences: [
          { verificationStatus: "VERIFIED" },
          { verificationStatus: "VERIFIED" },
        ],
        // Same target-weighted-count logic as certifications: 3 VERIFIED
        // trainings (0.8 each) needed to clear the 2-point cap and reach the
        // maximum continuous-training ratio.
        trainings: [
          { verificationStatus: "VERIFIED", completionDate: oneYearAgo() },
          { verificationStatus: "VERIFIED", completionDate: oneYearAgo() },
          { verificationStatus: "VERIFIED", completionDate: oneYearAgo() },
        ],
        // A perfect average rating maxes the ratio regardless of review count.
        employerReviews: [{ rating: 5 }, { rating: 5 }],
        // Perfect assessment scores max the 15-pt practical-assessment share
        // of technicalScore (25 skills + 15 assessments = 40).
        assessments: [{ score: 100 }, { score: 100 }],
      })
    );

    const result = await calculateTechnicianScore("technician-1");

    expect(result.technicalScore).toBe(40); // 25 (skills) + 15 (assessments)
    expect(result.certificationScore).toBe(20);
    expect(result.experienceScore).toBe(15);
    expect(result.mobilityScore).toBe(3);
    expect(result.verificationScore).toBe(2);
    expect(result.continuousTrainingScore).toBe(5);
    expect(result.employabilityScore).toBe(5);
    expect(result.totalScore).toBe(90); // 40 + 20 + 15 + 3 + 2 + 5 + 5; safety is 0 (unavailable)
  });

  it("excludes expired certifications from the certification score even if marked VERIFIED", async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    findUniqueOrThrow.mockResolvedValue(
      buildProfile({
        certifications: [{ verificationStatus: "VERIFIED", expiryDate: yesterday }],
      })
    );

    const result = await calculateTechnicianScore("technician-1");
    expect(result.certificationScore).toBe(0);
  });

  it("includes a certification with a future expiry date", async () => {
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    findUniqueOrThrow.mockResolvedValue(
      buildProfile({
        certifications: [{ verificationStatus: "VERIFIED", expiryDate: nextYear }],
      })
    );

    const result = await calculateTechnicianScore("technician-1");
    expect(result.certificationScore).toBeGreaterThan(0);
  });

  it("excludes REJECTED certifications entirely", async () => {
    findUniqueOrThrow.mockResolvedValue(
      buildProfile({
        certifications: [{ verificationStatus: "REJECTED", expiryDate: null }],
      })
    );

    const result = await calculateTechnicianScore("technician-1");
    expect(result.certificationScore).toBe(0);
  });

  it("weighs a declared (unverified) skill lower than a verified one", async () => {
    const declaredOnly = buildProfile({
      skills: [{ verifiedLevel: null, selfLevel: "EXPERT", reliabilityCoefficient: "0.40" }],
    });
    const verified = buildProfile({
      skills: [{ verifiedLevel: "EXPERT", selfLevel: "EXPERT", reliabilityCoefficient: "0.40" }],
    });

    findUniqueOrThrow.mockResolvedValueOnce(declaredOnly);
    const declaredResult = await calculateTechnicianScore("technician-1");

    findUniqueOrThrow.mockResolvedValueOnce(verified);
    const verifiedResult = await calculateTechnicianScore("technician-1");

    expect(verifiedResult.technicalScore).toBeGreaterThan(declaredResult.technicalScore);
  });

  it("always includes the one unavailable sub-part (safety) at zero with an explicit explanation", async () => {
    findUniqueOrThrow.mockResolvedValue(buildProfile());

    const result = await calculateTechnicianScore("technician-1");
    const item = result.calculationDetails.breakdown.find((entry) => entry.key === "safety");
    expect(item?.points).toBe(0);
    expect(item?.explanation).toContain("non disponible");
  });

  it("scores practical assessments as the average score out of 100, rescaled to 15 points", async () => {
    findUniqueOrThrow.mockResolvedValue(
      buildProfile({
        assessments: [{ score: 80 }, { score: 60 }],
      })
    );

    const result = await calculateTechnicianScore("technician-1");
    // average score 70/100 -> 70% of 15 points = 10.5, folded into technicalScore.
    expect(result.technicalScore).toBe(10.5);
    const item = result.calculationDetails.breakdown.find((entry) => entry.key === "practicalAssessment");
    expect(item?.points).toBe(10.5);
    expect(item?.explanation).not.toContain("non disponible");
  });

  it("scores practical assessments at zero with no assessments recorded", async () => {
    findUniqueOrThrow.mockResolvedValue(buildProfile());

    const result = await calculateTechnicianScore("technician-1");
    const item = result.calculationDetails.breakdown.find((entry) => entry.key === "practicalAssessment");
    expect(item?.points).toBe(0);
    expect(item?.explanation).not.toContain("non disponible");
  });

  it("scores employability as the average review rating out of 5", async () => {
    findUniqueOrThrow.mockResolvedValue(
      buildProfile({
        employerReviews: [{ rating: 4 }, { rating: 2 }],
      })
    );

    const result = await calculateTechnicianScore("technician-1");
    expect(result.employabilityScore).toBe(3); // average rating 3/5 -> 3 points out of 5
  });

  it("scores employability at zero with no reviews", async () => {
    findUniqueOrThrow.mockResolvedValue(buildProfile());

    const result = await calculateTechnicianScore("technician-1");
    expect(result.employabilityScore).toBe(0);
    const item = result.calculationDetails.breakdown.find((entry) => entry.key === "employability");
    expect(item?.explanation).not.toContain("non disponible");
  });

  it("excludes trainings completed outside the 3-year continuous-training window", async () => {
    findUniqueOrThrow.mockResolvedValue(
      buildProfile({
        trainings: [{ verificationStatus: "VERIFIED", completionDate: fiveYearsAgo() }],
      })
    );

    const result = await calculateTechnicianScore("technician-1");
    expect(result.continuousTrainingScore).toBe(0);
  });

  it("excludes REJECTED trainings from the continuous-training score even if recent", async () => {
    findUniqueOrThrow.mockResolvedValue(
      buildProfile({
        trainings: [{ verificationStatus: "REJECTED", completionDate: oneYearAgo() }],
      })
    );

    const result = await calculateTechnicianScore("technician-1");
    expect(result.continuousTrainingScore).toBe(0);
  });

  it("weighs a declared (unverified) recent training lower than a verified one", async () => {
    const declared = buildProfile({
      trainings: [{ verificationStatus: "DECLARED", completionDate: oneYearAgo() }],
    });
    const verified = buildProfile({
      trainings: [{ verificationStatus: "VERIFIED", completionDate: oneYearAgo() }],
    });

    findUniqueOrThrow.mockResolvedValueOnce(declared);
    const declaredResult = await calculateTechnicianScore("technician-1");

    findUniqueOrThrow.mockResolvedValueOnce(verified);
    const verifiedResult = await calculateTechnicianScore("technician-1");

    expect(verifiedResult.continuousTrainingScore).toBeGreaterThan(declaredResult.continuousTrainingScore);
  });

  it("never produces a total score above 100 for a maxed-out profile", async () => {
    findUniqueOrThrow.mockResolvedValue(
      buildProfile({
        yearsExperience: 100,
        availability: "AVAILABLE",
        mobilityScope: "INTERNATIONAL",
        skills: Array.from({ length: 5 }, () => ({
          verifiedLevel: "EXPERT",
          selfLevel: "EXPERT",
          reliabilityCoefficient: "1.00",
        })),
        certifications: Array.from({ length: 10 }, () => ({ verificationStatus: "VERIFIED", expiryDate: null })),
        workExperiences: Array.from({ length: 5 }, () => ({ verificationStatus: "VERIFIED" })),
        trainings: Array.from({ length: 10 }, () => ({ verificationStatus: "VERIFIED", completionDate: oneYearAgo() })),
        employerReviews: Array.from({ length: 10 }, () => ({ rating: 5 })),
        assessments: Array.from({ length: 10 }, () => ({ score: 100 })),
      })
    );

    const result = await calculateTechnicianScore("technician-1");
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });
});
