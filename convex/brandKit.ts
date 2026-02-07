import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { getPlanLimits, Plan } from "./lib/planLimits";

// ============================================================
// QUERIES
// ============================================================

export const getByBrandId = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch {
      return null;
    }
    if (!authUser || !authUser.email) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();
    if (!user) return null;

    return await ctx.db
      .query("brandKits")
      .withIndex("by_brandId", (q) => q.eq("brandId", args.brandId))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("brandKits") },
  handler: async (ctx, args) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch {
      return null;
    }
    if (!authUser || !authUser.email) return null;

    return await ctx.db.get(args.id);
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch {
      return [];
    }
    if (!authUser || !authUser.email) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();
    if (!user) return [];

    return await ctx.db
      .query("brandKits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brandKits")
      .withIndex("by_publicSlug", (q) => q.eq("publicSlug", args.slug))
      .first();
  },
});

// ============================================================
// MUTATIONS
// ============================================================

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    vibes: v.array(v.string()),
    brandId: v.optional(v.id("brands")),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser || !authUser.email) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();
    if (!user) throw new Error("User not found");

    // Check plan limits
    const plan = (user.plan || "FREE") as Plan;
    const limits = getPlanLimits(plan);
    const existingKits = await ctx.db
      .query("brandKits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    if (existingKits.length >= limits.maxBrandKits) {
      throw new Error(
        `You've reached the maximum of ${limits.maxBrandKits} brand kit(s) on your ${plan} plan. Upgrade to create more.`
      );
    }

    const kitId = await ctx.db.insert("brandKits", {
      userId: user._id,
      brandId: args.brandId,
      name: args.name,
      description: args.description,
      vibes: args.vibes,
      status: "GENERATING",
      progress: {
        palette: false,
        typography: false,
        logos: false,
        moodBoard: false,
        backgrounds: false,
        mockups: false,
        socialKit: false,
        pattern: false,
      },
      createdAt: Date.now(),
    });

    // Increment user's kit count
    await ctx.db.patch(user._id, {
      brandKitsGenerated: (user.brandKitsGenerated ?? 0) + 1,
    });

    return kitId;
  },
});

export const updateProgress = mutation({
  args: {
    kitId: v.id("brandKits"),
    step: v.string(),
  },
  handler: async (ctx, args) => {
    const kit = await ctx.db.get(args.kitId);
    if (!kit) throw new Error("Brand kit not found");

    const progress = kit.progress || {
      palette: false,
      typography: false,
      logos: false,
      moodBoard: false,
      backgrounds: false,
      mockups: false,
      socialKit: false,
      pattern: false,
    };

    await ctx.db.patch(args.kitId, {
      progress: { ...progress, [args.step]: true },
    });
  },
});

export const savePalette = mutation({
  args: {
    kitId: v.id("brandKits"),
    palette: v.object({
      primary: v.object({ hex: v.string(), name: v.string(), use: v.string() }),
      secondary: v.object({ hex: v.string(), name: v.string(), use: v.string() }),
      accent: v.object({ hex: v.string(), name: v.string(), use: v.string() }),
      dark: v.object({ hex: v.string(), name: v.string(), use: v.string() }),
      light: v.object({ hex: v.string(), name: v.string(), use: v.string() }),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { palette: args.palette });
  },
});

export const saveTypography = mutation({
  args: {
    kitId: v.id("brandKits"),
    typography: v.object({
      heading: v.object({ family: v.string(), weight: v.string(), style: v.string() }),
      body: v.object({ family: v.string(), weight: v.string(), style: v.string() }),
      recommendation: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { typography: args.typography });
  },
});

export const saveLogos = mutation({
  args: {
    kitId: v.id("brandKits"),
    logos: v.array(v.object({
      type: v.string(),
      url: v.string(),
      prompt: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { logos: args.logos });
  },
});

export const saveMoodBoard = mutation({
  args: {
    kitId: v.id("brandKits"),
    moodBoard: v.array(v.object({
      url: v.string(),
      prompt: v.optional(v.string()),
      label: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { moodBoard: args.moodBoard });
  },
});

export const saveBackgrounds = mutation({
  args: {
    kitId: v.id("brandKits"),
    postBackgrounds: v.array(v.object({
      url: v.string(),
      size: v.optional(v.string()),
      prompt: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { postBackgrounds: args.postBackgrounds });
  },
});

export const saveMockups = mutation({
  args: {
    kitId: v.id("brandKits"),
    mockups: v.array(v.object({
      type: v.string(),
      url: v.string(),
      prompt: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { mockups: args.mockups });
  },
});

export const saveSocialProfiles = mutation({
  args: {
    kitId: v.id("brandKits"),
    socialProfiles: v.array(v.object({
      platform: v.string(),
      avatarUrl: v.optional(v.string()),
      bannerUrl: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { socialProfiles: args.socialProfiles });
  },
});

export const savePattern = mutation({
  args: {
    kitId: v.id("brandKits"),
    pattern: v.object({
      url: v.string(),
      prompt: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { pattern: args.pattern });
  },
});

export const finalize = mutation({
  args: {
    kitId: v.id("brandKits"),
    score: v.number(),
    status: v.union(v.literal("READY"), v.literal("FAILED")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, {
      status: args.status,
      score: args.score,
    });
  },
});

export const deleteKit = mutation({
  args: { id: v.id("brandKits") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser || !authUser.email) throw new Error("Not authenticated");

    const kit = await ctx.db.get(args.id);
    if (!kit) throw new Error("Brand kit not found");

    await ctx.db.delete(args.id);
  },
});
