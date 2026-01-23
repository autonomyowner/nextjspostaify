import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

// Get Telegram connection status
export const getStatus = query({
  args: {
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

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    return {
      configured: !!botToken,
      connected: !!user.telegramChatId,
      enabled: user.telegramEnabled,
      linkedAt: user.telegramLinkedAt,
    };
  },
});

// Disconnect Telegram
export const disconnect = mutation({
  args: {
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userClerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      telegramChatId: undefined,
      telegramEnabled: false,
      telegramLinkedAt: undefined,
    });

    return { success: true };
  },
});

// Internal: Disconnect by telegram chat ID (from webhook)
export const disconnectByWebhook = internalMutation({
  args: { telegramChatId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_telegramChatId", (q) =>
        q.eq("telegramChatId", args.telegramChatId)
      )
      .unique();

    if (!user) {
      return { success: false };
    }

    await ctx.db.patch(user._id, {
      telegramChatId: undefined,
      telegramEnabled: false,
      telegramLinkedAt: undefined,
    });

    return { success: true };
  },
});

// Toggle Telegram notifications
export const toggle = mutation({
  args: {
    enabled: v.boolean(),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userClerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.telegramChatId) {
      throw new Error("Telegram not connected");
    }

    await ctx.db.patch(user._id, {
      telegramEnabled: args.enabled,
    });

    return { success: true, enabled: args.enabled };
  },
});

// Internal: Link Telegram account (from webhook /start command)
export const linkAccount = internalMutation({
  args: {
    clerkId: v.string(),
    telegramChatId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Check if this chat ID is already linked to another user
    const existingLink = await ctx.db
      .query("users")
      .withIndex("by_telegramChatId", (q) =>
        q.eq("telegramChatId", args.telegramChatId)
      )
      .unique();

    if (existingLink && existingLink._id !== user._id) {
      // Unlink from previous user
      await ctx.db.patch(existingLink._id, {
        telegramChatId: undefined,
        telegramEnabled: false,
        telegramLinkedAt: undefined,
      });
    }

    // Link to new user
    await ctx.db.patch(user._id, {
      telegramChatId: args.telegramChatId,
      telegramEnabled: true,
      telegramLinkedAt: Date.now(),
    });

    return { success: true };
  },
});
