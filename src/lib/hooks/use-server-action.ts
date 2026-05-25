"use client";

import { useCallback, useTransition } from "react";
import { toast } from "sonner";

interface UseServerActionOptions<R> {
  onSuccess?: (result: R) => void;
  errorMessage?: string;
}

export function useServerAction<Args extends unknown[], R>(
  action: (...args: Args) => Promise<R>,
  options?: UseServerActionOptions<R>,
): [run: (...args: Args) => Promise<R | undefined>, isPending: boolean] {
  const [isPending, startTransition] = useTransition();

  const run = useCallback(
    (...args: Args): Promise<R | undefined> => {
      return new Promise((resolve) => {
        startTransition(async () => {
          try {
            const result = await action(...args);
            options?.onSuccess?.(result);
            resolve(result);
          } catch (err: unknown) {
            const message =
              err instanceof Error
                ? err.message
                : (options?.errorMessage ?? "Something went wrong");
            toast.error(message);
            resolve(undefined);
          }
        });
      });
    },
    [action, options],
  );

  return [run, isPending];
}
