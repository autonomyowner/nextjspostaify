"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const styleEnhancements: Record<string, string> = {
  none: "",
  photorealistic:
    "photorealistic, highly detailed, professional photography, 8k resolution",
  "digital-art": "digital art style, vibrant colors, detailed illustration",
  illustration: "illustration style, artistic, clean lines, stylized",
  cinematic:
    "cinematic lighting, dramatic atmosphere, movie still, professional color grading",
  minimalist: "minimalist design, clean, simple, elegant, white space",
  vibrant: "vibrant colors, bold, eye-catching, high contrast, energetic",
};

function enhancePrompt(prompt: string, style: string): string {
  if (!style || style === "none") return prompt;
  const enhancement = styleEnhancements[style];
  return enhancement ? `${prompt}, ${enhancement}` : prompt;
}

function getImageSize(
  aspectRatio: string
): { width: number; height: number } {
  const dimensions: Record<string, { width: number; height: number }> = {
    "1:1": { width: 1024, height: 1024 },
    "16:9": { width: 1344, height: 768 },
    "9:16": { width: 768, height: 1344 },
    "4:3": { width: 1152, height: 896 },
    "3:4": { width: 896, height: 1152 },
  };
  return dimensions[aspectRatio] || dimensions["1:1"];
}

// Generate image - returns the URL from Fal.ai
export const generate = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
    aspectRatio: v.optional(
      v.union(
        v.literal("1:1"),
        v.literal("16:9"),
        v.literal("9:16"),
        v.literal("4:3"),
        v.literal("3:4")
      )
    ),
    style: v.optional(v.string()),
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
    if (!user.features.hasImageGeneration) {
      throw new Error(
        "Image generation is not available on your plan. Upgrade to Pro."
      );
    }

    const falApiKey = process.env.FAL_API_KEY;
    if (!falApiKey) {
      throw new Error("Fal.ai API key not configured");
    }

    const model = args.model || "fal-ai/flux/schnell";
    const aspectRatio = args.aspectRatio || "1:1";
    const style = args.style || "none";

    const enhancedPrompt = enhancePrompt(args.prompt, style);
    const imageSize = getImageSize(aspectRatio);

    // Generate image using Fal.ai
    const response = await fetch(`https://fal.run/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${falApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        image_size: imageSize,
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid Fal.ai API key");
      }
      if (response.status === 402) {
        throw new Error("Insufficient Fal.ai credits");
      }
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Failed to generate image: ${errorText || response.statusText}`
      );
    }

    const result = (await response.json()) as {
      images?: Array<{ url: string }>;
    };

    if (!result.images || result.images.length === 0) {
      throw new Error("No image was generated");
    }

    const generatedImageUrl = result.images[0].url;

    return {
      url: generatedImageUrl,
      prompt: args.prompt,
      model,
      aspectRatio,
      style,
    };
  },
});
