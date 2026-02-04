import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [convexClient()],
});

// Export types and hooks for easier usage
export const { signIn, signUp, signOut, useSession } = authClient;
