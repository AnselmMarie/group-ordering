import { describe, expect, it } from "vitest";

import { normalizeIpForBucket } from "./normalize-ip";

describe("normalizeIpForBucket", () => {
  it("leaves an IPv4 address unchanged", () => {
    expect(normalizeIpForBucket("203.0.113.5")).toBe("203.0.113.5");
  });

  it("collapses a full IPv6 address to its /64 prefix", () => {
    expect(normalizeIpForBucket("2001:db8:1234:5678::1")).toBe(
      "2001:db8:1234:5678::/64",
    );
  });

  it("drops the host bits of a fully expanded IPv6 address", () => {
    expect(
      normalizeIpForBucket("2001:db8:1234:5678:abcd:ef01:2345:6789"),
    ).toBe("2001:db8:1234:5678::/64");
  });

  it("maps two hosts in the same /64 to an identical key", () => {
    expect(normalizeIpForBucket("2001:db8:1234:5678::2")).toBe(
      normalizeIpForBucket("2001:db8:1234:5678::3"),
    );
  });

  it("keeps different /64 allocations distinct", () => {
    expect(normalizeIpForBucket("2001:db8:1111:2222::1")).not.toBe(
      normalizeIpForBucket("2001:db8:3333:4444::1"),
    );
  });

  it("treats an IPv4-mapped IPv6 address as its underlying IPv4", () => {
    expect(normalizeIpForBucket("::ffff:203.0.113.5")).toBe("203.0.113.5");
  });

  it("returns unparseable input unchanged so it remains a usable key", () => {
    expect(normalizeIpForBucket("not-an-ip")).toBe("not-an-ip");
    expect(normalizeIpForBucket("unknown")).toBe("unknown");
  });
});
