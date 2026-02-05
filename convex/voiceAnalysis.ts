import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { authComponent, getAuthenticatedAppUser } from "./auth";
import { getPlanLimits } from "./lib/planLimits";

// Voice profile type for validation
const voiceProfileValidator = v.object({
  formality: v.number(),
  energy: v.number(),
  humor: v.number(),
  directness: v.number(),
  sentenceStyle: v.string(),
  vocabularyLevel: v.string(),
  emojiUsage: v.string(),
  hashtagStyle: v.string(),
  ctaPatterns: v.array(v.string()),
  topicPreferences: v.array(v.string()),
  description: v.string(),
  keyTraits: v.array(v.string()),
  analyzedAt: v.number(),
  postsAnalyzed: v.number(),
});

// Sample post validator
const samplePostValidator = v.object({
  content: v.string(),
  platform: v.optional(v.string()),
  addedAt: v.number(),
});

// Count voice profiles for a user
export const countVoiceProfiles = query({
  args: {},
  handler: async (ctx) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch {
      return 0;
    }
    if (!authUser || !authUser.email) {
      return 0;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();

    if (!user) {
      return 0;
    }

    const brands = await ctx.db
      .query("brands")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Count brands that have a voice profile
    return brands.filter((b) => b.voiceProfile !== undefined).length;
  },
});

// Save voice profile to a brand
export const saveVoiceProfile = mutation({
  args: {
    brandId: v.id("brands"),
    voiceProfile: voiceProfileValidator,
    samplePosts: v.array(samplePostValidator),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const brand = await ctx.db.get(args.brandId);
    if (!brand) {
      throw new Error("Brand not found");
    }

    if (brand.userId !== user._id) {
      throw new Error("You do not have access to this brand");
    }

    // Check voice profile limit (only for new profiles, not updates)
    if (!brand.voiceProfile) {
      const plan = user.plan || "FREE";
      const limits = getPlanLimits(plan);

      const brands = await ctx.db
        .query("brands")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect();

      const existingProfiles = brands.filter(
        (b) => b.voiceProfile !== undefined
      ).length;

      if (existingProfiles >= limits.maxVoiceProfiles) {
        throw new Error(
          `Voice profile limit reached. Your ${plan} plan allows ${limits.maxVoiceProfiles} voice profile(s). Upgrade to add more.`
        );
      }
    }

    await ctx.db.patch(args.brandId, {
      voiceProfile: args.voiceProfile,
      samplePosts: args.samplePosts,
    });

    return { success: true };
  },
});

// Clear voice profile from a brand
export const clearVoiceProfile = mutation({
  args: {
    brandId: v.id("brands"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedAppUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const brand = await ctx.db.get(args.brandId);
    if (!brand) {
      throw new Error("Brand not found");
    }

    if (brand.userId !== user._id) {
      throw new Error("You do not have access to this brand");
    }

    await ctx.db.patch(args.brandId, {
      voiceProfile: undefined,
      samplePosts: undefined,
    });

    return { success: true };
  },
});

// Analyze voice from posts
export const analyzeVoice = action({
  args: {
    posts: v.array(v.string()),
    brandId: v.id("brands"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify user exists
    const user = await ctx.runQuery(api.users.viewer);
    if (!user) {
      throw new Error("User not found. Please refresh the page.");
    }

    // Verify brand access
    const brand = await ctx.runQuery(api.brands.getById, { id: args.brandId });
    if (!brand) {
      throw new Error("Brand not found");
    }

    // Validate posts
    if (args.posts.length < 3) {
      throw new Error("Please provide at least 3 posts for accurate analysis");
    }
    if (args.posts.length > 20) {
      throw new Error("Maximum 20 posts can be analyzed at once");
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not configured");
    }

    // Build the analysis prompt
    const postsText = args.posts
      .map((post, i) => `[Post ${i + 1}]:\n${post}`)
      .join("\n\n");

    const systemPrompt = `You are an expert writing style analyst. Analyze the provided social media posts and extract the author's unique voice characteristics.

Return a JSON object with EXACTLY this structure (no markdown, no explanation, just valid JSON):
{
  "formality": <number 1-10, where 1=very casual, 10=very formal>,
  "energy": <number 1-10, where 1=calm/reflective, 10=high-energy/enthusiastic>,
  "humor": <number 1-10, where 1=serious/no humor, 10=very humorous/playful>,
  "directness": <number 1-10, where 1=subtle/indirect, 10=very direct/blunt>,
  "sentenceStyle": "<one of: short_punchy | medium_balanced | long_detailed | mixed>",
  "vocabularyLevel": "<one of: simple | conversational | professional | technical>",
  "emojiUsage": "<one of: none | minimal | moderate | heavy>",
  "hashtagStyle": "<one of: none | minimal | branded | trending>",
  "ctaPatterns": [<array of 2-4 common call-to-action phrases used>],
  "topicPreferences": [<array of 3-5 main topics/themes detected>],
  "description": "<2-3 sentence summary of the writing voice/personality>",
  "keyTraits": [<array of 4-6 key personality/voice traits like 'bold', 'authentic', 'provocative', 'empathetic'>]
}

IMPORTANT:
- Be specific and accurate based on the actual posts
- Numbers should be precise (not all 5s)
- Detect real patterns, don't guess
- Return ONLY valid JSON, no other text`;

    const userPrompt = `Analyze these ${args.posts.length} social media posts and extract the voice profile:

${postsText}`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.FRONTEND_URL || "https://postaify.app",
          "X-Title": "POSTAIFY",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 1000,
          temperature: 0.3, // Low temperature for consistent analysis
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI analysis failed: ${error}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices[0]?.message?.content || "";

    // Parse the JSON response
    try {
      // Extract JSON from the response (handle potential markdown wrapping)
      let jsonStr = content.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      const profile = JSON.parse(jsonStr);

      // Validate required fields
      const requiredFields = [
        "formality",
        "energy",
        "humor",
        "directness",
        "sentenceStyle",
        "vocabularyLevel",
        "emojiUsage",
        "hashtagStyle",
        "ctaPatterns",
        "topicPreferences",
        "description",
        "keyTraits",
      ];

      for (const field of requiredFields) {
        if (!(field in profile)) {
          throw new Error(`Missing field: ${field}`);
        }
      }

      // Add metadata
      const voiceProfile = {
        ...profile,
        analyzedAt: Date.now(),
        postsAnalyzed: args.posts.length,
      };

      // Prepare sample posts
      const samplePosts = args.posts.slice(0, 10).map((content) => ({
        content,
        platform: undefined,
        addedAt: Date.now(),
      }));

      return {
        voiceProfile,
        samplePosts,
      };
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error(
        "Failed to analyze voice profile. Please try again."
      );
    }
  },
});
