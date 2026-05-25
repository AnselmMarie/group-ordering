import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/server/db";
import { createChainStub } from "@/server/db/mock-db";
import {
  MOCK_PRODUCT_ID,
  MOCK_PRODUCT_ID_ALT,
} from "@/server/product/mock-data/ids";
import { createMockProduct } from "@/server/product/mock-data/mock-product";

import { getAllProducts } from "./get-all-products";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

describe("getAllProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all products from the db", async () => {
    const rows = [
      createMockProduct({ id: MOCK_PRODUCT_ID, title: "Espresso" }),
      createMockProduct({ id: MOCK_PRODUCT_ID_ALT, title: "Latte" }),
    ];
    mockedDb.select.mockReturnValue(createChainStub(rows));

    const result = await getAllProducts();

    expect(result).toEqual(rows);
    expect(mockedDb.select).toHaveBeenCalledTimes(1);
  });

  it("returns an empty array when no products exist", async () => {
    mockedDb.select.mockReturnValue(createChainStub([]));

    const result = await getAllProducts();

    expect(result).toEqual([]);
  });

  it("orders the result by createdAt", async () => {
    const chain = createChainStub([]);
    mockedDb.select.mockReturnValue(chain as never);

    await getAllProducts();

    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });

  it("propagates database errors", async () => {
    mockedDb.select.mockReturnValue(
      createChainStub(null, new Error("select failed")),
    );

    await expect(getAllProducts()).rejects.toThrow("select failed");
  });
});
