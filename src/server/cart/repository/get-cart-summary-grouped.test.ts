import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import { MOCK_CART_ID, MOCK_USER_ID } from "@/server/cart/mock-data/ids";
import { findActiveCartRole } from "@/server/cart/repository/find-active-cart-role";
import { getCartSummaryEditor } from "@/server/cart/repository/get-cart-summary-editor";
import { getCartSummaryOwner } from "@/server/cart/repository/get-cart-summary-owner";

import { getCartSummaryView } from "./get-cart-summary-grouped";

vi.mock("@/server/auth/get-current-user-id", () => ({
  getCurrentUserId: vi.fn(),
}));
vi.mock("@/server/cart/repository/find-active-cart-role", () => ({
  findActiveCartRole: vi.fn(),
}));
vi.mock("@/server/cart/repository/get-cart-summary-editor", () => ({
  getCartSummaryEditor: vi.fn(),
}));
vi.mock("@/server/cart/repository/get-cart-summary-owner", () => ({
  getCartSummaryOwner: vi.fn(),
}));

const mockedGetCurrentUserId = vi.mocked(getCurrentUserId);
const mockedFindActiveCartRole = vi.mocked(findActiveCartRole);
const mockedGetCartSummaryEditor = vi.mocked(getCartSummaryEditor);
const mockedGetCartSummaryOwner = vi.mocked(getCartSummaryOwner);

describe("getCartSummaryView (orchestrator)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no active cart role", async () => {
    mockedFindActiveCartRole.mockResolvedValue(null);

    const result = await getCartSummaryView();

    expect(result).toBeNull();
    expect(mockedGetCartSummaryOwner).not.toHaveBeenCalled();
    expect(mockedGetCartSummaryEditor).not.toHaveBeenCalled();
  });

  it("delegates to getCartSummaryOwner when the viewer is the owner", async () => {
    mockedFindActiveCartRole.mockResolvedValue({
      cartId: MOCK_CART_ID,
      role: "owner",
    });
    mockedGetCartSummaryOwner.mockResolvedValue({ kind: "solo", items: [] });

    const result = await getCartSummaryView();

    expect(mockedGetCartSummaryOwner).toHaveBeenCalledWith(MOCK_CART_ID);
    expect(mockedGetCartSummaryEditor).not.toHaveBeenCalled();
    expect(result).toEqual({ kind: "solo", items: [] });
  });

  it("delegates to getCartSummaryEditor with cartId and userId when the viewer is an editor", async () => {
    mockedFindActiveCartRole.mockResolvedValue({
      cartId: MOCK_CART_ID,
      role: "editor",
    });
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedGetCartSummaryEditor.mockResolvedValue({ kind: "solo", items: [] });

    const result = await getCartSummaryView();

    expect(mockedGetCartSummaryEditor).toHaveBeenCalledWith(
      MOCK_CART_ID,
      MOCK_USER_ID,
    );
    expect(mockedGetCartSummaryOwner).not.toHaveBeenCalled();
    expect(result).toEqual({ kind: "solo", items: [] });
  });

  it("returns null when editor branch cannot resolve the current user", async () => {
    mockedFindActiveCartRole.mockResolvedValue({
      cartId: MOCK_CART_ID,
      role: "editor",
    });
    mockedGetCurrentUserId.mockResolvedValue(undefined);

    const result = await getCartSummaryView();

    expect(result).toBeNull();
    expect(mockedGetCartSummaryEditor).not.toHaveBeenCalled();
  });
});
