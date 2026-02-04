import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

// Use same-origin API routes (Next.js handles /api/auth/* and proxies to Convex)
// This avoids CORS issues since requests stay on the same domain
export const authClient = createAuthClient({
  plugins: [convexClient()],
});

// Export types and hooks for easier usage
export const { signIn, signUp, signOut, useSession } = authClient;
