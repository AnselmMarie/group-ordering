import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createInMemoryStore } from "./in-memory-store";

describe("createInMemoryStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts a counter at 1 with an expiry one window away", () => {
    const store = createInMemoryStore();

    const snapshot = store.increment("a", 1000);

    expect(snapshot).toEqual({ count: 1, expiresAt: 1000 });
  });

  it("increments within the active window keeping the original expiry", () => {
    const store = createInMemoryStore();

    store.increment("a", 1000);
    vi.setSystemTime(500);
    const snapshot = store.increment("a", 1000);

    expect(snapshot).toEqual({ count: 2, expiresAt: 1000 });
  });

  it("resets the counter once the window has expired", () => {
    const store = createInMemoryStore();

    store.increment("a", 1000);
    vi.setSystemTime(1000);
    const snapshot = store.increment("a", 1000);

    expect(snapshot).toEqual({ count: 1, expiresAt: 2000 });
  });

  it("keeps counters isolated per key", () => {
    const store = createInMemoryStore();

    store.increment("a", 1000);
    const snapshot = store.increment("b", 1000);

    expect(snapshot.count).toBe(1);
  });

  it("does not mutate previously returned snapshots", () => {
    const store = createInMemoryStore();

    const first = store.increment("a", 1000);
    store.increment("a", 1000);

    expect(first.count).toBe(1);
  });

  it("clears a single key with reset", () => {
    const store = createInMemoryStore();

    store.increment("a", 1000);
    store.reset("a");
    const snapshot = store.increment("a", 1000);

    expect(snapshot.count).toBe(1);
  });

  it("clears all keys with clear", () => {
    const store = createInMemoryStore();

    store.increment("a", 1000);
    store.increment("b", 1000);
    store.clear();

    expect(store.increment("a", 1000).count).toBe(1);
    expect(store.increment("b", 1000).count).toBe(1);
  });
});
