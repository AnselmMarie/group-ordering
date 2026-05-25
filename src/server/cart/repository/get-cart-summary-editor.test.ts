import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  MOCK_CART_ID,
  MOCK_PRODUCT_ID,
  MOCK_USER_ID,
} from "@/server/cart/mock-data/ids";
import { db } from "@/server/db";
import { createChainStub } from "@/server/db/mock-db";

import { getCartSummaryEditor } from "./get-cart-summary-editor";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

const EDITOR_USER_ID = MOCK_USER_ID;

describe("getCartSummaryEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns solo view with the editor's own items", async () => {
    const editorItem = {
      id: "00000000-0000-0000-0000-0000000000e1",
      productId: MOCK_PRODUCT_ID,
      userId: EDITOR_USER_ID,
      quantity: 3,
      price: "4.00",
      product: {
        id: MOCK_PRODUCT_ID,
        title: "Latte",
        price: "4.00",
        image: null,
      },
    };
    mockedDb.select.mockReturnValueOnce(createChainStub([editorItem]));

    const result = await getCartSummaryEditor(MOCK_CART_ID, EDITOR_USER_ID);

    expect(result).toEqual({ kind: "solo", items: [editorItem] });
    expect(mockedDb.select).toHaveBeenCalledTimes(1);
  });

  it("returns empty solo view when the editor has no items", async () => {
    mockedDb.select.mockReturnValueOnce(createChainStub([]));

    const result = await getCartSummaryEditor(MOCK_CART_ID, EDITOR_USER_ID);

    expect(result).toEqual({ kind: "solo", items: [] });
  });

  it("propagates database errors", async () => {
    mockedDb.select.mockReturnValueOnce(
      createChainStub(null, new Error("query failed")),
    );

    await expect(
      getCartSummaryEditor(MOCK_CART_ID, EDITOR_USER_ID),
    ).rejects.toThrow("query failed");
  });
});
