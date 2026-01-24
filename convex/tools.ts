import { v } from "convex/values";
import { action, mutation } from "./_generated/server";

type Platform = "LinkedIn" | "Twitter" | "Instagram" | "TikTok" | "Facebook";

// Platform-specific prompts for tool pages
const PLATFORM_PROMPTS: Record<Platform, string> = {
  LinkedIn: `Create a professional LinkedIn post. Structure:
- Hook (first line that stops the scroll)
- 3-5 key insights from the video (use line breaks between points)
- Personal reflection or call-to-action
- 3-5 relevant hashtags at the end
Keep it 150-250 words. Professional but conversational tone.`,

  Twitter: `Create a Twitter/X thread (5-7 tweets). Structure:
- Tweet 1: Hook with the main insight (under 280 chars)
- Tweets 2-5: Key points from the video, one per tweet
- Final tweet: CTA or summary
Number each tweet. Make each standalone but connected.`,

  Instagram: `Create an Instagram caption. Structure:
- Attention-grabbing first line
- 3-4 key takeaways with emoji bullets
- Personal touch or story element
- Clear CTA (save this, share with a friend, etc.)
- 5-10 relevant hashtags at the end
Keep it engaging and visually scannable.`,

  TikTok: `Create a TikTok script for a 30-60 second video. Structure:
[HOOK - 0-3 sec] - Pattern interrupt, make them stop scrolling
[SETUP - 3-10 sec] - Quick context
[CONTENT - 10-45 sec] - 3 key points, delivered punchy and fast
[CTA - 45-60 sec] - Follow for more, save this, etc.
Write it conversational, like talking to a friend.`,

  Facebook: `Create a Facebook post. Structure:
- Question or relatable opening statement
- Story or context from the video
- 3 key takeaways
- Discussion prompt to encourage comments
Keep it 100-200 words. Warm and conversational.`,
};

// Extract YouTube video ID from URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Fetch video info from YouTube (title, description)
async function fetchVideoInfo(videoId: string): Promise<{ title: string; description: string } | null> {
  try {
    // Use oEmbed API (no API key needed)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) return null;

    const data = await response.json() as { title: string; author_name: string };

    return {
      title: data.title,
      description: `Video by ${data.author_name}`,
    };
  } catch {
    return null;
  }
}

// Fetch YouTube transcript using a public service
async function fetchTranscript(videoId: string): Promise<string | null> {
  try {
    // Try using youtube-transcript-api via a serverless function or direct fetch
    // For now, we'll use the video info and generate from title
    // In production, you'd use a transcript extraction service

    // Attempt to fetch from a transcript service (example)
    const transcriptUrl = `https://yt-transcript-api.vercel.app/api/transcript?videoId=${videoId}`;
    const response = await fetch(transcriptUrl, {
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json() as Array<{ text: string }>;
      if (Array.isArray(data)) {
        return data.map(item => item.text).join(' ').slice(0, 8000);
      }
    }

    return null;
  } catch {
    return null;
  }
}

// Generate content from YouTube video (no auth required)
export const generateFromYouTube = action({
  args: {
    youtubeUrl: v.string(),
    platform: v.union(
      v.literal("LinkedIn"),
      v.literal("Twitter"),
      v.literal("Instagram"),
      v.literal("TikTok"),
      v.literal("Facebook")
    ),
  },
  handler: async (ctx, args) => {
    const videoId = extractVideoId(args.youtubeUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL. Please enter a valid YouTube video link.");
    }

    // Get video info
    const videoInfo = await fetchVideoInfo(videoId);
    if (!videoInfo) {
      throw new Error("Could not fetch video information. Please check the URL and try again.");
    }

    // Try to get transcript
    const transcript = await fetchTranscript(videoId);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("AI service not configured");
    }

    const contentSource = transcript
      ? `Video Title: "${videoInfo.title}"\n\nTranscript:\n${transcript}`
      : `Video Title: "${videoInfo.title}"\nChannel: ${videoInfo.description}\n\nNote: Transcript unavailable - create content based on the title and likely content of this video.`;

    const systemPrompt = `You are an expert social media content creator. Your job is to transform YouTube videos into engaging social media posts.

${PLATFORM_PROMPTS[args.platform]}

IMPORTANT RULES:
1. Extract the most valuable, shareable insights
2. Write in a conversational, engaging tone
3. Make it platform-appropriate
4. Include a clear call-to-action
5. Do NOT mention this was converted from a video
6. Write as if YOU are sharing these insights
7. Output ONLY the post content - no explanations or meta text`;

    const userPrompt = `Create a ${args.platform} post from this YouTube video:\n\n${contentSource}`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://postaify.com",
          "X-Title": "POSTAIFY Tools",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-haiku",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 1500,
          temperature: 0.8,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", error);
      throw new Error("Failed to generate content. Please try again.");
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated. Please try again.");
    }

    return {
      content: content.trim(),
      videoTitle: videoInfo.title,
      platform: args.platform,
      hasTranscript: !!transcript,
    };
  },
});

// Generate YouTube video summary (no auth required)
export const generateYouTubeSummary = action({
  args: {
    youtubeUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const videoId = extractVideoId(args.youtubeUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL. Please enter a valid YouTube video link.");
    }

    const videoInfo = await fetchVideoInfo(videoId);
    if (!videoInfo) {
      throw new Error("Could not fetch video information. Please check the URL and try again.");
    }

    const transcript = await fetchTranscript(videoId);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("AI service not configured");
    }

    const contentSource = transcript
      ? `Video Title: "${videoInfo.title}"\n\nTranscript:\n${transcript}`
      : `Video Title: "${videoInfo.title}"\nChannel: ${videoInfo.description}\n\nNote: Transcript unavailable - create a summary based on the title and likely content of this video.`;

    const systemPrompt = `You are an expert at summarizing YouTube videos. Create a clear, comprehensive summary.

Structure your summary:
1. **Key Takeaways** (3-5 bullet points)
2. **Detailed Summary** (2-3 paragraphs)
3. **Who This Is For** (1 sentence)

Keep it under 500 words. Be concise but informative.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://postaify.com",
          "X-Title": "POSTAIFY YouTube Summary",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-haiku",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Summarize this YouTube video:\n\n${contentSource}` },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", error);
      throw new Error("Failed to generate summary. Please try again.");
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const summary = data.choices[0]?.message?.content;
    if (!summary) {
      throw new Error("No summary generated. Please try again.");
    }

    return {
      summary: summary.trim(),
      videoTitle: videoInfo.title,
      hasTranscript: !!transcript,
    };
  },
});

// Save email capture from tool page
export const captureToolEmail = mutation({
  args: {
    email: v.string(),
    toolSlug: v.string(),
    youtubeUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email address");
    }

    // Check if email already captured from this tool
    const existing = await ctx.db
      .query("emailCaptures")
      .filter((q) => q.eq(q.field("email"), args.email.toLowerCase()))
      .first();

    if (existing) {
      // Update source if new tool
      const sources = existing.source?.split(", ") || [];
      if (!sources.includes(args.toolSlug)) {
        await ctx.db.patch(existing._id, {
          source: [...sources, args.toolSlug].join(", "),
        });
      }
      return { success: true, isNew: false };
    }

    // Create new capture
    await ctx.db.insert("emailCaptures", {
      email: args.email.toLowerCase(),
      source: `tool:${args.toolSlug}`,
      capturedAt: Date.now(),
      marketingConsent: true, // Implied by using the tool
    });

    return { success: true, isNew: true };
  },
});
