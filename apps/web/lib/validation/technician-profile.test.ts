import { describe, it, expect } from "vitest";
import { profileBasicsSchema, technicianSkillsSchema } from "./technician-profile";

const PRIMARY_TRADE_ID = "00000000-0000-4000-8000-000000000010";
const SECONDARY_TRADE_ID = "00000000-0000-4000-8000-000000000011";
const COUNTRY_ID = "00000000-0000-4000-8000-000000000001";

const validInput = {
  primaryTradeId: PRIMARY_TRADE_ID,
  secondaryTradeIds: [SECONDARY_TRADE_ID],
  countryId: COUNTRY_ID,
  city: "Casablanca",
  yearsExperience: 7,
  availability: "AVAILABLE" as const,
  mobilityScope: "INTERNATIONAL" as const,
  visibility: "PUBLIC_FULL" as const,
};

describe("profileBasicsSchema", () => {
  it("accepts a valid profile", () => {
    expect(profileBasicsSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects a secondary trade identical to the primary trade", () => {
    const result = profileBasicsSchema.safeParse({
      ...validInput,
      secondaryTradeIds: [PRIMARY_TRADE_ID],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.secondaryTradeIds?.[0]).toBeDefined();
    }
  });

  it("rejects more than 5 secondary trades", () => {
    const sixTrades = Array.from({ length: 6 }, (_, i) => `00000000-0000-4000-8000-00000000002${i}`);
    const result = profileBasicsSchema.safeParse({ ...validInput, secondaryTradeIds: sixTrades });
    expect(result.success).toBe(false);
  });

  it("rejects a negative years of experience", () => {
    expect(profileBasicsSchema.safeParse({ ...validInput, yearsExperience: -1 }).success).toBe(false);
  });

  it("rejects years of experience above 60", () => {
    expect(profileBasicsSchema.safeParse({ ...validInput, yearsExperience: 61 }).success).toBe(false);
  });

  it("rejects an invalid availability enum value", () => {
    expect(
      profileBasicsSchema.safeParse({ ...validInput, availability: "SOMETIMES" }).success
    ).toBe(false);
  });

  it("accepts an empty secondary trades list", () => {
    expect(profileBasicsSchema.safeParse({ ...validInput, secondaryTradeIds: [] }).success).toBe(true);
  });
});

describe("technicianSkillsSchema", () => {
  it("accepts a valid list of skills", () => {
    const result = technicianSkillsSchema.safeParse({
      skills: [{ skillId: "00000000-0000-4000-8000-000000000030", selfLevel: "ADVANCED" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty skills list", () => {
    expect(technicianSkillsSchema.safeParse({ skills: [] }).success).toBe(true);
  });

  it("rejects an invalid skill level", () => {
    const result = technicianSkillsSchema.safeParse({
      skills: [{ skillId: "00000000-0000-4000-8000-000000000030", selfLevel: "MASTER" }],
    });
    expect(result.success).toBe(false);
  });
});
