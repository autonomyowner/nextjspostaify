import { query } from "./_generated/server";
import { getPlanLimits } from "./lib/planLimits";
import { authComponent } from "./auth";

// Get current subscription
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser || !authUser.email) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();

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
