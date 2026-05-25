const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatUSD(cents: number): string {
  return usdFormatter.format(cents / 100);
}

export function centsToDollarsNumber(cents: number): number {
  return cents / 100;
}

export function dollarsToCents(dollars: number | string): number {
  const value = typeof dollars === "string" ? Number(dollars) : dollars;

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid dollar amount: ${dollars}`);
  }

  return Math.round(value * 100);
}
