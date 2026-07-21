import { describe, it, expect } from "vitest";
import { loginSchema, registerTechnicianSchema, requestPasswordResetSchema, resetPasswordSchema } from "./auth";

describe("loginSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "anything" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "anything" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerTechnicianSchema", () => {
  const validInput = {
    email: "tech@example.com",
    password: "LongEnoughPassword1",
    firstName: "Amina",
    lastName: "Fictive",
  };

  it("accepts a valid registration", () => {
    const result = registerTechnicianSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("defaults locale to FR when omitted", () => {
    const result = registerTechnicianSchema.parse(validInput);
    expect(result.locale).toBe("FR");
  });

  it("rejects a password shorter than 10 characters", () => {
    const result = registerTechnicianSchema.safeParse({ ...validInput, password: "short1" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty first name", () => {
    const result = registerTechnicianSchema.safeParse({ ...validInput, firstName: "" });
    expect(result.success).toBe(false);
  });
});

describe("requestPasswordResetSchema", () => {
  it("accepts a valid email", () => {
    expect(requestPasswordResetSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(requestPasswordResetSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts matching passwords of sufficient length", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123",
      password: "LongEnoughPassword1",
      confirmPassword: "LongEnoughPassword1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123",
      password: "LongEnoughPassword1",
      confirmPassword: "SomethingElse1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toBeDefined();
    }
  });

  it("rejects a password shorter than 10 characters", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123",
      password: "short1",
      confirmPassword: "short1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing token", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "LongEnoughPassword1",
      confirmPassword: "LongEnoughPassword1",
    });
    expect(result.success).toBe(false);
  });
});
