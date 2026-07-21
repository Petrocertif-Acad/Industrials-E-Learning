import { describe, it, expect } from "vitest";
import { buildProfileCompletenessChecklist } from "./technician";

describe("buildProfileCompletenessChecklist", () => {
  const completeProfile = {
    primaryTradeId: "trade-1",
    countryId: "country-1",
    skillsCount: 3,
    certificationsCount: 2,
    workExperiencesCount: 1,
  };

  it("marks every item done for a fully complete profile", () => {
    const checklist = buildProfileCompletenessChecklist(completeProfile);
    expect(checklist.every((item) => item.done)).toBe(true);
    expect(checklist).toHaveLength(4);
  });

  it("marks the trade/country item as not done when either is missing", () => {
    const checklist = buildProfileCompletenessChecklist({ ...completeProfile, primaryTradeId: null });
    expect(checklist[0].done).toBe(false);
  });

  it("marks skills/certifications/experience items as not done when counts are zero", () => {
    const checklist = buildProfileCompletenessChecklist({
      ...completeProfile,
      skillsCount: 0,
      certificationsCount: 0,
      workExperiencesCount: 0,
    });
    expect(checklist[1].done).toBe(false);
    expect(checklist[2].done).toBe(false);
    expect(checklist[3].done).toBe(false);
  });

  it("uses the raw translation key as the label when no translator is provided", () => {
    const checklist = buildProfileCompletenessChecklist(completeProfile);
    expect(checklist[0].label).toBe("tradeAndCountry");
  });

  it("uses the provided translator to produce the label", () => {
    const t = (key: string) => `translated:${key}`;
    const checklist = buildProfileCompletenessChecklist(completeProfile, t);
    expect(checklist[0].label).toBe("translated:tradeAndCountry");
    expect(checklist[1].label).toBe("translated:hasSkill");
  });
});
