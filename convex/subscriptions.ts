import { query } from "./_generated/server";
import { getPlanLimits } from "./lib/planLimits";
import { auth } from "./auth";

// Get current subscription
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const limits = getPlanLimits(user.plan ?? "FREE");

    return {
      plan: user.plan,
      limits,
      stripeCustomerId: user.stripeCustomerId,
    };
  },
});
