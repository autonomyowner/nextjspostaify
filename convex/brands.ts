import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getPlanLimits } from "./lib/planLimits";

// Helper to get authenticated user (with clerkId fallback)
async function getAuthenticatedUser(ctx: any, clerkId?: string) {
  // Try Convex auth first
  const identity = await ctx.auth.getUserIdentity();
  const userClerkId = identity?.subject || clerkId;

  if (!userClerkId) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", userClerkId))
    .unique();

  if (!user) {
    throw new Error("User not found. Please refresh the page.");
  }

  return user;
}

// List user's brands with post counts
export const list = query({
  args: {
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userClerkId))
      .unique();

    if (!user) {
      return [];
    }

    const brands = await ctx.db
      .query("brands")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Get post counts for each brand
    const brandsWithCounts = await Promise.all(
      brands.map(async (brand) => {
        const posts = await ctx.db
          .query("posts")
          .withIndex("by_brandId", (q) => q.eq("brandId", brand._id))
          .collect();

        return {
          _id: brand._id,
          name: brand.name,
          description: brand.description,
          color: brand.color,
          initials: brand.initials,
          voice: brand.voice,
          topics: brand.topics,
          postCount: posts.length,
          _creationTime: brand._creationTime,
        };
      })
    );

    // Sort by creation time descending
    return brandsWithCounts.sort(
      (a, b) => b._creationTime - a._creationTime
    );
  },
});

// Get a specific brand
export const getById = query({
  args: {
    id: v.id("brands"),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userClerkId))
      .unique();

    if (!user) {
      return null;
    }

    const brand = await ctx.db.get(args.id);

    if (!brand || brand.userId !== user._id) {
      return null;
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_brandId", (q) => q.eq("brandId", brand._id))
      .collect();

    return {
      _id: brand._id,
      name: brand.name,
      description: brand.description,
      color: brand.color,
      initials: brand.initials,
      voice: brand.voice,
      topics: brand.topics,
      postCount: posts.length,
      _creationTime: brand._creationTime,
    };
  },
});

// Create a new brand
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    initials: v.optional(v.string()),
    voice: v.optional(v.string()),
    topics: v.optional(v.array(v.string())),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.clerkId);
    const limits = getPlanLimits(user.plan);

    // Check brand quota
    const existingBrands = await ctx.db
      .query("brands")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    if (existingBrands.length >= limits.maxBrands) {
      throw new Error(
        `Brand quota exceeded. Your ${user.plan} plan allows ${limits.maxBrands} brands.`
      );
    }

    // Generate initials from name if not provided
    const brandInitials =
      args.initials ||
      args.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const brandId = await ctx.db.insert("brands", {
      userId: user._id,
      name: args.name,
      description: args.description,
      color: args.color || "#EAB308",
      initials: brandInitials,
      voice: args.voice || "professional",
      topics: args.topics || [],
    });

    return brandId;
  },
});

// Update a brand
export const update = mutation({
  args: {
    id: v.id("brands"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    initials: v.optional(v.string()),
    voice: v.optional(v.string()),
    topics: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const brand = await ctx.db.get(args.id);

    if (!brand) {
      throw new Error("Brand not found");
    }

    if (brand.userId !== user._id) {
      throw new Error("You do not have access to this brand");
    }

    const { id, ...updates } = args;

    // Filter out undefined values
    const filteredUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    await ctx.db.patch(args.id, filteredUpdates);

    return { success: true };
  },
});

// Delete a brand and its posts
export const remove = mutation({
  args: {
    id: v.id("brands"),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.clerkId);

    const brand = await ctx.db.get(args.id);

    if (!brand) {
      throw new Error("Brand not found");
    }

    if (brand.userId !== user._id) {
      throw new Error("You do not have access to this brand");
    }

    // Delete all posts for this brand
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_brandId", (q) => q.eq("brandId", args.id))
      .collect();

    for (const post of posts) {
      await ctx.db.delete(post._id);
    }

    // Delete the brand
    await ctx.db.delete(args.id);

    return { success: true };
  },
});
