import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { proxy } from "./proxy";

const buildRequest = (cookies: string[] = []) => {
  const url = "https://example.com/some-path";
  const cookieHeader = cookies.join("; ");
  return new NextRequest(url, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
};

describe("proxy", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("passes through without calling fetch when a session cookie is present", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as never;

    const request = buildRequest(["better-auth.session_token=abc"]);
    const response = await proxy(request);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("passes through when the secure session cookie is present", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as never;

    const request = buildRequest([
      "__Secure-better-auth.session_token=xyz",
    ]);
    const response = await proxy(request);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("calls anonymous sign-in and forwards set-cookie headers when no session cookie exists", async () => {
    const headers = new Headers();
    headers.append("set-cookie", "session=new; Path=/");
    const fetchSpy = vi.fn().mockResolvedValue({ headers });
    globalThis.fetch = fetchSpy as never;

    const request = buildRequest();
    const response = await proxy(request);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchSpy.mock.calls[0];
    expect(String(calledUrl)).toContain("/api/auth/sign-in/anonymous");
    expect(init).toMatchObject({
      method: "POST",
      body: "{}",
    });

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("session=new");
  });

  it("does not error when the sign-in response has no set-cookie headers", async () => {
    const headers = new Headers();
    const fetchSpy = vi.fn().mockResolvedValue({ headers });
    globalThis.fetch = fetchSpy as never;

    const request = buildRequest();
    const response = await proxy(request);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });
});
