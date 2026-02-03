"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Style-specific enhancements
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

// Quality keywords to add for professional results
const QUALITY_BOOSTERS = [
  "high quality",
  "detailed",
  "professional",
  "sharp focus",
  "well-composed",
];

// Lighting enhancements
const LIGHTING_TERMS = [
  "beautiful lighting",
  "soft natural light",
  "golden hour lighting",
  "studio lighting",
  "dramatic lighting",
];

// Composition terms
const COMPOSITION_TERMS = [
  "rule of thirds",
  "balanced composition",
  "centered subject",
  "dynamic angle",
];

// Check if prompt already has quality/technical terms
function hasQualityTerms(prompt: string): boolean {
  const qualityIndicators = [
    "detailed", "quality", "professional", "8k", "4k", "hd", "realistic",
    "lighting", "composition", "sharp", "vivid", "stunning", "beautiful",
    "masterpiece", "award", "artistic", "render", "resolution"
  ];
  const lowerPrompt = prompt.toLowerCase();
  return qualityIndicators.some(term => lowerPrompt.includes(term));
}

// Detect subject type for context-aware enhancement
function detectSubjectType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  if (/person|people|man|woman|portrait|face|human/.test(lowerPrompt)) {
    return "portrait";
  }
  if (/landscape|mountain|ocean|forest|nature|sky|sunset/.test(lowerPrompt)) {
    return "landscape";
  }
  if (/animal|bird|cat|dog|wildlife/.test(lowerPrompt)) {
    return "animal";
  }
  if (/food|dish|meal|cuisine/.test(lowerPrompt)) {
    return "food";
  }
  if (/product|item|object|thing/.test(lowerPrompt)) {
    return "product";
  }
  if (/building|architecture|city|street|urban/.test(lowerPrompt)) {
    return "architecture";
  }
  return "general";
}

// Get subject-specific enhancements
function getSubjectEnhancements(subjectType: string): string {
  const enhancements: Record<string, string> = {
    portrait: "expressive eyes, natural skin texture, professional portrait photography",
    landscape: "epic scale, atmospheric perspective, vibrant colors, scenic view",
    animal: "sharp details, natural habitat, wildlife photography style, vivid fur/feathers",
    food: "appetizing presentation, food photography, shallow depth of field, garnished",
    product: "clean background, commercial photography, studio setup, product showcase",
    architecture: "architectural photography, dramatic perspective, structural details",
    general: "well-lit, sharp details, professional quality"
  };
  return enhancements[subjectType] || enhancements.general;
}

// Main prompt enhancer - transforms simple prompts into professional ones
function autoEnhancePrompt(prompt: string): string {
  // If prompt is already detailed (>100 chars) or has quality terms, minimal enhancement
  if (prompt.length > 100 || hasQualityTerms(prompt)) {
    // Just add basic quality boost if missing
    if (!hasQualityTerms(prompt)) {
      return `${prompt}, high quality, detailed`;
    }
    return prompt;
  }

  // Detect what the user is trying to create
  const subjectType = detectSubjectType(prompt);
  const subjectEnhancement = getSubjectEnhancements(subjectType);

  // Pick random quality and lighting terms for variety
  const quality = QUALITY_BOOSTERS[Math.floor(Math.random() * QUALITY_BOOSTERS.length)];
  const lighting = LIGHTING_TERMS[Math.floor(Math.random() * LIGHTING_TERMS.length)];

  // Build enhanced prompt
  const enhancedPrompt = `${prompt}, ${subjectEnhancement}, ${quality}, ${lighting}`;

  return enhancedPrompt;
}

// Apply style enhancement on top of auto-enhancement
function enhancePrompt(prompt: string, style: string): string {
  // First auto-enhance the prompt
  const autoEnhanced = autoEnhancePrompt(prompt);

  // Then add style-specific terms if selected
  if (!style || style === "none") return autoEnhanced;
  const styleBoost = styleEnhancements[style];
  return styleBoost ? `${autoEnhanced}, ${styleBoost}` : autoEnhanced;
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

// Ideogram uses simple aspect ratio strings like "1:1"
function getIdeogramAspectRatio(aspectRatio: string): string {
  // Ideogram accepts: "1:1", "16:9", "9:16", "4:3", "3:4", etc.
  return aspectRatio || "1:1";
}

// Check if model is Ideogram
function isIdeogramModel(model: string): boolean {
  return model.includes("ideogram");
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

    // Build request body based on model type
    let requestBody: Record<string, unknown>;

    if (isIdeogramModel(model)) {
      // Ideogram uses different parameters
      requestBody = {
        prompt: enhancedPrompt,
        aspect_ratio: getIdeogramAspectRatio(aspectRatio),
        expand_prompt: true,
        style: "auto",
      };
    } else {
      // Flux and other models
      requestBody = {
        prompt: enhancedPrompt,
        image_size: imageSize,
        num_images: 1,
        enable_safety_checker: true,
      };
    }

    // Generate image using Fal.ai
    const response = await fetch(`https://fal.run/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${falApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
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
