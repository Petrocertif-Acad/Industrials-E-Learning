import { describe, it, expect } from "vitest";
import { registerOrganizationSchema, organizationProfileSchema } from "./organization";

const VALID_COUNTRY_ID = "00000000-0000-4000-8000-000000000001";

describe("registerOrganizationSchema", () => {
  const validInput = {
    email: "org@example.com",
    password: "LongEnoughPassword1",
    name: "Chantiers Test Afrique SARL",
    countryId: VALID_COUNTRY_ID,
  };

  it("accepts a valid registration", () => {
    expect(registerOrganizationSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects a non-UUID countryId", () => {
    const result = registerOrganizationSchema.safeParse({ ...validInput, countryId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty company name", () => {
    const result = registerOrganizationSchema.safeParse({ ...validInput, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 10 characters", () => {
    const result = registerOrganizationSchema.safeParse({ ...validInput, password: "short1" });
    expect(result.success).toBe(false);
  });
});

describe("organizationProfileSchema", () => {
  const validInput = {
    name: "Chantiers Test Afrique SARL",
    countryId: VALID_COUNTRY_ID,
  };

  it("accepts a valid profile with optional fields omitted", () => {
    expect(organizationProfileSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts an empty string for optional website (progressive form submission)", () => {
    const result = organizationProfileSchema.safeParse({ ...validInput, website: "" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid website URL", () => {
    const result = organizationProfileSchema.safeParse({ ...validInput, website: "not a url" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid website URL", () => {
    const result = organizationProfileSchema.safeParse({ ...validInput, website: "https://example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects a description longer than 2000 characters", () => {
    const result = organizationProfileSchema.safeParse({ ...validInput, description: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });
});
