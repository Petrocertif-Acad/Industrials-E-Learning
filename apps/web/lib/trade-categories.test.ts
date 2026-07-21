import { describe, it, expect } from "vitest";
import { getTradeCategoryLabels } from "./trade-categories";

const CATEGORIES = [
  "WELDING",
  "BOILERMAKING",
  "PIPING",
  "METAL_STRUCTURES",
  "MECHANICAL_MANUFACTURING",
  "INDUSTRIAL_MAINTENANCE",
  "QUALITY_CONTROL",
  "NON_DESTRUCTIVE_TESTING",
  "SUPERVISION",
  "OTHER",
] as const;

describe("getTradeCategoryLabels", () => {
  it("returns a label for every trade category in both locales", () => {
    for (const locale of ["fr", "en"]) {
      const labels = getTradeCategoryLabels(locale);
      for (const category of CATEGORIES) {
        expect(labels[category]).toBeTruthy();
      }
    }
  });

  it("differs between French and English", () => {
    expect(getTradeCategoryLabels("fr").WELDING).not.toBe(getTradeCategoryLabels("en").WELDING);
  });

  it("falls back to French for an unknown locale", () => {
    expect(getTradeCategoryLabels("de")).toEqual(getTradeCategoryLabels("fr"));
  });
});
