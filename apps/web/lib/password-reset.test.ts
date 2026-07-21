import { describe, it, expect } from "vitest";
import { generatePasswordResetToken, hashPasswordResetToken } from "./password-reset";

describe("generatePasswordResetToken", () => {
  it("generates a token whose hash matches the returned tokenHash", () => {
    const { token, tokenHash } = generatePasswordResetToken();
    expect(hashPasswordResetToken(token)).toBe(tokenHash);
  });

  it("generates a sufficiently long random hex token", () => {
    const { token } = generatePasswordResetToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generates different tokens on each call", () => {
    const first = generatePasswordResetToken();
    const second = generatePasswordResetToken();
    expect(first.token).not.toBe(second.token);
    expect(first.tokenHash).not.toBe(second.tokenHash);
  });
});

describe("hashPasswordResetToken", () => {
  it("is deterministic for the same input", () => {
    expect(hashPasswordResetToken("same-token")).toBe(hashPasswordResetToken("same-token"));
  });

  it("produces different hashes for different tokens", () => {
    expect(hashPasswordResetToken("token-a")).not.toBe(hashPasswordResetToken("token-b"));
  });

  it("never returns the raw token itself", () => {
    expect(hashPasswordResetToken("my-secret-token")).not.toBe("my-secret-token");
  });
});
