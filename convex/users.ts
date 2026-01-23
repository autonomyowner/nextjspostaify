import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getPlanLimits } from "./lib/planLimits";

// Sync user from frontend (workaround for JWT template issues)
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      // Create new user
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        plan: "FREE",
        postsThisMonth: 0,
        usageResetDate: now,
        telegramEnabled: false,
      });
      user = await ctx.db.get(userId);
    }

    return user?._id;
  },
});

// Get user by clerkId (public - for workaround)
export const getByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return null;
    }

    // Get brand count
    const brands = await ctx.db
      .query("brands")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const brandCount = brands.length;

    // Get post count
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const postCount = posts.length;

    const limits = getPlanLimits(user.plan);

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      usage: {
        postsThisMonth: user.postsThisMonth,
        postsLimit: limits.maxPostsPerMonth,
        brands: brandCount,
        brandsLimit: limits.maxBrands,
        totalPosts: postCount,
      },
      features: {
        hasImageGeneration: limits.hasImageGeneration,
        hasVoiceover: limits.hasVoiceover,
        hasVideoRepurpose: limits.hasVideoRepurpose,
      },
      _creationTime: user._creationTime,
    };
  },
});

// Get current user with usage stats
export const getMe = query({
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

    // Get brand count
    const brands = await ctx.db
      .query("brands")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const brandCount = brands.length;

    // Get post count
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const postCount = posts.length;

    const limits = getPlanLimits(user.plan);

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      usage: {
        postsThisMonth: user.postsThisMonth,
        postsLimit: limits.maxPostsPerMonth,
        brands: brandCount,
        brandsLimit: limits.maxBrands,
        totalPosts: postCount,
      },
      features: {
        hasImageGeneration: limits.hasImageGeneration,
        hasVoiceover: limits.hasVoiceover,
        hasVideoRepurpose: limits.hasVideoRepurpose,
      },
      _creationTime: user._creationTime,
    };
  },
});

// Update current user name
export const updateMe = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      name: args.name,
    });

    return { success: true };
  },
});

// Internal: Get or create user (called from auth flow or webhook)
export const getOrCreateUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    // Handle email uniqueness - check if email already exists with different clerkId
    let email = args.email;
    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingByEmail && existingByEmail.clerkId !== args.clerkId) {
      // Different Clerk user with same email exists - make email unique
      email = `${args.clerkId}@postaify.user`;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      plan: "FREE",
      postsThisMonth: 0,
      usageResetDate: Date.now(),
      telegramEnabled: false,
    });

    return userId;
  },
});

// Internal: Update user from webhook
export const updateUserFromWebhook = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return null;
    }

    const updates: Partial<{
      email: string;
      name: string | undefined;
      avatarUrl: string | undefined;
    }> = {};

    if (args.email !== undefined) updates.email = args.email;
    if (args.name !== undefined) updates.name = args.name;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(user._id, updates);
    }

    return user._id;
  },
});

// Internal: Delete user from webhook
export const deleteUserFromWebhook = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return null;
    }

    // Delete all user's posts
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    for (const post of posts) {
      await ctx.db.delete(post._id);
    }

    // Delete all user's brands
    const brands = await ctx.db
      .query("brands")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    for (const brand of brands) {
      await ctx.db.delete(brand._id);
    }

    // Delete the user
    await ctx.db.delete(user._id);

    return { success: true };
  },
});

// Internal: Update user plan (called from Stripe webhook)
export const updateUserPlan = internalMutation({
  args: {
    clerkId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    plan: v.union(v.literal("FREE"), v.literal("PRO"), v.literal("BUSINESS")),
  },
  handler: async (ctx, args) => {
    let user = null;

    if (args.clerkId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId!))
        .unique();
    } else if (args.stripeCustomerId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_stripeCustomerId", (q) =>
          q.eq("stripeCustomerId", args.stripeCustomerId!)
        )
        .unique();
    }

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      plan: args.plan,
    });

    return { success: true };
  },
});

// Internal: Set Stripe customer ID
export const setStripeCustomerId = internalMutation({
  args: {
    clerkId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      stripeCustomerId: args.stripeCustomerId,
    });

    return { success: true };
  },
});

// Internal: Reset monthly usage (can be called by cron)
export const resetMonthlyUsage = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const nowDate = new Date(now);
    const nowMonth = nowDate.getUTCMonth();
    const nowYear = nowDate.getUTCFullYear();

    // Get all users and check which need reset
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      const resetDate = new Date(user.usageResetDate);
      const resetMonth = resetDate.getUTCMonth();
      const resetYear = resetDate.getUTCFullYear();

      if (nowMonth !== resetMonth || nowYear !== resetYear) {
        await ctx.db.patch(user._id, {
          postsThisMonth: 0,
          usageResetDate: now,
        });
      }
    }

    return { success: true };
  },
});
