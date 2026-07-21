import { describe, it, expect } from "vitest";
import { verificationDecisionSchema } from "./verification";

const VALID_ID = "00000000-0000-4000-8000-000000000040";

describe("verificationDecisionSchema", () => {
  it("accepts a valid VERIFIED decision", () => {
    expect(verificationDecisionSchema.safeParse({ id: VALID_ID, decision: "VERIFIED" }).success).toBe(true);
  });

  it("accepts a valid REJECTED decision with a note", () => {
    const result = verificationDecisionSchema.safeParse({
      id: VALID_ID,
      decision: "REJECTED",
      note: "Document illisible.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid decision value", () => {
    expect(verificationDecisionSchema.safeParse({ id: VALID_ID, decision: "MAYBE" }).success).toBe(false);
  });

  it("rejects a non-UUID id", () => {
    expect(verificationDecisionSchema.safeParse({ id: "not-a-uuid", decision: "VERIFIED" }).success).toBe(false);
  });

  it("rejects a note longer than 500 characters", () => {
    const result = verificationDecisionSchema.safeParse({
      id: VALID_ID,
      decision: "REJECTED",
      note: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
