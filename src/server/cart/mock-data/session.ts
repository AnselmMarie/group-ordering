import type { Session } from "@/server/auth";

import { MOCK_USER_ID } from "./ids";

const MOCK_SESSION_ID = "00000000-0000-0000-0000-0000000000a0";
const MOCK_DATE = new Date("2026-01-01T00:00:00.000Z");

export const createMockSession = (userId: string = MOCK_USER_ID): Session => ({
  session: {
    id: MOCK_SESSION_ID,
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
    userId,
    expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    token: "mock-session-token",
    ipAddress: null,
    userAgent: null,
  },
  user: {
    id: userId,
    name: "Mock User",
    email: "mock@example.com",
    emailVerified: true,
    image: null,
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
    isAnonymous: false,
  },
});
