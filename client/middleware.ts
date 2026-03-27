import { NextRequest, NextResponse } from "next/server";

// Protected routes that require authentication (admin/dashboard only)
const PROTECTED_PATHS = ["/dashboard", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected) {
    // We use a lightweight non-HttpOnly session flag cookie ('smilecare_auth')
    // set by the client after login. The real security enforcement still happens
    // in the Express server's authMiddleware.
    const authFlag = request.cookies.get("smilecare_auth")?.value;

    if (!authFlag) {
      const loginUrl = new URL("/", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run on non-static routes
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
