import { describe, it, expect } from "vitest";
import { localizedName } from "./localized-name";

describe("localizedName", () => {
  const entity = { nameFr: "Soudeur GTAW", nameEn: "GTAW welder" };

  it("returns the French name for the fr locale", () => {
    expect(localizedName(entity, "fr")).toBe("Soudeur GTAW");
  });

  it("returns the English name for the en locale", () => {
    expect(localizedName(entity, "en")).toBe("GTAW welder");
  });

  it("falls back to French for any locale other than en", () => {
    expect(localizedName(entity, "de")).toBe("Soudeur GTAW");
    expect(localizedName(entity, "")).toBe("Soudeur GTAW");
  });
});
