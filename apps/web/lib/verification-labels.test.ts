import { describe, it, expect } from "vitest";
import {
  getDocumentVerificationLabels,
  getProfileVerificationLabels,
  DOCUMENT_VERIFICATION_TONE,
  PROFILE_VERIFICATION_TONE,
} from "./verification-labels";

describe("getDocumentVerificationLabels", () => {
  const statuses = ["DECLARED", "UNDER_REVIEW", "VERIFIED", "REJECTED", "EXPIRED"];

  it("returns a label for every status in both locales", () => {
    for (const locale of ["fr", "en"]) {
      const labels = getDocumentVerificationLabels(locale);
      for (const status of statuses) {
        expect(labels[status]).toBeTruthy();
      }
    }
  });

  it("differs between French and English", () => {
    expect(getDocumentVerificationLabels("fr").VERIFIED).not.toBe(getDocumentVerificationLabels("en").VERIFIED);
  });
});

describe("getProfileVerificationLabels", () => {
  const statuses = [
    "INCOMPLETE",
    "DECLARED",
    "IDENTITY_VERIFIED",
    "DOCUMENTS_PENDING",
    "PARTIALLY_VERIFIED",
    "PROFESSIONALLY_VERIFIED",
    "PREMIUM_VERIFIED",
    "SUSPENDED",
    "ARCHIVED",
  ];

  it("returns a label for every status in both locales", () => {
    for (const locale of ["fr", "en"]) {
      const labels = getProfileVerificationLabels(locale);
      for (const status of statuses) {
        expect(labels[status]).toBeTruthy();
      }
    }
  });
});

describe("tone maps", () => {
  it("marks VERIFIED document status as success and REJECTED as danger", () => {
    expect(DOCUMENT_VERIFICATION_TONE.VERIFIED).toBe("success");
    expect(DOCUMENT_VERIFICATION_TONE.REJECTED).toBe("danger");
  });

  it("marks SUSPENDED and ARCHIVED profile statuses as danger", () => {
    expect(PROFILE_VERIFICATION_TONE.SUSPENDED).toBe("danger");
    expect(PROFILE_VERIFICATION_TONE.ARCHIVED).toBe("danger");
  });
});
