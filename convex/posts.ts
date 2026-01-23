import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getPlanLimits } from "./lib/planLimits";

const platformValidator = v.union(
  v.literal("INSTAGRAM"),
  v.literal("TWITTER"),
  v.literal("LINKEDIN"),
  v.literal("TIKTOK"),
  v.literal("FACEBOOK")
);

const statusValidator = v.union(
  v.literal("DRAFT"),
  v.literal("SCHEDULED"),
  v.literal("PUBLISHED")
);

// Helper to get authenticated user (with clerkId fallback)
async function getAuthenticatedUser(ctx: any, clerkId?: string) {
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

// List user's posts with optional filters
export const list = query({
  args: {
    brandId: v.optional(v.id("brands")),
    status: v.optional(statusValidator),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      return { posts: [], total: 0, limit: 50, offset: 0 };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userClerkId))
      .unique();

    if (!user) {
      return { posts: [], total: 0, limit: 50, offset: 0 };
    }

    const limit = Math.min(1000, Math.max(1, args.limit || 50));
    const offset = Math.max(0, args.offset || 0);

    // Get all posts for the user
    let postsQuery = ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id));

    let allPosts = await postsQuery.collect();

    // Filter by brandId if provided
    if (args.brandId) {
      allPosts = allPosts.filter((post) => post.brandId === args.brandId);
    }

    // Filter by status if provided
    if (args.status) {
      allPosts = allPosts.filter((post) => post.status === args.status);
    }

    // Sort by creation time descending
    allPosts.sort((a, b) => b._creationTime - a._creationTime);

    const total = allPosts.length;

    // Apply pagination
    const paginatedPosts = allPosts.slice(offset, offset + limit);

    // Get brand info for each post
    const postsWithBrands = await Promise.all(
      paginatedPosts.map(async (post) => {
        const brand = await ctx.db.get(post.brandId);
        return {
          _id: post._id,
          content: post.content,
          platform: post.platform,
          imageUrl: post.imageUrl,
          voiceUrl: post.voiceUrl,
          status: post.status,
          scheduledFor: post.scheduledFor,
          publishedAt: post.publishedAt,
          aiGenerated: post.aiGenerated,
          aiModel: post.aiModel,
          brand: brand
            ? {
                _id: brand._id,
                name: brand.name,
                color: brand.color,
                initials: brand.initials,
              }
            : null,
          _creationTime: post._creationTime,
        };
      })
    );

    return {
      posts: postsWithBrands,
      total,
      limit,
      offset,
    };
  },
});

// Get a specific post
export const getById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
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

    const post = await ctx.db.get(args.id);

    if (!post || post.userId !== user._id) {
      return null;
    }

    const brand = await ctx.db.get(post.brandId);

    return {
      _id: post._id,
      content: post.content,
      platform: post.platform,
      imageUrl: post.imageUrl,
      voiceUrl: post.voiceUrl,
      status: post.status,
      scheduledFor: post.scheduledFor,
      publishedAt: post.publishedAt,
      aiGenerated: post.aiGenerated,
      aiModel: post.aiModel,
      brand: brand
        ? {
            _id: brand._id,
            name: brand.name,
            color: brand.color,
            initials: brand.initials,
          }
        : null,
      _creationTime: post._creationTime,
    };
  },
});

// Create a new post
export const create = mutation({
  args: {
    content: v.string(),
    platform: platformValidator,
    brandId: v.id("brands"),
    imageUrl: v.optional(v.string()),
    voiceUrl: v.optional(v.string()),
    status: v.optional(statusValidator),
    scheduledFor: v.optional(v.number()),
    aiGenerated: v.optional(v.boolean()),
    aiModel: v.optional(v.string()),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.clerkId);
    const limits = getPlanLimits(user.plan);

    // Check post quota
    if (user.postsThisMonth >= limits.maxPostsPerMonth) {
      throw new Error(
        `Post quota exceeded. Your ${user.plan} plan allows ${limits.maxPostsPerMonth} posts per month.`
      );
    }

    // Verify brand ownership
    const brand = await ctx.db.get(args.brandId);

    if (!brand) {
      throw new Error("Brand not found");
    }

    if (brand.userId !== user._id) {
      throw new Error("You do not have access to this brand");
    }

    // Create the post
    const postId = await ctx.db.insert("posts", {
      userId: user._id,
      brandId: args.brandId,
      content: args.content,
      platform: args.platform,
      imageUrl: args.imageUrl,
      voiceUrl: args.voiceUrl,
      status: args.status || "DRAFT",
      scheduledFor: args.scheduledFor,
      aiGenerated: args.aiGenerated || false,
      aiModel: args.aiModel,
      telegramSent: false,
    });

    // Increment user's post count
    await ctx.db.patch(user._id, {
      postsThisMonth: user.postsThisMonth + 1,
    });

    return postId;
  },
});

// Update a post
export const update = mutation({
  args: {
    id: v.id("posts"),
    content: v.optional(v.string()),
    platform: v.optional(platformValidator),
    imageUrl: v.optional(v.union(v.string(), v.null())),
    voiceUrl: v.optional(v.union(v.string(), v.null())),
    status: v.optional(statusValidator),
    scheduledFor: v.optional(v.union(v.number(), v.null())),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.clerkId);

    const post = await ctx.db.get(args.id);

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId !== user._id) {
      throw new Error("You do not have access to this post");
    }

    const { id, clerkId: _clerkId, ...updates } = args;

    // Filter out undefined values
    const filteredUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    // Handle publishedAt when status changes to PUBLISHED
    if (args.status === "PUBLISHED" && post.status !== "PUBLISHED") {
      filteredUpdates.publishedAt = Date.now();
    }

    await ctx.db.patch(args.id, filteredUpdates);

    return { success: true };
  },
});

// Delete a post
export const remove = mutation({
  args: {
    id: v.id("posts"),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.clerkId);

    const post = await ctx.db.get(args.id);

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId !== user._id) {
      throw new Error("You do not have access to this post");
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});

// Get posts for calendar view
export const getForCalendar = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Filter posts that are scheduled or published within the date range
    return posts.filter((post) => {
      const date = post.scheduledFor || post.publishedAt || post._creationTime;
      return date >= args.startDate && date <= args.endDate;
    });
  },
});
