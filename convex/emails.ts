import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Capture email (public - no auth required)
export const capture = mutation({
  args: {
    email: v.string(),
    marketingConsent: v.optional(v.boolean()),
    source: v.optional(v.string()),
    planInterest: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email address");
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Check if email was captured recently (within 24 hours)
    const existingCaptures = await ctx.db
      .query("emailCaptures")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    // Sort by capturedAt descending and get the most recent
    const recentCapture = existingCaptures
      .sort((a, b) => b.capturedAt - a.capturedAt)
      .find((c) => c.capturedAt > oneDayAgo);

    if (recentCapture) {
      // Update existing capture
      await ctx.db.patch(recentCapture._id, {
        marketingConsent: args.marketingConsent ?? false,
        source: args.source || "pricing_modal",
        planInterest: args.planInterest,
        capturedAt: now,
      });

      return {
        success: true,
        message: "Email capture updated",
        captureId: recentCapture._id,
      };
    }

    // Create new capture
    const captureId = await ctx.db.insert("emailCaptures", {
      email: args.email,
      marketingConsent: args.marketingConsent ?? false,
      source: args.source || "pricing_modal",
      planInterest: args.planInterest,
      capturedAt: now,
    });

    return {
      success: true,
      message: "Email captured successfully",
      captureId,
    };
  },
});

// Admin: List email captures (requires auth and future admin check)
export const list = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { captures: [], total: 0 };
    }

    // TODO: Add admin check here in the future
    // For now, just return empty for non-admin users

    const limit = Math.min(100, Math.max(1, args.limit || 50));
    const offset = Math.max(0, args.offset || 0);

    const allCaptures = await ctx.db.query("emailCaptures").collect();

    // Sort by capturedAt descending
    allCaptures.sort((a, b) => b.capturedAt - a.capturedAt);

    const total = allCaptures.length;
    const captures = allCaptures.slice(offset, offset + limit);

    return {
      captures: captures.map((c) => ({
        _id: c._id,
        email: c.email,
        marketingConsent: c.marketingConsent,
        source: c.source,
        planInterest: c.planInterest,
        capturedAt: c.capturedAt,
      })),
      total,
      limit,
      offset,
    };
  },
});
