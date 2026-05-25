import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_CART_ID, MOCK_PRODUCT_ID, MOCK_USER_ID } from "@/server/cart/mock-data/ids";
import { db } from "@/server/db";
import { createChainStub } from "@/server/db/mock-db";

import { getCartSummaryOwner } from "./get-cart-summary-owner";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

const OWNER_USER_ID = MOCK_USER_ID;
const ALICE_USER_ID = "00000000-0000-0000-0000-0000000000a1";
const BOB_USER_ID = "00000000-0000-0000-0000-0000000000b2";

const buildJoinedRow = (overrides: Record<string, unknown> = {}) => ({
  participantUserId: OWNER_USER_ID,
  role: "owner",
  invitedEmail: null,
  itemId: "00000000-0000-0000-0000-000000000030",
  itemProductId: MOCK_PRODUCT_ID,
  itemUserId: OWNER_USER_ID,
  itemQuantity: 2,
  itemPrice: 1000,
  productId: MOCK_PRODUCT_ID,
  productTitle: "Espresso",
  productPrice: 1000,
  productImage: null,
  ...overrides,
});

describe("getCartSummaryOwner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns solo view when only the owner is an active participant", async () => {
    mockedDb.select.mockReturnValueOnce(createChainStub([buildJoinedRow()]));

    const result = await getCartSummaryOwner(MOCK_CART_ID);

    expect(result).toEqual({
      kind: "solo",
      items: [
        {
          id: "00000000-0000-0000-0000-000000000030",
          productId: MOCK_PRODUCT_ID,
          userId: OWNER_USER_ID,
          quantity: 2,
          price: 1000,
          product: {
            id: MOCK_PRODUCT_ID,
            title: "Espresso",
            price: 1000,
            image: null,
          },
        },
      ],
    });
  });

  it("returns empty solo view when owner has zero items and no editors", async () => {
    mockedDb.select.mockReturnValueOnce(
      createChainStub([
        buildJoinedRow({
          itemId: null,
          itemProductId: null,
          itemUserId: null,
          itemQuantity: null,
          itemPrice: null,
          productId: null,
          productTitle: null,
          productPrice: null,
          productImage: null,
        }),
      ]),
    );

    const result = await getCartSummaryOwner(MOCK_CART_ID);

    expect(result).toEqual({ kind: "solo", items: [] });
  });

  it("returns group view with owner first then editors alphabetical by invitedEmail", async () => {
    mockedDb.select.mockReturnValueOnce(
      createChainStub([
        buildJoinedRow({
          participantUserId: BOB_USER_ID,
          role: "editor",
          invitedEmail: "bob@example.com",
          itemId: "00000000-0000-0000-0000-0000000000b1",
          itemUserId: BOB_USER_ID,
          itemQuantity: 1,
          itemPrice: 500,
          productPrice: 500,
        }),
        buildJoinedRow(),
        buildJoinedRow({
          participantUserId: ALICE_USER_ID,
          role: "editor",
          invitedEmail: "alice@example.com",
          itemId: "00000000-0000-0000-0000-0000000000a2",
          itemUserId: ALICE_USER_ID,
          itemQuantity: 3,
          itemPrice: 400,
          productPrice: 400,
        }),
      ]),
    );

    const result = await getCartSummaryOwner(MOCK_CART_ID);

    expect(result.kind).toBe("group");
    if (result.kind !== "group") return;
    expect(result.groups.map((g) => g.userId)).toEqual([
      OWNER_USER_ID,
      ALICE_USER_ID,
      BOB_USER_ID,
    ]);
    expect(result.groups[0].subtotal).toBe(2000);
    expect(result.groups[1].subtotal).toBe(1200);
    expect(result.groups[2].subtotal).toBe(500);
  });

  it("owner group has invitedEmail null and editor group has invitedEmail populated", async () => {
    mockedDb.select.mockReturnValueOnce(
      createChainStub([
        buildJoinedRow(),
        buildJoinedRow({
          participantUserId: ALICE_USER_ID,
          role: "editor",
          invitedEmail: "alice@example.com",
          itemId: "00000000-0000-0000-0000-0000000000a2",
          itemUserId: ALICE_USER_ID,
        }),
      ]),
    );

    const result = await getCartSummaryOwner(MOCK_CART_ID);

    if (result.kind !== "group") throw new Error("expected group view");
    const owner = result.groups.find((g) => g.userId === OWNER_USER_ID);
    const alice = result.groups.find((g) => g.userId === ALICE_USER_ID);
    expect(owner?.invitedEmail).toBeNull();
    expect(alice?.invitedEmail).toBe("alice@example.com");
  });

  it("includes participants with zero items as empty groups in group view", async () => {
    mockedDb.select.mockReturnValueOnce(
      createChainStub([
        buildJoinedRow(),
        buildJoinedRow({
          participantUserId: ALICE_USER_ID,
          role: "editor",
          invitedEmail: "alice@example.com",
          itemId: null,
          itemProductId: null,
          itemUserId: null,
          itemQuantity: null,
          itemPrice: null,
          productId: null,
          productTitle: null,
          productPrice: null,
          productImage: null,
        }),
      ]),
    );

    const result = await getCartSummaryOwner(MOCK_CART_ID);

    if (result.kind !== "group") throw new Error("expected group view");
    const alice = result.groups.find((g) => g.userId === ALICE_USER_ID);
    expect(alice).toBeDefined();
    expect(alice?.items).toEqual([]);
    expect(alice?.subtotal).toBe(0);
  });

  it("sorts editors case-insensitively by invitedEmail", async () => {
    mockedDb.select.mockReturnValueOnce(
      createChainStub([
        buildJoinedRow(),
        buildJoinedRow({
          participantUserId: BOB_USER_ID,
          role: "editor",
          invitedEmail: "Zoe@example.com",
          itemId: "00000000-0000-0000-0000-0000000000b1",
          itemUserId: BOB_USER_ID,
        }),
        buildJoinedRow({
          participantUserId: ALICE_USER_ID,
          role: "editor",
          invitedEmail: "amos@example.com",
          itemId: "00000000-0000-0000-0000-0000000000a2",
          itemUserId: ALICE_USER_ID,
        }),
      ]),
    );

    const result = await getCartSummaryOwner(MOCK_CART_ID);

    if (result.kind !== "group") throw new Error("expected group view");
    expect(result.groups.map((g) => g.userId)).toEqual([
      OWNER_USER_ID,
      ALICE_USER_ID,
      BOB_USER_ID,
    ]);
  });

  it("propagates database errors", async () => {
    mockedDb.select.mockReturnValueOnce(
      createChainStub(null, new Error("join failed")),
    );

    await expect(getCartSummaryOwner(MOCK_CART_ID)).rejects.toThrow(
      "join failed",
    );
  });
});
