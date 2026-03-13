import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { authComponent } from "./auth";
import { generateClipHTML, estimateDuration } from "./lib/clipTemplates";
import type { SceneData, ClipColors, ClipTheme } from "./lib/clipTemplates";

// ============================================================
// QUERIES
// ============================================================

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

    const clips = await ctx.db
      .query("clips")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return clips.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getById = query({
  args: { id: v.id("clips") },
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

// Internal query for HTTP route (no auth needed)
export const getByIdInternal = internalQuery({
  args: { id: v.id("clips") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

// ============================================================
// MUTATIONS
// ============================================================

export const create = mutation({
  args: {
    title: v.string(),
    script: v.string(),
    scenes: v.any(),
    colors: v.object({
      primary: v.string(),
      secondary: v.string(),
      accent: v.string(),
      background: v.optional(v.string()),
    }),
    htmlContent: v.string(),
    duration: v.number(),
    scenesCount: v.number(),
    brandId: v.optional(v.id("brands")),
    theme: v.optional(v.union(v.literal("classic"), v.literal("cinematic"))),
    category: v.optional(v.union(
      v.literal("saas"),
      v.literal("storytelling"),
      v.literal("educational"),
      v.literal("ecommerce"),
      v.literal("personal"),
    )),
    voiceoverStorageId: v.optional(v.string()),
    voiceoverText: v.optional(v.string()),
    voiceId: v.optional(v.string()),
    voiceProvider: v.optional(v.literal("cartesia")),
    voiceoverDurationMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch {
      throw new Error("Not authenticated");
    }
    if (!authUser || !authUser.email) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();
    if (!user) throw new Error("User not found");

    const clipId = await ctx.db.insert("clips", {
      userId: user._id,
      brandId: args.brandId,
      title: args.title,
      script: args.script,
      scenes: args.scenes,
      colors: args.colors,
      theme: args.theme,
      category: args.category,
      htmlContent: args.htmlContent,
      voiceoverStorageId: args.voiceoverStorageId,
      voiceoverText: args.voiceoverText,
      voiceId: args.voiceId,
      voiceProvider: args.voiceProvider,
      voiceoverDurationMs: args.voiceoverDurationMs,
      renderStatus: "draft",
      duration: args.duration,
      scenesCount: args.scenesCount,
      createdAt: Date.now(),
    });

    // Increment usage
    await ctx.db.patch(user._id, {
      clipsThisMonth: (user.clipsThisMonth || 0) + 1,
    });

    return clipId;
  },
});

export const updateRenderStatus = mutation({
  args: {
    clipId: v.id("clips"),
    renderStatus: v.union(
      v.literal("draft"),
      v.literal("rendering"),
      v.literal("ready"),
      v.literal("failed")
    ),
    mp4Url: v.optional(v.string()),
    renderJobId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch {
      throw new Error("Not authenticated");
    }
    if (!authUser || !authUser.email) throw new Error("Not authenticated");

    const patch: Record<string, unknown> = {
      renderStatus: args.renderStatus,
    };
    if (args.mp4Url !== undefined) patch.mp4Url = args.mp4Url;
    if (args.renderJobId !== undefined) patch.renderJobId = args.renderJobId;

    await ctx.db.patch(args.clipId, patch);
  },
});

export const deleteClip = mutation({
  args: { id: v.id("clips") },
  handler: async (ctx, args) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch {
      throw new Error("Not authenticated");
    }
    if (!authUser || !authUser.email) throw new Error("Not authenticated");

    const clip = await ctx.db.get(args.id);
    if (!clip) throw new Error("Clip not found");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();
    if (!user || clip.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

export const updateScenes = mutation({
  args: {
    clipId: v.id("clips"),
    scenes: v.any(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, { clipId, scenes, title }) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch {
      throw new Error("Not authenticated");
    }
    if (!authUser || !authUser.email) throw new Error("Not authenticated");

    const clip = await ctx.db.get(clipId);
    if (!clip) throw new Error("Clip not found");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();
    if (!user || clip.userId !== user._id) throw new Error("Unauthorized");

    const typedScenes = scenes as SceneData[];
    const clipTitle = title ?? clip.title;
    const colors = clip.colors as ClipColors;
    const theme = (clip.theme as ClipTheme) || "classic";

    const htmlContent = generateClipHTML({
      title: clipTitle,
      scenes: typedScenes,
      colors,
      theme,
    });
    const duration = estimateDuration(typedScenes);

    await ctx.db.patch(clipId, {
      scenes: typedScenes,
      htmlContent,
      duration,
      scenesCount: typedScenes.length,
      ...(title !== undefined ? { title: clipTitle } : {}),
      // Reset MP4 since content changed
      mp4Url: undefined,
      renderStatus: "draft",
    });

    return { htmlContent, duration, scenesCount: typedScenes.length };
  },
});
