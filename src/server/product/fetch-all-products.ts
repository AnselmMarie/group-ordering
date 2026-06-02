import { headers } from "next/headers";

import { getAppUrl } from "@/lib/env";
import { UserFacingError } from "@/lib/server/action-result";

import type { Product } from "./types";

const GENERIC_LOAD_ERROR =
  "We couldn't load the menu right now. Please try again.";
const RATE_LIMITED_ERROR =
  "You're going a little fast. Please wait a moment and try again.";

interface ProductsApiResponse {
  success: boolean;
  data?: Product[];
  error?: string;
}

const PRODUCTS_ENDPOINT = "/api/products";

const resolveBaseUrl = async (): Promise<string> => {
  const appUrl = getAppUrl();
  if (appUrl) {
    return appUrl.replace(/\/+$/, "");
  }

  const headerList = await headers();
  const host = headerList.get("host");
  if (!host) {
    throw new UserFacingError(GENERIC_LOAD_ERROR);
  }

  const protocol =
    host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${protocol}://${host}`;
};

const reviveProduct = (product: Product): Product => ({
  ...product,
  // JSON transport turns Dates into strings; restore the Product contract.
  createdAt: new Date(product.createdAt),
  updatedAt: new Date(product.updatedAt),
});

/**
 * Fetches all products through the rate-limited `/api/products` endpoint.
 *
 * Incoming request headers are forwarded so the endpoint's rate limiter keys
 * off the real client IP rather than this server-to-server request. A 403
 * (rate limited) or any non-OK response is surfaced as a thrown error.
 */
export const fetchAllProducts = async (): Promise<Product[]> => {
  const [baseUrl, headerList] = await Promise.all([
    resolveBaseUrl(),
    headers(),
  ]);

  const response = await fetch(`${baseUrl}${PRODUCTS_ENDPOINT}`, {
    headers: {
      "x-forwarded-for": headerList.get("x-forwarded-for") ?? "",
      "x-real-ip": headerList.get("x-real-ip") ?? "",
      cookie: headerList.get("cookie") ?? "",
    },
    cache: "no-store",
  });

  if (response.status === 403) {
    throw new UserFacingError(RATE_LIMITED_ERROR);
  }

  if (!response.ok) {
    throw new UserFacingError(GENERIC_LOAD_ERROR);
  }

  const body = (await response.json()) as ProductsApiResponse;
  if (!body.success || !body.data) {
    throw new UserFacingError(body.error ?? GENERIC_LOAD_ERROR);
  }

  return body.data.map(reviveProduct);
};
