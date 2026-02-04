import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

// TEMPORARY: Middleware auth verification is having issues
// Client-side auth protection is still active in (dashboard)/layout.tsx
// TODO: Fix server-side token verification and re-enable route protection

export default convexAuthNextjsMiddleware();

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
