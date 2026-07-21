import { describe, it, expect } from "vitest";
import { employerReviewSchema } from "./employer-review";

const VALID_TECHNICIAN_ID = "00000000-0000-4000-8000-000000000003";

const validInput = {
  technicianId: VALID_TECHNICIAN_ID,
  rating: "5",
  context: "Chantier de maintenance industrielle, 3 mois",
  comment: "Excellent technicien, très rigoureux.",
};

describe("employerReviewSchema", () => {
  it("accepts a valid review", () => {
    expect(employerReviewSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts a review with no context or comment", () => {
    expect(
      employerReviewSchema.safeParse({ ...validInput, context: undefined, comment: undefined }).success
    ).toBe(true);
  });

  it("rejects a rating of 0", () => {
    expect(employerReviewSchema.safeParse({ ...validInput, rating: "0" }).success).toBe(false);
  });

  it("rejects a rating above 5", () => {
    expect(employerReviewSchema.safeParse({ ...validInput, rating: "6" }).success).toBe(false);
  });

  it("rejects a non-UUID technicianId", () => {
    expect(employerReviewSchema.safeParse({ ...validInput, technicianId: "not-a-uuid" }).success).toBe(false);
  });

  it("accepts every rating from 1 to 5", () => {
    for (const rating of ["1", "2", "3", "4", "5"]) {
      expect(employerReviewSchema.safeParse({ ...validInput, rating }).success).toBe(true);
    }
  });
});
