import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { auth } from "./auth";

// Get Telegram connection status
export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    return {
      configured: !!botToken,
      connected: !!user.telegramChatId,
      enabled: user.telegramEnabled ?? false,
      linkedAt: user.telegramLinkedAt,
    };
  },
});

// Disconnect Telegram
export const disconnect = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
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
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
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

// Internal: Link Telegram account by userId (from webhook /start command)
export const linkAccountById = internalMutation({
  args: {
    userId: v.string(),
    telegramChatId: v.string(),
  },
  handler: async (ctx, args) => {
    // Try to get user by ID
    let user;
    try {
      user = await ctx.db.get(args.userId as any);
    } catch {
      return { success: false, error: "Invalid user ID" };
    }

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

// Generate a link code for the user to connect their Telegram account
export const generateLinkCode = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Create a simple link code containing userId and timestamp
    const timestamp = Date.now().toString();
    const payload = `${userId}:${timestamp}`;
    const linkCode = btoa(payload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "PostaifyBot";
    const linkUrl = `https://t.me/${botUsername}?start=${linkCode}`;

    return { linkCode, linkUrl };
  },
});
