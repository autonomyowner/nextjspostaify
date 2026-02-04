import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || "https://handsome-crocodile-686.convex.site";

export const authClient = createAuthClient({
  baseURL: convexSiteUrl,
  plugins: [convexClient()],
});

// Export types and hooks for easier usage
export const { signIn, signUp, signOut, useSession } = authClient;
