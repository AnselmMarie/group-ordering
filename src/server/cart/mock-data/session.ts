import { MOCK_USER_ID } from "./ids";

interface MockSession {
  user: {
    id: string;
  };
}

export const createMockSession = (
  userId: string = MOCK_USER_ID,
): MockSession => ({
  user: { id: userId },
});
