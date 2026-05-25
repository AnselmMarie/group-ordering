import { vi, type Mock } from "vitest";

export interface ChainStub {
  from: Mock;
  where: Mock;
  limit: Mock;
  orderBy: Mock;
  set: Mock;
  values: Mock;
  returning: Mock;
  innerJoin: Mock;
  onConflictDoUpdate: Mock;
  then: (
    onFulfilled?: ((value: unknown) => unknown) | null,
    onRejected?: ((reason: unknown) => unknown) | null,
  ) => Promise<unknown>;
}

export const createChainStub = <T = ChainStub>(
  resolved: unknown,
  rejected?: Error,
): T => {
  const chain = {
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    orderBy: vi.fn(),
    set: vi.fn(),
    values: vi.fn(),
    returning: vi.fn(),
    innerJoin: vi.fn(),
    onConflictDoUpdate: vi.fn(),
    then: (
      onFulfilled?: ((value: unknown) => unknown) | null,
      onRejected?: ((reason: unknown) => unknown) | null,
    ) =>
      rejected
        ? Promise.reject(rejected).then(onFulfilled, onRejected)
        : Promise.resolve(resolved).then(onFulfilled, onRejected),
  } as ChainStub;

  chain.from.mockReturnValue(chain);
  chain.where.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.orderBy.mockReturnValue(chain);
  chain.set.mockReturnValue(chain);
  chain.values.mockReturnValue(chain);
  chain.returning.mockReturnValue(chain);
  chain.innerJoin.mockReturnValue(chain);
  chain.onConflictDoUpdate.mockReturnValue(chain);

  return chain as unknown as T;
};

export interface MockDb {
  select: Mock;
  insert: Mock;
  update: Mock;
}

export const createMockDb = (): MockDb => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
});
