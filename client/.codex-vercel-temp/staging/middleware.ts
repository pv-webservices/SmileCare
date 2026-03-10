import { NextRequest, NextResponse } from "next/server";

// NOTE: Middleware cannot check HttpOnly cross-origin cookies set by Render backend.
// Auth protection is handled client-side in the dashboard layout via AuthContext.
// This middleware is kept minimal - just passes all requests through.
export function middleware(request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Only run on non-static routes
        "/((?!_next/static|_next/image|favicon.ico|public).*)",
    ],
};
