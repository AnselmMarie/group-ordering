import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

const hasSessionCookie = (request: NextRequest): boolean =>
  SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));

// @todo: move the signin logic to a separate file and reuse it in layout and proxy
export async function proxy(request: NextRequest) {
  if (hasSessionCookie(request)) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/api/auth/sign-in/anonymous", request.url);
  const signInResponse = await fetch(signInUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });

  const response = NextResponse.next();
  const setCookie = signInResponse.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookie) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
