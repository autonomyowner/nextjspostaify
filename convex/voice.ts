"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Get available voices from ElevenLabs
export const getVoices = action({
  args: {
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

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("ElevenLabs API key not configured");
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid ElevenLabs API key");
      }
      throw new Error("Failed to fetch voices");
    }

    const data = (await response.json()) as {
      voices: Array<{
        voice_id: string;
        name: string;
        preview_url: string;
        category: string;
        labels: {
          accent?: string;
          age?: string;
          gender?: string;
          description?: string;
          use_case?: string;
        };
      }>;
    };

    return data.voices.map((voice) => ({
      id: voice.voice_id,
      name: voice.name,
      previewUrl: voice.preview_url,
      category: voice.category,
      labels: voice.labels,
    }));
  },
});

// Helper function to optimize text for voiceover
async function optimizeForVoiceover(
  text: string,
  style: "conversational" | "professional" | "energetic" | "calm",
  apiKey: string
): Promise<string> {
  const styleInstructions: Record<string, string> = {
    conversational:
      "Natural, like talking to a friend. Casual pacing with natural pauses.",
    professional:
      "Clear, authoritative, and polished. Suitable for business content.",
    energetic:
      "Upbeat, enthusiastic, and dynamic. Great for motivational content.",
    calm: "Soothing, measured, and relaxed. Perfect for educational or meditative content.",
  };

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: [
          {
            role: "system",
            content: `Transform text into a voiceover script optimized for TTS.

Style: ${styleInstructions[style]}

Rules:
1. Remove hashtags, @mentions, emojis, URLs
2. Use proper punctuation for pacing
3. Break long sentences
4. Write numbers as words when appropriate
5. Keep it concise (30 seconds to 2 minutes)

Output ONLY the voiceover script.`,
          },
          {
            role: "user",
            content: `Transform this into a ${style} voiceover script:\n\n${text}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    return text;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content || text;
}

// Generate voiceover - returns audio as base64 data URL
export const generate = action({
  args: {
    text: v.string(),
    voiceId: v.string(),
    style: v.optional(
      v.union(
        v.literal("conversational"),
        v.literal("professional"),
        v.literal("energetic"),
        v.literal("calm")
      )
    ),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    // Try Convex auth first, fall back to clerkId
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      throw new Error("Not authenticated");
    }

    // Check feature access
    const user = await ctx.runQuery(api.users.getByClerkId, { clerkId: userClerkId });
    if (!user) {
      throw new Error("User not found. Please refresh the page.");
    }
    if (!user.features.hasVoiceover) {
      throw new Error("Voiceover is not available on your plan. Upgrade to Pro.");
    }

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsKey) {
      throw new Error("ElevenLabs API key not configured");
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      throw new Error("OpenRouter API key not configured");
    }

    const style = args.style || "conversational";

    // Optimize text for voiceover
    const optimizedText = await optimizeForVoiceover(
      args.text,
      style,
      openRouterKey
    );

    // Generate speech
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${args.voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: optimizedText,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid ElevenLabs API key");
      }
      if (response.status === 422) {
        throw new Error("Text is too long. Max 5000 characters.");
      }
      throw new Error("Failed to generate speech");
    }

    // Convert to base64 data URL for immediate use
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:audio/mpeg;base64,${base64}`;

    return {
      url: dataUrl,
      text: optimizedText,
      voiceId: args.voiceId,
      style,
    };
  },
});
