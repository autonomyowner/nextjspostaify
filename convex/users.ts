import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getPlanLimits } from "./lib/planLimits";
import { authComponent, getAuthenticatedAppUser } from "./auth";

// Get current viewer (authenticated user)
export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser || !authUser.email) {
      return null;
    }

    // Get app user record by email
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();

    // If no app user exists yet, return a minimal profile
    // The user will be created by ensureUserExists mutation
    if (!user) {
      return {
        _id: null as any,
        email: authUser.email,
        name: authUser.name,
        avatarUrl: authUser.image,
        plan: "FREE" as const,
        usage: {
          postsThisMonth: 0,
          postsLimit: 20,
          imagesThisMonth: 0,
          imagesLimit: 5,
          voiceoversThisMonth: 0,
          voiceoversLimit: 2,
          brands: 0,
          brandsLimit: 2,
          totalPosts: 0,
        },
        features: {
          hasImageGeneration: true,
          hasVoiceover: true,
          hasVideoRepurpose: false,
        },
        _creationTime: Date.now(),
        needsSetup: true,
      };
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

    const plan = user.plan || "FREE";
    const limits = getPlanLimits(plan);

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || authUser.image,
      plan,
      usage: {
        postsThisMonth: user.postsThisMonth ?? 0,
        postsLimit: limits.maxPostsPerMonth,
        imagesThisMonth: user.imagesThisMonth ?? 0,
        imagesLimit: limits.maxImagesPerMonth,
        voiceoversThisMonth: user.voiceoversThisMonth ?? 0,
        voiceoversLimit: limits.maxVoiceoversPerMonth,
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

// Ensure user exists in app database (called after sign in)
export const ensureUserExists = mutation({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser || !authUser.email) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();

    if (existingUser) {
      return { userId: existingUser._id, created: false };
    }

    // Create new app user
    const userId = await ctx.db.insert("users", {
      email: authUser.email,
      name: authUser.name ?? undefined,
      avatarUrl: authUser.image ?? undefined,
      plan: "FREE",
      postsThisMonth: 0,
      imagesThisMonth: 0,
      voiceoversThisMonth: 0,
      usageResetDate: Date.now(),
      telegramEnabled: false,
    });

    return { userId, created: true };
  },
});

// Get current user with usage stats (alias for viewer)
export const getMe = query({
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

    const plan = user.plan || "FREE";
    const limits = getPlanLimits(plan);

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || authUser.image,
      plan,
      usage: {
        postsThisMonth: user.postsThisMonth ?? 0,
        postsLimit: limits.maxPostsPerMonth,
        imagesThisMonth: user.imagesThisMonth ?? 0,
        imagesLimit: limits.maxImagesPerMonth,
        voiceoversThisMonth: user.voiceoversThisMonth ?? 0,
        voiceoversLimit: limits.maxVoiceoversPerMonth,
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
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(user._id, {
      name: args.name,
    });

    return { success: true };
  },
});

// Increment image usage count
export const incrementImageUsage = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(user._id, {
      imagesThisMonth: (user.imagesThisMonth ?? 0) + 1,
    });

    return { success: true };
  },
});

// Increment voiceover usage count
export const incrementVoiceoverUsage = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(user._id, {
      voiceoversThisMonth: (user.voiceoversThisMonth ?? 0) + 1,
    });

    return { success: true };
  },
});

// Internal: Update user plan by ID (called from Stripe webhook)
export const updateUserPlanById = internalMutation({
  args: {
    userId: v.string(),
    plan: v.union(v.literal("FREE"), v.literal("PRO"), v.literal("BUSINESS")),
  },
  handler: async (ctx, args) => {
    // Try to get user by ID first
    try {
      const user = await ctx.db.get(args.userId as any);
      if (user) {
        await ctx.db.patch(user._id, { plan: args.plan });
        return { success: true };
      }
    } catch {
      // Not a valid ID, fall through
    }

    throw new Error("User not found");
  },
});

// Internal: Update user plan by stripeCustomerId
export const updateUserPlan = internalMutation({
  args: {
    stripeCustomerId: v.optional(v.string()),
    plan: v.union(v.literal("FREE"), v.literal("PRO"), v.literal("BUSINESS")),
  },
  handler: async (ctx, args) => {
    if (!args.stripeCustomerId) {
      throw new Error("stripeCustomerId required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_stripeCustomerId", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId!)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      plan: args.plan,
    });

    return { success: true };
  },
});

// Internal: Set Stripe customer ID by user ID
export const setStripeCustomerIdById = internalMutation({
  args: {
    userId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db.get(args.userId as any);
      if (user) {
        await ctx.db.patch(user._id, {
          stripeCustomerId: args.stripeCustomerId,
        });
        return { success: true };
      }
    } catch {
      // Not a valid ID, fall through
    }

    throw new Error("User not found");
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
      const resetDate = new Date(user.usageResetDate ?? 0);
      const resetMonth = resetDate.getUTCMonth();
      const resetYear = resetDate.getUTCFullYear();

      if (nowMonth !== resetMonth || nowYear !== resetYear) {
        await ctx.db.patch(user._id, {
          postsThisMonth: 0,
          imagesThisMonth: 0,
          voiceoversThisMonth: 0,
          usageResetDate: now,
        });
      }
    }

    return { success: true };
  },
});

// Internal: Initialize new user defaults (called after user creation)
export const initializeUserDefaults = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Only set defaults if they're not already set
    const updates: Record<string, any> = {};
    if (user.plan === undefined) updates.plan = "FREE";
    if (user.postsThisMonth === undefined) updates.postsThisMonth = 0;
    if (user.imagesThisMonth === undefined) updates.imagesThisMonth = 0;
    if (user.voiceoversThisMonth === undefined) updates.voiceoversThisMonth = 0;
    if (user.usageResetDate === undefined) updates.usageResetDate = Date.now();
    if (user.telegramEnabled === undefined) updates.telegramEnabled = false;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.userId, updates);
    }

    return { success: true };
  },
});
