import { describe, it, expect } from "vitest";
import { trainingSchema } from "./training";

const validInput = {
  title: "Techniques avancées de soudage GTAW",
  provider: "Institut de soudage industriel",
  category: "WELDING",
  hours: "24",
  completionDate: "2025-06-01",
  description: "",
};

describe("trainingSchema", () => {
  it("accepts a valid training", () => {
    expect(trainingSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts a training with no category or hours", () => {
    expect(
      trainingSchema.safeParse({ ...validInput, category: undefined, hours: undefined }).success
    ).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(trainingSchema.safeParse({ ...validInput, title: "" }).success).toBe(false);
  });

  it("rejects an empty provider", () => {
    expect(trainingSchema.safeParse({ ...validInput, provider: "" }).success).toBe(false);
  });

  it("rejects a completion date in the future", () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const result = trainingSchema.safeParse({
      ...validInput,
      completionDate: nextYear.toISOString().slice(0, 10),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.completionDate?.[0]).toBeDefined();
    }
  });

  it("rejects an invalid completion date", () => {
    expect(trainingSchema.safeParse({ ...validInput, completionDate: "not-a-date" }).success).toBe(false);
  });

  it("rejects an unknown category", () => {
    expect(trainingSchema.safeParse({ ...validInput, category: "NOT_A_CATEGORY" }).success).toBe(false);
  });

  it("rejects zero or negative hours", () => {
    expect(trainingSchema.safeParse({ ...validInput, hours: "0" }).success).toBe(false);
  });
});
