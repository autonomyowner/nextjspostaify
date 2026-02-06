"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { authComponent } from "./auth";

// Social media format specifications
export const SOCIAL_FORMATS = {
  "instagram-square": {
    name: "Instagram Square",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    platform: "Instagram",
  },
  "instagram-story": {
    name: "Instagram Story",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    platform: "Instagram",
  },
  "instagram-portrait": {
    name: "Instagram Portrait",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    platform: "Instagram",
  },
  "twitter-post": {
    name: "Twitter/X Post",
    width: 1200,
    height: 675,
    aspectRatio: "16:9",
    platform: "Twitter",
  },
  "linkedin-post": {
    name: "LinkedIn Post",
    width: 1200,
    height: 627,
    aspectRatio: "1.91:1",
    platform: "LinkedIn",
  },
  "facebook-post": {
    name: "Facebook Post",
    width: 1200,
    height: 630,
    aspectRatio: "1.9:1",
    platform: "Facebook",
  },
  "facebook-cover": {
    name: "Facebook Cover",
    width: 820,
    height: 312,
    aspectRatio: "2.63:1",
    platform: "Facebook",
  },
  "youtube-thumbnail": {
    name: "YouTube Thumbnail",
    width: 1280,
    height: 720,
    aspectRatio: "16:9",
    platform: "YouTube",
  },
  "tiktok-video": {
    name: "TikTok/Reels",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    platform: "TikTok",
  },
  "pinterest-pin": {
    name: "Pinterest Pin",
    width: 1000,
    height: 1500,
    aspectRatio: "2:3",
    platform: "Pinterest",
  },
} as const;

export type SocialFormat = keyof typeof SOCIAL_FORMATS;

// Image resize result
interface ResizedImage {
  format: SocialFormat;
  name: string;
  platform: string;
  width: number;
  height: number;
  url: string;
}

// Generate resized images for all social media formats using Runware
export const generateAllFormats = action({
  args: {
    imageUrl: v.string(),
    selectedFormats: v.optional(v.array(v.string())), // Specific formats, or all if not provided
  },
  handler: async (ctx, args): Promise<ResizedImage[]> => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const runwareApiKey = process.env.RUNWARE_API_KEY;
    if (!runwareApiKey) {
      throw new Error("RUNWARE_API_KEY not configured. Set it in Convex dashboard.");
    }

    // Validate image URL
    if (!args.imageUrl || !args.imageUrl.startsWith('http')) {
      throw new Error("Invalid image URL. Must be a valid HTTP/HTTPS URL.");
    }

    // Determine which formats to generate
    const formatsToGenerate = args.selectedFormats
      ? (args.selectedFormats as SocialFormat[]).filter(f => f in SOCIAL_FORMATS)
      : (Object.keys(SOCIAL_FORMATS) as SocialFormat[]);

    if (formatsToGenerate.length === 0) {
      throw new Error("No valid formats selected");
    }

    // Generate all formats in parallel using Runware's image-to-image
    const results = await Promise.allSettled(
      formatsToGenerate.map(async (formatKey) => {
        const format = SOCIAL_FORMATS[formatKey];

        // Use Runware's controlNet for image-to-image transformation
        const response = await fetch("https://api.runware.ai/v1", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${runwareApiKey}`,
          },
          body: JSON.stringify([
            {
              taskType: "imageInference",
              taskUUID: crypto.randomUUID(),
              inputImage: args.imageUrl,
              positivePrompt: "same image, high quality, preserve original content",
              model: "runware:101@1", // Flux Dev - better for img2img
              width: format.width,
              height: format.height,
              numberResults: 1,
              outputFormat: "png",
              outputQuality: 95,
              strength: 0.2, // Low strength to preserve original image
              CFGScale: 3,
            },
          ]),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          console.error(`Runware error for ${format.name}:`, errorText);
          throw new Error(`Failed to resize for ${format.name}: ${response.status}`);
        }

        const result = (await response.json()) as {
          data?: Array<{ imageURL?: string }>;
          error?: string;
        };

        if (result.error) {
          console.error(`Runware API error for ${format.name}:`, result.error);
          throw new Error(`API error for ${format.name}: ${result.error}`);
        }

        if (!result.data?.[0]?.imageURL) {
          console.error(`No image in response for ${format.name}:`, result);
          throw new Error(`No image returned for ${format.name}`);
        }

        return {
          format: formatKey,
          name: format.name,
          platform: format.platform,
          width: format.width,
          height: format.height,
          url: result.data[0].imageURL,
        };
      })
    );

    // Filter successful results
    const successfulResults: ResizedImage[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        successfulResults.push(result.value);
      }
    }

    if (successfulResults.length === 0) {
      throw new Error("Failed to generate any resized images");
    }

    return successfulResults;
  },
});

// Get available social media formats
export const getFormats = action({
  args: {},
  handler: async (): Promise<typeof SOCIAL_FORMATS> => {
    return SOCIAL_FORMATS;
  },
});

// Smart crop/resize a single image to specific dimensions
export const resizeImage = action({
  args: {
    imageUrl: v.string(),
    width: v.number(),
    height: v.number(),
  },
  handler: async (ctx, args): Promise<string> => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const runwareApiKey = process.env.RUNWARE_API_KEY;
    if (!runwareApiKey) {
      throw new Error("Image resize service not configured");
    }

    const response = await fetch("https://api.runware.ai/v1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${runwareApiKey}`,
      },
      body: JSON.stringify([
        {
          taskType: "imageInference",
          taskUUID: crypto.randomUUID(),
          inputImage: args.imageUrl,
          positivePrompt: "same image, high quality, sharp details, preserve original content",
          model: "runware:101@1", // Flux Dev - better for img2img
          width: args.width,
          height: args.height,
          numberResults: 1,
          outputFormat: "png",
          outputQuality: 95,
          strength: 0.2, // Low strength to preserve original
          CFGScale: 3,
        },
      ]),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Failed to resize image: ${errorText || response.statusText}`);
    }

    const result = (await response.json()) as {
      data?: Array<{ imageURL?: string }>;
    };

    if (!result.data?.[0]?.imageURL) {
      throw new Error("No resized image was generated");
    }

    return result.data[0].imageURL;
  },
});
