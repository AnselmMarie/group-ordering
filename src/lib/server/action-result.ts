export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

const FRAMEWORK_DIGEST_PREFIXES = ["NEXT_REDIRECT", "NEXT_HTTP_ERROR_FALLBACK"];

const isFrameworkThrow = (err: unknown): boolean => {
  if (typeof err !== "object" || err === null) return false;
  const digest = (err as { digest?: unknown }).digest;
  if (typeof digest !== "string") return false;
  return FRAMEWORK_DIGEST_PREFIXES.some((prefix) => digest.startsWith(prefix));
};

export const withActionResult = <Args extends unknown[], T>(
  name: string,
  fn: (...args: Args) => Promise<T>,
): ((...args: Args) => Promise<ActionResult<T>>) => {
  return async (...args: Args): Promise<ActionResult<T>> => {
    try {
      const data = await fn(...args);
      return { ok: true, data };
    } catch (err: unknown) {
      if (isFrameworkThrow(err)) throw err;

      console.error(`[action:${name}] failed`, err);
      const error =
        err instanceof UserFacingError ? err.message : "Something went wrong";
      return { ok: false, error };
    }
  };
};
