import { cookies } from "next/headers";

const COOKIE_NAME = "cartId";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function getCartId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}

export async function getOrCreateCartId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(COOKIE_NAME)?.value;
  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();
  store.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
  return id;
}
