import { describe, expect, it, vi } from "vitest";

import {
  UserFacingError,
  toUserFacingMessage,
  withActionResult,
} from "./action-result";

describe("toUserFacingMessage", () => {
  it("returns the message from a UserFacingError", () => {
    const err = new UserFacingError("Invite limit reached.");

    expect(toUserFacingMessage(err)).toBe("Invite limit reached.");
  });

  it("collapses a plain Error to the default fallback", () => {
    expect(toUserFacingMessage(new Error("db exploded"))).toBe(
      "Something went wrong",
    );
  });

  it("collapses non-error values to the default fallback", () => {
    expect(toUserFacingMessage("nope")).toBe("Something went wrong");
    expect(toUserFacingMessage(undefined)).toBe("Something went wrong");
  });

  it("uses a custom fallback when provided", () => {
    expect(toUserFacingMessage(new Error("boom"), "Custom fallback")).toBe(
      "Custom fallback",
    );
  });
});

describe("withActionResult", () => {
  it("wraps a successful call in an ok result", async () => {
    const wrapped = withActionResult("test", async (n: number) => n * 2);

    await expect(wrapped(3)).resolves.toEqual({ ok: true, data: 6 });
  });

  it("surfaces UserFacingError messages on failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const wrapped = withActionResult("test", async () => {
      throw new UserFacingError("Visible to user");
    });

    await expect(wrapped()).resolves.toEqual({
      ok: false,
      error: "Visible to user",
    });
  });

  it("hides non-user-facing errors behind the fallback", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const wrapped = withActionResult("test", async () => {
      throw new Error("internal detail");
    });

    await expect(wrapped()).resolves.toEqual({
      ok: false,
      error: "Something went wrong",
    });
  });

  it("rethrows framework digest errors untouched", async () => {
    const redirect = Object.assign(new Error("redirect"), {
      digest: "NEXT_REDIRECT;replace;/",
    });
    const wrapped = withActionResult("test", async () => {
      throw redirect;
    });

    await expect(wrapped()).rejects.toBe(redirect);
  });
});
