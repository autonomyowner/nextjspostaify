import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MESSAGE_LIMIT = 5;

// Get or create a chat session
export const getOrCreateSession = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("chatSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      return {
        session: existing,
        isNew: false,
      };
    }

    const now = Date.now();
    const sessionDocId = await ctx.db.insert("chatSessions", {
      sessionId: args.sessionId,
      messages: [],
      messageCount: 0,
      emailCaptured: false,
      createdAt: now,
      updatedAt: now,
    });

    const session = await ctx.db.get(sessionDocId);
    return {
      session,
      isNew: true,
    };
  },
});

// Get session by sessionId
export const getSession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();
  },
});

// Add a message to the session (called after AI response)
export const addMessage = mutation({
  args: {
    sessionId: v.string(),
    userMessage: v.string(),
    assistantMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    let session = await ctx.db
      .query("chatSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    // Create session if it doesn't exist
    if (!session) {
      const sessionId = await ctx.db.insert("chatSessions", {
        sessionId: args.sessionId,
        messages: [],
        messageCount: 0,
        emailCaptured: false,
        createdAt: now,
        updatedAt: now,
      });
      session = await ctx.db.get(sessionId);
      if (!session) {
        throw new Error("Failed to create session");
      }
    }

    const newMessages = [
      ...session.messages,
      { role: "user" as const, content: args.userMessage, timestamp: now },
      { role: "assistant" as const, content: args.assistantMessage, timestamp: now },
    ];

    await ctx.db.patch(session._id, {
      messages: newMessages,
      messageCount: session.messageCount + 1,
      updatedAt: now,
    });

    return {
      messageCount: session.messageCount + 1,
      needsEmail: session.messageCount + 1 >= MESSAGE_LIMIT && !session.emailCaptured,
    };
  },
});

// Capture email from chatbot
export const captureEmail = mutation({
  args: {
    sessionId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    const session = await ctx.db
      .query("chatSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    // Check if email already captured from this session
    if (session.emailCaptured) {
      return { success: true, alreadyCaptured: true };
    }

    const now = Date.now();

    // Update session with email
    await ctx.db.patch(session._id, {
      email: args.email,
      emailCaptured: true,
      updatedAt: now,
    });

    // Check if this email already exists in botLeads
    const existingLead = await ctx.db
      .query("botLeads")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!existingLead) {
      // Create a new bot lead
      await ctx.db.insert("botLeads", {
        email: args.email,
        sessionId: args.sessionId,
        messageHistory: session.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        capturedAt: now,
        source: "chatbot",
      });
    }

    return { success: true, alreadyCaptured: false };
  },
});

// Check if user has reached message limit
export const checkMessageLimit = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("chatSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      return {
        messageCount: 0,
        limit: MESSAGE_LIMIT,
        needsEmail: false,
        emailCaptured: false,
      };
    }

    return {
      messageCount: session.messageCount,
      limit: MESSAGE_LIMIT,
      needsEmail: session.messageCount >= MESSAGE_LIMIT && !session.emailCaptured,
      emailCaptured: session.emailCaptured,
    };
  },
});

// Get message limit constant
export const getMessageLimit = query({
  args: {},
  handler: async () => {
    return MESSAGE_LIMIT;
  },
});
