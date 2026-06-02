export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

const DEFAULT_FALLBACK_MESSAGE = "Something went wrong";

/**
 * Resolves a safe, user-displayable message from an unknown error.
 *
 * Only `UserFacingError` messages are trusted for display; anything else
 * collapses to `fallback` so internal/diagnostic details never leak to users.
 */
export const toUserFacingMessage = (
  err: unknown,
  fallback: string = DEFAULT_FALLBACK_MESSAGE,
): string => (err instanceof UserFacingError ? err.message : fallback);

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
      return { ok: false, error: toUserFacingMessage(err) };
    }
  };
};
