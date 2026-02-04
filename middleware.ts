import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Better-auth handles sessions via cookies automatically
// This middleware protects routes and redirects unauthenticated users
export function middleware(request: NextRequest) {
  // Protected routes that require auth
  const protectedPaths = ["/dashboard", "/posts", "/calendar", "/admin"];

  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected) {
    // Check for better-auth session cookie
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Exclude Next.js internals, static files, and auth API routes
  matcher: ["/((?!_next|api/auth|.*\\..*).*)"],
};
