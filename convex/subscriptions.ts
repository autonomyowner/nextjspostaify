import { query } from "./_generated/server";
import { getPlanLimits } from "./lib/planLimits";

// Get current subscription
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const limits = getPlanLimits(user.plan);

    return {
      plan: user.plan,
      limits,
      stripeCustomerId: user.stripeCustomerId,
    };
  },
});
