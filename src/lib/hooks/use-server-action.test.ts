import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useServerAction } from "./use-server-action";

const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
  },
}));

describe("useServerAction", () => {
  beforeEach(() => {
    toastError.mockClear();
  });

  it("returns the action result and invokes onSuccess on success", async () => {
    const action = vi.fn(async (x: number) => x * 2);
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useServerAction(action, { onSuccess }),
    );

    let returned: number | undefined;
    await act(async () => {
      returned = await result.current[0](21);
    });

    expect(returned).toBe(42);
    expect(action).toHaveBeenCalledWith(21);
    expect(onSuccess).toHaveBeenCalledWith(42);
    expect(toastError).not.toHaveBeenCalled();
  });

  it("calls toast.error with the thrown Error message and resolves undefined", async () => {
    const action = vi.fn(async () => {
      throw new Error("This product is no longer available.");
    });
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useServerAction(action, { onSuccess }),
    );

    let returned: unknown;
    await act(async () => {
      returned = await result.current[0]();
    });

    expect(returned).toBeUndefined();
    expect(toastError).toHaveBeenCalledWith(
      "This product is no longer available.",
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("falls back to options.errorMessage when thrown value is not an Error", async () => {
    const action = vi.fn(async () => {
      throw "string thrown";
    });

    const { result } = renderHook(() =>
      useServerAction(action, { errorMessage: "Custom fallback" }),
    );

    await act(async () => {
      await result.current[0]();
    });

    expect(toastError).toHaveBeenCalledWith("Custom fallback");
  });

  it("falls back to a default message when no errorMessage option is provided", async () => {
    const action = vi.fn(async () => {
      throw "string thrown";
    });

    const { result } = renderHook(() => useServerAction(action));

    await act(async () => {
      await result.current[0]();
    });

    expect(toastError).toHaveBeenCalledWith("Something went wrong");
  });

  it("toggles isPending while the action is running", async () => {
    let resolveAction: ((value: string) => void) | undefined;
    const action = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const { result } = renderHook(() => useServerAction(action));

    expect(result.current[1]).toBe(false);

    let runPromise: Promise<string | undefined> | undefined;
    act(() => {
      runPromise = result.current[0]();
    });

    await waitFor(() => expect(result.current[1]).toBe(true));

    await act(async () => {
      resolveAction?.("done");
      await runPromise;
    });

    expect(result.current[1]).toBe(false);
  });
});
