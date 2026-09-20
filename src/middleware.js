import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-only-change-me-to-a-32+char-random-string"
);

// Runs on every /admin request before the page loads.
// Keeps unauthenticated visitors out of the dashboard, and signed-in
// users away from the login screen.
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const token = request.cookies.get("session")?.value;

  let signedIn = false;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      // Same rule as getSession(): only staff tokens (which have a role)
      // count. A reader token has none and must not open /admin.
      signedIn = Boolean(payload.role);
    } catch {
      signedIn = false;
    }
  }

  if (!isLoginPage && !signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginPage && signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
