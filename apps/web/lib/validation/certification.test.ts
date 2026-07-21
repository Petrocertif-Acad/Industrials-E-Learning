import { describe, it, expect } from "vitest";
import { technicianCertificationSchema } from "./certification";

const VALID_CERTIFICATION_ID = "00000000-0000-4000-8000-000000000002";

const validInput = {
  certificationId: VALID_CERTIFICATION_ID,
  issueDate: "2022-03-01",
  expiryDate: "2026-03-01",
  weldingProcess: "GTAW",
  materialType: "",
  materialGroup: "",
  qualifiedThickness: "",
  qualifiedDiameter: "",
  weldingPosition: "",
  jointType: "",
  fillerMetal: "",
  shieldingGas: "",
};

describe("technicianCertificationSchema", () => {
  it("accepts a valid certification with expiry after issue date", () => {
    expect(technicianCertificationSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts a certification with neither issue nor expiry date", () => {
    expect(
      technicianCertificationSchema.safeParse({ ...validInput, issueDate: undefined, expiryDate: undefined })
        .success
    ).toBe(true);
  });

  it("rejects an expiry date before the issue date", () => {
    const result = technicianCertificationSchema.safeParse({
      ...validInput,
      issueDate: "2026-03-01",
      expiryDate: "2022-03-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.expiryDate?.[0]).toBeDefined();
    }
  });

  it("accepts an expiry date equal to the issue date", () => {
    const result = technicianCertificationSchema.safeParse({
      ...validInput,
      issueDate: "2022-03-01",
      expiryDate: "2022-03-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-UUID certificationId", () => {
    expect(technicianCertificationSchema.safeParse({ ...validInput, certificationId: "not-a-uuid" }).success).toBe(
      false
    );
  });
});
