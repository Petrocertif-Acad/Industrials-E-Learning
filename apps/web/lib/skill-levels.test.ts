import { describe, it, expect } from "vitest";
import { getSkillLevelLabels } from "./skill-levels";

const LEVELS = ["NOT_ASSESSED", "BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

describe("getSkillLevelLabels", () => {
  it("returns a label for every skill level in French", () => {
    const labels = getSkillLevelLabels("fr");
    for (const level of LEVELS) {
      expect(labels[level]).toBeTruthy();
    }
  });

  it("returns a label for every skill level in English", () => {
    const labels = getSkillLevelLabels("en");
    for (const level of LEVELS) {
      expect(labels[level]).toBeTruthy();
    }
  });

  it("returns different text between French and English", () => {
    // "Expert" is a cognate (identical in both languages) — compare a word
    // that actually differs, e.g. "Débutant" vs "Beginner".
    const fr = getSkillLevelLabels("fr");
    const en = getSkillLevelLabels("en");
    expect(fr.BEGINNER).not.toBe(en.BEGINNER);
  });

  it("falls back to French for an unknown locale", () => {
    expect(getSkillLevelLabels("de")).toEqual(getSkillLevelLabels("fr"));
  });
});
