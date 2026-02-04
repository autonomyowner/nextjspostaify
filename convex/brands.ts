import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getPlanLimits } from "./lib/planLimits";
import { authComponent, getAuthenticatedAppUser } from "./auth";

// List user's brands with post counts
export const list = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser || !authUser.email) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();

    if (!user) {
      return [];
    }

    const brands = await ctx.db
      .query("brands")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Batch fetch all posts for this user once (avoids N+1 queries)
    const allUserPosts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Group posts by brandId in memory
    const postCountByBrand = new Map<string, number>();
    for (const post of allUserPosts) {
      const brandId = post.brandId.toString();
      postCountByBrand.set(brandId, (postCountByBrand.get(brandId) || 0) + 1);
    }

    // Map brands with counts from the precomputed map
    const brandsWithCounts = brands.map((brand) => ({
      _id: brand._id,
      name: brand.name,
      description: brand.description,
      color: brand.color,
      initials: brand.initials,
      voice: brand.voice,
      topics: brand.topics,
      postCount: postCountByBrand.get(brand._id.toString()) || 0,
      _creationTime: brand._creationTime,
    }));

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
  },
  handler: async (ctx, args) => {
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
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const plan = user.plan || "FREE";
    const limits = getPlanLimits(plan);

    // Check brand quota
    const existingBrands = await ctx.db
      .query("brands")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    if (existingBrands.length >= limits.maxBrands) {
      throw new Error(
        `Brand quota exceeded. Your ${plan} plan allows ${limits.maxBrands} brands.`
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
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

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
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

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
