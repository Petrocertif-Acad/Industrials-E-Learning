import { describe, it, expect } from "vitest";
import { getAvailabilityLabels, getMobilityLabels, AVAILABILITY_TONE } from "./availability-labels";

describe("getAvailabilityLabels", () => {
  const statuses = ["AVAILABLE", "AVAILABLE_SOON", "UNAVAILABLE"];

  it("returns a label for every status in both locales", () => {
    for (const locale of ["fr", "en"]) {
      const labels = getAvailabilityLabels(locale);
      for (const status of statuses) {
        expect(labels[status]).toBeTruthy();
      }
    }
  });

  it("differs between French and English", () => {
    expect(getAvailabilityLabels("fr").AVAILABLE).not.toBe(getAvailabilityLabels("en").AVAILABLE);
  });
});

describe("getMobilityLabels", () => {
  const scopes = ["LOCAL", "NATIONAL", "INTERNATIONAL"];

  it("returns a label for every scope in both locales", () => {
    for (const locale of ["fr", "en"]) {
      const labels = getMobilityLabels(locale);
      for (const scope of scopes) {
        expect(labels[scope]).toBeTruthy();
      }
    }
  });
});

describe("AVAILABILITY_TONE", () => {
  it("marks AVAILABLE as a success tone and UNAVAILABLE as neutral", () => {
    expect(AVAILABILITY_TONE.AVAILABLE).toBe("success");
    expect(AVAILABILITY_TONE.UNAVAILABLE).toBe("neutral");
  });
});
