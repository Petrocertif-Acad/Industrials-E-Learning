import { describe, it, expect } from "vitest";
import { assessmentSchema } from "./assessment";

const VALID_TECHNICIAN_ID = "00000000-0000-4000-8000-000000000004";
const VALID_SKILL_ID = "00000000-0000-4000-8000-000000000005";

const validInput = {
  technicianId: VALID_TECHNICIAN_ID,
  skillId: VALID_SKILL_ID,
  title: "Épreuve pratique de soudage GTAW",
  score: "85",
  evaluatorName: "Institut technique de soudage",
  assessedAt: "2025-06-01",
  notes: "",
};

describe("assessmentSchema", () => {
  it("accepts a valid assessment", () => {
    expect(assessmentSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts an assessment with no linked skill", () => {
    expect(assessmentSchema.safeParse({ ...validInput, skillId: undefined }).success).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(assessmentSchema.safeParse({ ...validInput, title: "" }).success).toBe(false);
  });

  it("rejects an empty evaluator name", () => {
    expect(assessmentSchema.safeParse({ ...validInput, evaluatorName: "" }).success).toBe(false);
  });

  it("rejects a score below 0", () => {
    expect(assessmentSchema.safeParse({ ...validInput, score: "-1" }).success).toBe(false);
  });

  it("rejects a score above 100", () => {
    expect(assessmentSchema.safeParse({ ...validInput, score: "101" }).success).toBe(false);
  });

  it("accepts boundary scores 0 and 100", () => {
    expect(assessmentSchema.safeParse({ ...validInput, score: "0" }).success).toBe(true);
    expect(assessmentSchema.safeParse({ ...validInput, score: "100" }).success).toBe(true);
  });

  it("rejects an assessment date in the future", () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const result = assessmentSchema.safeParse({
      ...validInput,
      assessedAt: nextYear.toISOString().slice(0, 10),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.assessedAt?.[0]).toBeDefined();
    }
  });

  it("rejects a non-UUID technicianId", () => {
    expect(assessmentSchema.safeParse({ ...validInput, technicianId: "not-a-uuid" }).success).toBe(false);
  });
});
