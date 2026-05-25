import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/server/auth";

import { getCurrentUserId } from "./get-current-user-id";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));
vi.mock("@/server/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

const mockedGetSession = vi.mocked(auth.api.getSession);

describe("getCurrentUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the user id when a session exists", async () => {
    mockedGetSession.mockResolvedValueOnce({
      user: { id: "user-123" },
    } as never);

    const result = await getCurrentUserId();

    expect(result).toBe("user-123");
  });

  it("returns undefined when there is no session", async () => {
    mockedGetSession.mockResolvedValueOnce(null as never);

    const result = await getCurrentUserId();

    expect(result).toBeUndefined();
  });
});
