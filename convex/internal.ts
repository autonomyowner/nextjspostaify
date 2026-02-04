import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

// Get user by stripeCustomerId (internal use only)
export const getUserByStripeCustomerId = internalQuery({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_stripeCustomerId", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .unique();
  },
});

// Get user by email (internal use only)
// Uses .first() instead of .unique() to handle potential duplicates
export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get user by telegramChatId (internal use only)
export const getUserByTelegramChatId = internalQuery({
  args: { telegramChatId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_telegramChatId", (q) =>
        q.eq("telegramChatId", args.telegramChatId)
      )
      .unique();
  },
});

// Get user by ID (internal use only)
export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get admin stats (internal use only)
// Optimized with limits to prevent full table scans at scale
const STATS_SAMPLE_LIMIT = 5000; // Cap for performance at scale

export const getAdminStats = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Run all queries in parallel with limits to prevent memory issues
    const [allUsers, allPosts, allBrands, allEmailCaptures] = await Promise.all([
      ctx.db.query("users").take(STATS_SAMPLE_LIMIT),
      ctx.db.query("posts").take(STATS_SAMPLE_LIMIT),
      ctx.db.query("brands").take(STATS_SAMPLE_LIMIT),
      ctx.db.query("emailCaptures").take(STATS_SAMPLE_LIMIT),
    ]);

    // Calculate user stats
    const freeUsers = allUsers.filter((u) => (u.plan ?? "FREE") === "FREE").length;
    const proUsers = allUsers.filter((u) => u.plan === "PRO").length;
    const businessUsers = allUsers.filter((u) => u.plan === "BUSINESS").length;
    const recentSignups = allUsers.filter((u) => u._creationTime > thirtyDaysAgo).length;

    // Calculate email capture stats
    const withConsent = allEmailCaptures.filter((e) => e.marketingConsent).length;
    const recentCaptures = allEmailCaptures.filter((e) => e.capturedAt > sevenDaysAgo).length;

    // Indicate if results are capped
    const isCapped = allUsers.length >= STATS_SAMPLE_LIMIT ||
      allPosts.length >= STATS_SAMPLE_LIMIT ||
      allBrands.length >= STATS_SAMPLE_LIMIT ||
      allEmailCaptures.length >= STATS_SAMPLE_LIMIT;

    return {
      users: {
        total: allUsers.length,
        free: freeUsers,
        pro: proUsers,
        business: businessUsers,
        recentSignups,
      },
      content: {
        totalPosts: allPosts.length,
        totalBrands: allBrands.length,
      },
      emailCaptures: {
        total: allEmailCaptures.length,
        withConsent,
        recentCaptures,
        consentRate:
          allEmailCaptures.length > 0
            ? Math.round((withConsent / allEmailCaptures.length) * 100)
            : 0,
      },
      isCapped, // True if stats are approximate due to volume
    };
  },
});

// Get admin users list (internal use only)
export const getAdminUsers = internalQuery({
  args: {
    limit: v.number(),
    offset: v.number(),
  },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();

    // Sort by creation time descending
    allUsers.sort((a, b) => b._creationTime - a._creationTime);

    const total = allUsers.length;
    const users = allUsers.slice(args.offset, args.offset + args.limit);

    // Get brands and posts count for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const brands = await ctx.db
          .query("brands")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect();

        const posts = await ctx.db
          .query("posts")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect();

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          plan: user.plan ?? "FREE",
          brandsCount: brands.length,
          postsCount: posts.length,
          postsThisMonth: user.postsThisMonth ?? 0,
          createdAt: user._creationTime,
        };
      })
    );

    return {
      users: usersWithCounts,
      total,
    };
  },
});

// Get admin email captures list (internal use only)
export const getAdminEmailCaptures = internalQuery({
  args: {
    limit: v.number(),
    offset: v.number(),
  },
  handler: async (ctx, args) => {
    const allCaptures = await ctx.db.query("emailCaptures").collect();

    // Sort by captured time descending
    allCaptures.sort((a, b) => b.capturedAt - a.capturedAt);

    const total = allCaptures.length;
    const captures = allCaptures.slice(args.offset, args.offset + args.limit);

    return {
      captures: captures.map((c) => ({
        id: c._id,
        email: c.email,
        marketingConsent: c.marketingConsent,
        source: c.source,
        planInterest: c.planInterest,
        capturedAt: c.capturedAt,
      })),
      total,
    };
  },
});

// Get admin bot leads list (internal use only)
export const getAdminBotLeads = internalQuery({
  args: {
    limit: v.number(),
    offset: v.number(),
  },
  handler: async (ctx, args) => {
    const allLeads = await ctx.db.query("botLeads").collect();

    // Sort by captured time descending
    allLeads.sort((a, b) => b.capturedAt - a.capturedAt);

    const total = allLeads.length;
    const leads = allLeads.slice(args.offset, args.offset + args.limit);

    return {
      leads: leads.map((l) => ({
        id: l._id,
        email: l.email,
        sessionId: l.sessionId,
        messageCount: l.messageHistory.length,
        messageHistory: l.messageHistory,
        capturedAt: l.capturedAt,
        source: l.source,
      })),
      total,
    };
  },
});

// Get bot leads stats (internal use only)
export const getBotLeadsStats = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const allLeads = await ctx.db.query("botLeads").collect();
    const recentLeads = allLeads.filter((l) => l.capturedAt > sevenDaysAgo).length;
    const monthlyLeads = allLeads.filter((l) => l.capturedAt > thirtyDaysAgo).length;

    return {
      total: allLeads.length,
      recentLeads,
      monthlyLeads,
    };
  },
});
