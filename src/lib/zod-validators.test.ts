import { describe, expect, it } from "vitest";

import { emailSchema } from "./zod-validators";

describe("emailSchema", () => {
  it("accepts a valid email", () => {
    expect(emailSchema.parse("user@example.com")).toBe("user@example.com");
  });

  it("rejects a malformed email", () => {
    expect(() => emailSchema.parse("not-an-email")).toThrow();
  });

  it("rejects an empty string", () => {
    expect(() => emailSchema.parse("")).toThrow();
  });
});
