"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Generate a connect link for Telegram
export const connect = action({
  args: {
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args): Promise<{ connectUrl: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      throw new Error("Not authenticated");
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error("Telegram bot not configured");
    }

    // Get bot username
    const botInfoResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getMe`
    );
    const botInfo = (await botInfoResponse.json()) as {
      ok: boolean;
      result?: { username: string };
    };

    if (!botInfo.ok || !botInfo.result?.username) {
      throw new Error("Failed to get bot info");
    }

    // Create a unique token for this user
    const token = Buffer.from(
      JSON.stringify({
        clerkId: userClerkId,
        timestamp: Date.now(),
      })
    ).toString("base64url");

    // Generate deep link
    const connectUrl = `https://t.me/${botInfo.result.username}?start=${token}`;

    return { connectUrl };
  },
});

// Send a post notification via Telegram (internal action)
export const sendPost = action({
  args: {
    userId: v.id("users"),
    postContent: v.string(),
    platform: v.string(),
    brandName: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    // Get user's telegram chat ID
    const user = await ctx.runQuery(internal.internal.getUserById, {
      userId: args.userId,
    });

    if (!user?.telegramChatId || !user?.telegramEnabled) {
      return { success: false };
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return { success: false };
    }

    const message = `📱 *New ${args.platform} Post*\n\n🏷️ Brand: ${args.brandName}\n\n${args.postContent}`;

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: args.userId,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    return { success: response.ok };
  },
});
