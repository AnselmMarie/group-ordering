import { describe, expect, it } from "vitest";

import { FALLBACK_CLIENT_KEY, getClientIp } from "./client-ip";

describe("getClientIp", () => {
  it("returns the single x-forwarded-for entry", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7" });

    expect(getClientIp(headers)).toBe("203.0.113.7");
  });

  it("trusts the rightmost hop by default, ignoring spoofed left entries", () => {
    const headers = new Headers({
      // The caller forged "1.1.1.1"; our proxy appended the real IP on the right.
      "x-forwarded-for": "1.1.1.1, 203.0.113.7",
    });

    expect(getClientIp(headers)).toBe("203.0.113.7");
  });

  it("honors a deeper trusted proxy count", () => {
    const headers = new Headers({
      "x-forwarded-for": "client, edge, lb",
    });

    expect(getClientIp(headers, { trustedProxyCount: 2 })).toBe("edge");
  });

  it("clamps trustedProxyCount to the available entries", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7" });

    expect(getClientIp(headers, { trustedProxyCount: 5 })).toBe("203.0.113.7");
  });

  it("trims whitespace around entries", () => {
    const headers = new Headers({ "x-forwarded-for": "  203.0.113.7  " });

    expect(getClientIp(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.4" });

    expect(getClientIp(headers)).toBe("198.51.100.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is empty", () => {
    const headers = new Headers({
      "x-forwarded-for": " , ",
      "x-real-ip": "198.51.100.4",
    });

    expect(getClientIp(headers)).toBe("198.51.100.4");
  });

  it("returns the fallback key when no ip headers are present", () => {
    expect(getClientIp(new Headers())).toBe(FALLBACK_CLIENT_KEY);
  });
});
