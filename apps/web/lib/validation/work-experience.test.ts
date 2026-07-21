import { describe, it, expect } from "vitest";
import { workExperienceSchema } from "./work-experience";

const VALID_COUNTRY_ID = "00000000-0000-4000-8000-000000000001";

const validInput = {
  projectName: "Extension unité de raffinage",
  employer: "Industrials Demo SARL",
  client: "",
  countryId: VALID_COUNTRY_ID,
  sector: "",
  role: "Soudeur GTAW",
  startDate: "2023-02-01",
  endDate: "2023-11-30",
  description: "",
  equipmentUsed: "",
  materialsWorked: "",
  processesApplied: "",
  standardsUsed: "",
  responsibilities: "",
  referenceContact: "",
};

describe("workExperienceSchema", () => {
  it("accepts a valid experience with an end date after the start date", () => {
    expect(workExperienceSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts an ongoing experience with no end date", () => {
    expect(workExperienceSchema.safeParse({ ...validInput, endDate: undefined }).success).toBe(true);
  });

  it("rejects an end date before the start date", () => {
    const result = workExperienceSchema.safeParse({
      ...validInput,
      startDate: "2023-11-30",
      endDate: "2023-02-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.endDate?.[0]).toBeDefined();
    }
  });

  it("accepts an end date equal to the start date", () => {
    const result = workExperienceSchema.safeParse({
      ...validInput,
      startDate: "2023-02-01",
      endDate: "2023-02-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty project name", () => {
    expect(workExperienceSchema.safeParse({ ...validInput, projectName: "" }).success).toBe(false);
  });

  it("rejects a non-UUID countryId", () => {
    expect(workExperienceSchema.safeParse({ ...validInput, countryId: "not-a-uuid" }).success).toBe(false);
  });

  it("rejects an invalid start date", () => {
    expect(workExperienceSchema.safeParse({ ...validInput, startDate: "not-a-date" }).success).toBe(false);
  });
});
