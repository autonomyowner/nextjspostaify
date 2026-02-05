import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Better-auth manages its own tables via the component
// No authTables spread needed - only app-specific tables here

export default defineSchema({
  // App user profiles - linked to better-auth users via email
  users: defineTable({
    // Core identity (synced from better-auth)
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    image: v.optional(v.string()), // Better-auth image field
    emailVerificationTime: v.optional(v.number()), // Better-auth verification timestamp
    // Legacy field (from old Clerk auth - kept for data compatibility)
    clerkId: v.optional(v.string()),
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
    .index("email", ["email"])
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
    // Voice profile (AI-analyzed characteristics)
    voiceProfile: v.optional(v.object({
      formality: v.number(),      // 1-10 scale
      energy: v.number(),         // 1-10 scale
      humor: v.number(),          // 1-10 scale
      directness: v.number(),     // 1-10 scale
      sentenceStyle: v.string(),  // short_punchy | medium_balanced | long_detailed | mixed
      vocabularyLevel: v.string(), // simple | conversational | professional | technical
      emojiUsage: v.string(),     // none | minimal | moderate | heavy
      hashtagStyle: v.string(),   // none | minimal | branded | trending
      ctaPatterns: v.array(v.string()),
      topicPreferences: v.array(v.string()),
      description: v.string(),    // AI summary of voice
      keyTraits: v.array(v.string()),
      analyzedAt: v.number(),
      postsAnalyzed: v.number(),
    })),
    // Sample posts for few-shot learning
    samplePosts: v.optional(v.array(v.object({
      content: v.string(),
      platform: v.optional(v.string()),
      addedAt: v.number(),
    }))),
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

  // Rate limiting for free tools (IP-based)
  toolRateLimits: defineTable({
    ipHash: v.string(), // SHA-256 hashed IP for privacy
    toolSlug: v.string(),
    lastUsed: v.number(), // Timestamp of last request
    count: v.number(), // Requests in current window
    windowStart: v.number(), // When the current window started
  }).index("by_ip_tool", ["ipHash", "toolSlug"]),

  // Feature click tracking for conversion analytics
  featureClicks: defineTable({
    feature: v.string(), // e.g., "thumbnail-upsell"
    toolSlug: v.string(),
    timestamp: v.number(),
  }).index("by_feature", ["feature"]),
});
