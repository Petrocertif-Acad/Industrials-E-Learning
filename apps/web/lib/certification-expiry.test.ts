import { describe, it, expect } from "vitest";
import { getExpiryBadge, isExpiringSoonOrExpired, isCertificationCurrentlyValid } from "./certification-expiry";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * DAY_MS);
}

describe("getExpiryBadge", () => {
  it("returns null for a null expiry date", () => {
    expect(getExpiryBadge(null)).toBeNull();
  });

  it("returns null for a date far in the future", () => {
    expect(getExpiryBadge(daysFromNow(365))).toBeNull();
  });

  it("returns a warning badge within the 60-day window", () => {
    const badge = getExpiryBadge(daysFromNow(30));
    expect(badge?.tone).toBe("warning");
    expect(badge?.label).toContain("Expire dans");
  });

  it("returns a danger badge for a past expiry date", () => {
    const badge = getExpiryBadge(daysFromNow(-10));
    expect(badge?.tone).toBe("danger");
    expect(badge?.label).toBe("Expirée");
  });
});

describe("isExpiringSoonOrExpired", () => {
  it("is false when there is no expiry date", () => {
    expect(isExpiringSoonOrExpired(null)).toBe(false);
  });

  it("is false for a date far in the future", () => {
    expect(isExpiringSoonOrExpired(daysFromNow(365))).toBe(false);
  });

  it("is true for a date within the warning window", () => {
    expect(isExpiringSoonOrExpired(daysFromNow(10))).toBe(true);
  });

  it("is true for an already-expired date", () => {
    expect(isExpiringSoonOrExpired(daysFromNow(-1))).toBe(true);
  });
});

describe("isCertificationCurrentlyValid", () => {
  it("is false when the status is not VERIFIED, regardless of expiry", () => {
    expect(
      isCertificationCurrentlyValid({ verificationStatus: "DECLARED", expiryDate: daysFromNow(365) })
    ).toBe(false);
  });

  it("is true when verified with no expiry date (never expires)", () => {
    expect(isCertificationCurrentlyValid({ verificationStatus: "VERIFIED", expiryDate: null })).toBe(true);
  });

  it("is true when verified and the expiry date is in the future", () => {
    expect(
      isCertificationCurrentlyValid({ verificationStatus: "VERIFIED", expiryDate: daysFromNow(30) })
    ).toBe(true);
  });

  it("is false when verified but the expiry date has passed", () => {
    expect(
      isCertificationCurrentlyValid({ verificationStatus: "VERIFIED", expiryDate: daysFromNow(-1) })
    ).toBe(false);
  });
});
