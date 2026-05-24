import { headers } from "next/headers";

import { auth } from "@/server/auth";

export const getCurrentUserId = async (): Promise<string | undefined> => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id;
};
