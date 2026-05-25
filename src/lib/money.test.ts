import { describe, expect, it } from "vitest";

import { centsToDollarsNumber, dollarsToCents, formatUSD } from "./money";

describe("formatUSD", () => {
  it("formats zero", () => {
    expect(formatUSD(0)).toBe("$0.00");
  });

  it("formats a single cent", () => {
    expect(formatUSD(1)).toBe("$0.01");
  });

  it("formats whole dollars", () => {
    expect(formatUSD(1000)).toBe("$10.00");
  });

  it("formats a typical price", () => {
    expect(formatUSD(999)).toBe("$9.99");
  });

  it("adds thousands separators for large values", () => {
    expect(formatUSD(123456)).toBe("$1,234.56");
  });

  it("formats negative values", () => {
    expect(formatUSD(-500)).toBe("-$5.00");
  });
});

describe("centsToDollarsNumber", () => {
  it("converts cents to a dollar number", () => {
    expect(centsToDollarsNumber(999)).toBe(9.99);
  });

  it("returns 0 for 0 cents", () => {
    expect(centsToDollarsNumber(0)).toBe(0);
  });
});

describe("dollarsToCents", () => {
  it("converts a number of dollars to cents", () => {
    expect(dollarsToCents(9.99)).toBe(999);
  });

  it("converts a string of dollars to cents", () => {
    expect(dollarsToCents("12.50")).toBe(1250);
  });

  it("rounds half-cent values", () => {
    expect(dollarsToCents(0.005)).toBe(1);
  });

  it("handles whole-dollar strings", () => {
    expect(dollarsToCents("10")).toBe(1000);
  });

  it("throws on non-numeric strings", () => {
    expect(() => dollarsToCents("abc")).toThrow("Invalid dollar amount");
  });

  it("throws on NaN", () => {
    expect(() => dollarsToCents(Number.NaN)).toThrow("Invalid dollar amount");
  });
});
