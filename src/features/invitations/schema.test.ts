import { describe, expect, it } from "vitest";

import { createInvitationSchema } from "./schema";

describe("createInvitationSchema", () => {
  it("accepts a valid payload", () => {
    const result = createInvitationSchema.parse({
      name: "Jane",
      email: "jane@example.com",
    });

    expect(result).toEqual({ name: "Jane", email: "jane@example.com" });
  });

  it("rejects an empty name", () => {
    expect(() =>
      createInvitationSchema.parse({ name: "", email: "jane@example.com" }),
    ).toThrow();
  });

  it("rejects a name longer than 80 characters", () => {
    expect(() =>
      createInvitationSchema.parse({
        name: "a".repeat(81),
        email: "jane@example.com",
      }),
    ).toThrow();
  });

  it("rejects an invalid email", () => {
    expect(() =>
      createInvitationSchema.parse({ name: "Jane", email: "nope" }),
    ).toThrow();
  });
});
