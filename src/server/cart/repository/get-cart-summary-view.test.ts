import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_CART_ID, MOCK_USER_ID } from "@/server/cart/mock-data/ids";
import { getActiveCartRole } from "@/server/cart/repository/get-active-cart-role";
import { getCartSummaryEditor } from "@/server/cart/repository/get-cart-summary-editor";
import { getCartSummaryOwner } from "@/server/cart/repository/get-cart-summary-owner";

import { getCartSummaryView } from "./get-cart-summary-view";

vi.mock("@/server/cart/repository/get-active-cart-role", () => ({
  getActiveCartRole: vi.fn(),
}));
vi.mock("@/server/cart/repository/get-cart-summary-editor", () => ({
  getCartSummaryEditor: vi.fn(),
}));
vi.mock("@/server/cart/repository/get-cart-summary-owner", () => ({
  getCartSummaryOwner: vi.fn(),
}));

const mockedgetActiveCartRole = vi.mocked(getActiveCartRole);
const mockedGetCartSummaryEditor = vi.mocked(getCartSummaryEditor);
const mockedGetCartSummaryOwner = vi.mocked(getCartSummaryOwner);

describe("getCartSummaryView (orchestrator)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no active cart role", async () => {
    mockedgetActiveCartRole.mockResolvedValue(null);

    const result = await getCartSummaryView();

    expect(result).toBeNull();
    expect(mockedGetCartSummaryOwner).not.toHaveBeenCalled();
    expect(mockedGetCartSummaryEditor).not.toHaveBeenCalled();
  });

  it("delegates to getCartSummaryOwner when the viewer is the owner", async () => {
    mockedgetActiveCartRole.mockResolvedValue({
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "owner",
    });
    mockedGetCartSummaryOwner.mockResolvedValue({ kind: "solo", items: [] });

    const result = await getCartSummaryView();

    expect(mockedGetCartSummaryOwner).toHaveBeenCalledWith(MOCK_CART_ID);
    expect(mockedGetCartSummaryEditor).not.toHaveBeenCalled();
    expect(result).toEqual({ kind: "solo", items: [] });
  });

  it("delegates to getCartSummaryEditor with cartId and userId when the viewer is an editor", async () => {
    mockedgetActiveCartRole.mockResolvedValue({
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "editor",
    });
    mockedGetCartSummaryEditor.mockResolvedValue({ kind: "solo", items: [] });

    const result = await getCartSummaryView();

    expect(mockedGetCartSummaryEditor).toHaveBeenCalledWith(
      MOCK_CART_ID,
      MOCK_USER_ID,
    );
    expect(mockedGetCartSummaryOwner).not.toHaveBeenCalled();
    expect(result).toEqual({ kind: "solo", items: [] });
  });
});
