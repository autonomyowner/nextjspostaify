import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Override the users table with app-specific fields
  // Convex Auth will add: email, emailVerificationTime, image, name, isAnonymous
  users: defineTable({
    // Convex Auth fields
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    // Legacy fields (for backward compatibility with existing Clerk data)
    clerkId: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    // App-specific fields
    plan: v.optional(v.union(v.literal("FREE"), v.literal("PRO"), v.literal("BUSINESS"))),
    stripeCustomerId: v.optional(v.string()),
    postsThisMonth: v.optional(v.number()),
    imagesThisMonth: v.optional(v.number()),
    voiceoversThisMonth: v.optional(v.number()),
    usageResetDate: v.optional(v.number()),
    telegramChatId: v.optional(v.string()),
    telegramEnabled: v.optional(v.boolean()),
    telegramLinkedAt: v.optional(v.number()),
  })
    .index("email", ["email"]) // Required by Convex Auth
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_telegramChatId", ["telegramChatId"]),

  brands: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    initials: v.string(),
    voice: v.string(),
    topics: v.array(v.string()),
  }).index("by_userId", ["userId"]),

  posts: defineTable({
    userId: v.id("users"),
    brandId: v.id("brands"),
    content: v.string(),
    platform: v.union(
      v.literal("INSTAGRAM"),
      v.literal("TWITTER"),
      v.literal("LINKEDIN"),
      v.literal("TIKTOK"),
      v.literal("FACEBOOK")
    ),
    imageUrl: v.optional(v.string()),
    voiceUrl: v.optional(v.string()),
    status: v.union(
      v.literal("DRAFT"),
      v.literal("SCHEDULED"),
      v.literal("PUBLISHED")
    ),
    scheduledFor: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    aiGenerated: v.boolean(),
    aiModel: v.optional(v.string()),
    telegramSent: v.boolean(),
    telegramSentAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_brandId", ["brandId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_status_scheduledFor", ["status", "scheduledFor"])
    .index("by_userId_scheduledFor", ["userId", "scheduledFor"]),

  emailCaptures: defineTable({
    email: v.string(),
    marketingConsent: v.boolean(),
    source: v.optional(v.string()),
    planInterest: v.optional(v.string()),
    capturedAt: v.number(),
  }).index("by_email", ["email"]),

  // Chatbot tables
  chatSessions: defineTable({
    sessionId: v.string(), // unique browser session ID
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        timestamp: v.number(),
      })
    ),
    messageCount: v.number(), // tracks user messages for limit
    email: v.optional(v.string()), // captured after limit reached
    emailCaptured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_email", ["email"]),

  botLeads: defineTable({
    email: v.string(),
    sessionId: v.string(),
    messageHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    capturedAt: v.number(),
    source: v.literal("chatbot"),
  })
    .index("by_email", ["email"])
    .index("by_capturedAt", ["capturedAt"]),
});
