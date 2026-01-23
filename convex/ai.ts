import { v } from "convex/values";
import { query, action } from "./_generated/server";
import { api } from "./_generated/api";

type Platform = "INSTAGRAM" | "TWITTER" | "LINKEDIN" | "TIKTOK" | "FACEBOOK";
type ContentStyle =
  | "viral"
  | "storytelling"
  | "educational"
  | "controversial"
  | "inspirational";

// Available AI models
export const AVAILABLE_MODELS = [
  { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku (Fast)" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet (Best)" },
  { value: "anthropic/claude-3-opus", label: "Claude 3 Opus (Creative)" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini (Fast)" },
  { value: "openai/gpt-4o", label: "GPT-4o (Smart)" },
  { value: "google/gemini-flash-1.5", label: "Gemini Flash (Fast)" },
];

// Get available models
export const getModels = query({
  args: {},
  handler: async () => {
    return AVAILABLE_MODELS;
  },
});

// Copywriting frameworks
const COPYWRITING_FRAMEWORKS = `
## MASTER COPYWRITING FRAMEWORKS (Use ONE per post)

### 1. PAS (Problem-Agitate-Solution) - Best for engagement
- PROBLEM: Identify a specific pain point your audience faces
- AGITATE: Twist the knife - make them FEEL the frustration
- SOLUTION: Present your insight/tip as the relief

### 2. AIDA (Attention-Interest-Desire-Action) - Best for conversions
- ATTENTION: Pattern-interrupt opening (controversial, unexpected)
- INTEREST: "Here's why this matters to YOU..."
- DESIRE: Paint the transformation, the after-state
- ACTION: Clear next step (save, share, comment, try this)

### 3. BAB (Before-After-Bridge) - Best for storytelling
- BEFORE: "I used to struggle with..."
- AFTER: "Now I..." (paint the dream state)
- BRIDGE: "Here's exactly how..." (the method/secret)
`;

// Viral hooks
const VIRAL_HOOKS = `
## VIRAL HOOK FORMULAS

### Curiosity Hooks
- "Nobody is talking about this, but..."
- "The [thing] that [experts] don't want you to know..."
- "I spent [time] researching [topic]. Here's what I found..."

### Contrarian Hooks
- "Unpopular opinion: [bold statement]"
- "Everything you know about [topic] is wrong"
- "Stop doing [common thing]. Here's why..."

### Transformation Hooks
- "I went from [bad state] to [good state] in [timeframe]. Here's how..."
- "This one change [transformed/doubled/fixed] my [result]..."
`;

// Platform-specific instructions
const PLATFORM_MASTERY: Record<Platform, string> = {
  INSTAGRAM: `## INSTAGRAM: Hook under 125 chars, use line breaks, 3-5 hashtags at end, total 150-300 words for carousels`,
  TWITTER: `## TWITTER: Front-load value, 71-100 chars ideal for single tweets, be punchy and direct`,
  LINKEDIN: `## LINKEDIN: Start with "I" + vulnerable statement, short paragraphs, 1200-1500 chars total`,
  TIKTOK: `## TIKTOK: Script for 15-60 seconds, hook in first 3 seconds, talk fast but clear`,
  FACEBOOK: `## FACEBOOK: Question or relatable statement opening, encourage shares, 100-250 words`,
};

const styleInstructions: Record<ContentStyle, string> = {
  viral:
    "Optimize for maximum shareability and engagement. Use curiosity gaps, bold hooks, and emotional triggers.",
  storytelling:
    "Lead with a personal narrative. Use the transformation story framework. Make it relatable and emotional.",
  educational:
    "Deliver high-value insights. Use numbered lists, clear takeaways, and actionable advice.",
  controversial:
    "Take a bold stance. Challenge conventional wisdom. Be provocative but substantive.",
  inspirational:
    "Motivate and uplift. Use transformation stories, emotional language, and empowering CTAs.",
};

// Generate content action
export const generateContent = action({
  args: {
    brandId: v.id("brands"),
    platform: v.union(
      v.literal("INSTAGRAM"),
      v.literal("TWITTER"),
      v.literal("LINKEDIN"),
      v.literal("TIKTOK"),
      v.literal("FACEBOOK")
    ),
    topic: v.optional(v.string()),
    style: v.optional(
      v.union(
        v.literal("viral"),
        v.literal("storytelling"),
        v.literal("educational"),
        v.literal("controversial"),
        v.literal("inspirational")
      )
    ),
    model: v.optional(v.string()),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    // Try Convex auth first, fall back to clerkId
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      throw new Error("Not authenticated");
    }

    // Verify user exists
    const user = await ctx.runQuery(api.users.getByClerkId, { clerkId: userClerkId });
    if (!user) {
      throw new Error("User not found. Please refresh the page.");
    }

    // Get brand details
    const brand = await ctx.runQuery(api.brands.getById, { id: args.brandId, clerkId: userClerkId });
    if (!brand) {
      throw new Error("Brand not found");
    }

    const style = args.style || "viral";
    const model = args.model || "anthropic/claude-3-haiku";
    const platform = args.platform;

    const systemPrompt = `You are an elite copywriter. Create viral, high-converting social media content.

## BRAND CONTEXT
Brand: ${brand.name}
Description: ${brand.description || "N/A"}
Voice/Tone: ${brand.voice}
Core Topics: ${brand.topics.join(", ")}

## STYLE DIRECTION
${styleInstructions[style as ContentStyle]}

${COPYWRITING_FRAMEWORKS}
${VIRAL_HOOKS}
${PLATFORM_MASTERY[platform]}

## CRITICAL RULES
1. HOOK IS EVERYTHING - The first line must stop the scroll
2. EVERY WORD EARNS ITS PLACE - Cut ruthlessly
3. WRITE LIKE YOU TALK - Conversational, not corporate
4. ONE IDEA PER POST - Don't dilute
5. END WITH PURPOSE - Every post needs a clear CTA

## OUTPUT FORMAT
Generate ONLY the post content. No explanations, no meta-commentary.
Ready to copy-paste directly to ${platform}.`;

    const userPrompt = args.topic
      ? `Create a ${style} ${platform} post about: ${args.topic}`
      : `Create a ${style} ${platform} post about one of these topics: ${brand.topics.join(", ")}`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not configured");
    }

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
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 1500,
          temperature: 0.85,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content =
      data.choices[0]?.message?.content || "Failed to generate content";

    return {
      content,
      platform,
      model,
      style,
    };
  },
});

// Generate posts from video transcript
export const videoToPosts = action({
  args: {
    brandId: v.id("brands"),
    platform: v.union(
      v.literal("INSTAGRAM"),
      v.literal("TWITTER"),
      v.literal("LINKEDIN"),
      v.literal("TIKTOK"),
      v.literal("FACEBOOK")
    ),
    transcript: v.string(),
    videoTitle: v.string(),
    numberOfPosts: v.number(),
    style: v.optional(
      v.union(
        v.literal("viral"),
        v.literal("storytelling"),
        v.literal("educational"),
        v.literal("controversial"),
        v.literal("inspirational")
      )
    ),
    model: v.optional(v.string()),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    // Try Convex auth first, fall back to clerkId
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      throw new Error("Not authenticated");
    }

    // Check feature access - need to get user and check plan
    const user = await ctx.runQuery(api.users.getByClerkId, { clerkId: userClerkId });
    if (!user) {
      throw new Error("User not found. Please refresh the page.");
    }
    if (!user.features.hasVideoRepurpose) {
      throw new Error(
        "Video repurpose is not available on your plan. Upgrade to Pro."
      );
    }

    // Get brand details
    const brand = await ctx.runQuery(api.brands.getById, { id: args.brandId, clerkId: userClerkId });
    if (!brand) {
      throw new Error("Brand not found");
    }

    const style = args.style || "viral";
    const model = args.model || "anthropic/claude-3.5-sonnet";
    const platform = args.platform;

    const systemPrompt = `You are an elite content repurposing specialist. Transform video content into viral social media posts.

## BRAND CONTEXT
Brand: ${brand.name}
Description: ${brand.description || "N/A"}
Voice/Tone: ${brand.voice}
Topics: ${brand.topics.join(", ")}

## STYLE: ${styleInstructions[style as ContentStyle]}

${PLATFORM_MASTERY[platform]}

## VIDEO CONTENT
Title: "${args.videoTitle}"
Transcript: ${args.transcript.slice(0, 12000)}${args.transcript.length > 12000 ? "...[truncated]" : ""}

## YOUR TASK
Create exactly ${args.numberOfPosts} unique ${platform} posts from this video.

## RULES
1. Each post must be COMPLETELY UNIQUE
2. Extract the BEST moments - don't just summarize
3. Each post should work STANDALONE
4. Use direct quotes when powerful (mark with "")
5. Every post must have a clear CTA

## OUTPUT FORMAT
Return ONLY a JSON array of ${args.numberOfPosts} posts. No explanations.
Format: ["post 1 content here", "post 2 content here", ...]`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not configured");
    }

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
          model,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate ${args.numberOfPosts} unique ${style} ${platform} posts from the video transcript above. Return as a JSON array of strings.`,
            },
          ],
          max_tokens: 4000,
          temperature: 0.9,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices[0]?.message?.content || "[]";

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const posts = JSON.parse(jsonMatch[0]);
        if (Array.isArray(posts)) {
          return {
            posts: posts.map((post) => String(post).trim()),
            count: posts.length,
            platform,
            model,
          };
        }
      }
      throw new Error("Invalid response format");
    } catch {
      const lines = content.split(/\n\n+/).filter(
        (line) =>
          line.trim().length > 50 &&
          !line.startsWith("[") &&
          !line.startsWith("]")
      );
      if (lines.length >= args.numberOfPosts) {
        return {
          posts: lines.slice(0, args.numberOfPosts),
          count: args.numberOfPosts,
          platform,
          model,
        };
      }
      throw new Error("Failed to parse generated posts");
    }
  },
});
