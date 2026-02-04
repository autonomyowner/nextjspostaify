import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware is disabled for route protection
// Client-side auth handles redirects in dashboard layout
// This is because better-auth session tokens are managed client-side
export function middleware(request: NextRequest) {
  // Just pass through - client-side auth handles protection
  return NextResponse.next();
}

export const config = {
  // Only match API routes if needed for headers, etc.
  matcher: [],
};
