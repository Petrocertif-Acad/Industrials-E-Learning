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
    ...overrides,
  };
}

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
      })
    );

    const result = await calculateTechnicianScore("technician-1");

    expect(result.technicalScore).toBe(25); // verifiedLevel -> coefficient 1, EXPERT -> 1
    expect(result.certificationScore).toBe(20);
    expect(result.experienceScore).toBe(15);
    expect(result.mobilityScore).toBe(3);
    expect(result.verificationScore).toBe(2);
    expect(result.totalScore).toBe(65); // 25 + 20 + 15 + 3 + 2; safety/employability/training are 0 (unavailable)
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

  it("always includes the four unavailable sub-parts at zero with an explicit explanation", async () => {
    findUniqueOrThrow.mockResolvedValue(buildProfile());

    const result = await calculateTechnicianScore("technician-1");
    const unavailableKeys = ["practicalAssessment", "safety", "employability", "continuousTraining"];
    for (const key of unavailableKeys) {
      const item = result.calculationDetails.breakdown.find((entry) => entry.key === key);
      expect(item?.points).toBe(0);
      expect(item?.explanation).toContain("non disponible");
    }
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
      })
    );

    const result = await calculateTechnicianScore("technician-1");
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });
});
