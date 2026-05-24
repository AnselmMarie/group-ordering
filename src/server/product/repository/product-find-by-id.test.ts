import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/server/db";
import { createChainStub } from "@/server/db/mock-db";
import {
  MOCK_MISSING_PRODUCT_ID,
  MOCK_PRODUCT_ID,
} from "@/server/product/mock-data/ids";
import { createMockProduct } from "@/server/product/mock-data/mock-product";

import { productFindById } from "./product-find-by-id";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

describe("productFindById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the product when a row is found", async () => {
    const row = createMockProduct({ id: MOCK_PRODUCT_ID });
    mockedDb.select.mockReturnValue(createChainStub([row]));

    const result = await productFindById(MOCK_PRODUCT_ID);

    expect(result).toEqual(row);
    expect(mockedDb.select).toHaveBeenCalledTimes(1);
  });

  it("returns null when no row is found", async () => {
    mockedDb.select.mockReturnValue(createChainStub([]));

    const result = await productFindById(MOCK_MISSING_PRODUCT_ID);

    expect(result).toBeNull();
  });

  it("limits the query to one row", async () => {
    const chain = createChainStub([]);
    mockedDb.select.mockReturnValue(chain as never);

    await productFindById(MOCK_PRODUCT_ID);

    expect(chain.limit).toHaveBeenCalledWith(1);
  });

  it("propagates database errors", async () => {
    mockedDb.select.mockReturnValue(
      createChainStub(null, new Error("select failed")),
    );

    await expect(productFindById(MOCK_PRODUCT_ID)).rejects.toThrow(
      "select failed",
    );
  });
});
