import { NextRequest, NextResponse } from "next/server";

// Protected routes that require authentication
const PROTECTED_PATHS = ["/dashboard", "/admin"];

// Public auth routes (redirect to dashboard if already logged in)
const AUTH_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // We use a lightweight non-HttpOnly session flag cookie ('smilecare_auth')
  // set by the client after login. The actual JWT is in the HttpOnly 'accessToken'
  // cookie managed by the Render backend. Since the backend is cross-origin,
  // Next.js middleware cannot read HttpOnly cookies set by a different domain.
  // The real security enforcement still happens in the Express server's authMiddleware.
  const authFlag = request.cookies.get("smilecare_auth")?.value;

  if (isProtected && !authFlag) {
    // Redirect unauthenticated users to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && authFlag) {
    // Redirect already-authenticated users away from login/register
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run on non-static routes
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
