"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { authComponent } from "./auth";

// Get available voices from ElevenLabs
export const getVoices = action({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify user exists
    const user = await ctx.runQuery(api.users.viewer);
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
        model: "anthropic/claude-haiku-4.5",
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
    useExactText: v.optional(v.boolean()), // Skip AI optimization, use exact input text
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Check feature access and limits
    const user = await ctx.runQuery(api.users.viewer);
    if (!user) {
      throw new Error("User not found. Please refresh the page.");
    }
    if (!user.features.hasVoiceover) {
      throw new Error("Voiceover is not available on your plan. Upgrade to Pro.");
    }

    // Check voiceover limit
    if (user.usage.voiceoversThisMonth >= user.usage.voiceoversLimit) {
      throw new Error(
        `You've reached your monthly voiceover limit (${user.usage.voiceoversLimit}). Upgrade your plan for more.`
      );
    }

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsKey) {
      throw new Error("ElevenLabs API key not configured");
    }

    const style = args.style || "conversational";

    // Use exact text or optimize for voiceover
    let finalText = args.text;
    if (!args.useExactText) {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (openRouterKey) {
        finalText = await optimizeForVoiceover(args.text, style, openRouterKey);
      }
    }

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
          text: finalText,
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

    // Increment usage after successful generation
    await ctx.runMutation(api.users.incrementVoiceoverUsage);

    return {
      url: dataUrl,
      text: finalText,
      voiceId: args.voiceId,
      style,
    };
  },
});

// Get available voices from Cartesia
export const getCartesiaVoices = action({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(api.users.viewer);
    if (!user) {
      throw new Error("User not found. Please refresh the page.");
    }

    const apiKey = process.env.CARTESIA_API_KEY;
    if (!apiKey) {
      throw new Error("Cartesia API key not configured");
    }

    const response = await fetch("https://api.cartesia.ai/voices", {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "Cartesia-Version": "2025-04-16",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid Cartesia API key");
      }
      throw new Error("Failed to fetch Cartesia voices");
    }

    const data = (await response.json()) as {
      data: Array<{
        id: string;
        name: string;
        language: string;
        description?: string;
        gender?: string;
      }>;
    };

    const voices = data.data;

    // Filter to English voices and map to same shape as ElevenLabs
    return voices
      .filter((v) => v.language === "en" || !v.language)
      .slice(0, 50)
      .map((voice) => ({
        id: voice.id,
        name: voice.name,
        previewUrl: "",
        category: "cartesia",
        labels: {
          gender: voice.gender || "",
          description: voice.description || "",
        },
      }));
  },
});

// Generate voiceover via Cartesia - returns audio as base64 data URL
export const generateCartesia = action({
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
    useExactText: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(api.users.viewer);
    if (!user) {
      throw new Error("User not found. Please refresh the page.");
    }
    if (!user.features.hasVoiceover) {
      throw new Error("Voiceover is not available on your plan. Upgrade to Pro.");
    }

    if (user.usage.voiceoversThisMonth >= user.usage.voiceoversLimit) {
      throw new Error(
        `You've reached your monthly voiceover limit (${user.usage.voiceoversLimit}). Upgrade your plan for more.`
      );
    }

    const cartesiaKey = process.env.CARTESIA_API_KEY;
    if (!cartesiaKey) {
      throw new Error("Cartesia API key not configured");
    }

    const style = args.style || "conversational";

    let finalText = args.text;
    if (!args.useExactText) {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (openRouterKey) {
        finalText = await optimizeForVoiceover(args.text, style, openRouterKey);
      }
    }

    const response = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "X-API-Key": cartesiaKey,
        "Cartesia-Version": "2025-04-16",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_id: "sonic-2",
        transcript: finalText,
        voice: {
          mode: "id",
          id: args.voiceId,
        },
        output_format: {
          container: "mp3",
          bit_rate: 128000,
          sample_rate: 44100,
        },
        language: "en",
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid Cartesia API key");
      }
      const errorText = await response.text().catch(() => "");
      throw new Error(`Failed to generate speech via Cartesia: ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:audio/mpeg;base64,${base64}`;

    await ctx.runMutation(api.users.incrementVoiceoverUsage);

    return {
      url: dataUrl,
      text: finalText,
      voiceId: args.voiceId,
      style,
    };
  },
});
