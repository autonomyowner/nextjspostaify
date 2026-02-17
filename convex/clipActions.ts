"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { authComponent } from "./auth";
import { getPlanLimits, Plan } from "./lib/planLimits";
import {
  generateClipHTML,
  estimateDuration,
  SceneData,
  ClipColors,
  ClipTheme,
} from "./lib/clipTemplates";

// ============================================================
// AI SCRIPT PARSER
// Parse user's raw script into structured scenes
// ============================================================

const SCENE_TYPES = [
  "hook",
  "brand",
  "features",
  "demo",
  "transformation",
  "stats",
  "comparison",
  "cta",
  "montage",
] as const;

async function parseScriptWithAI(
  script: string,
  maxScenes: number,
  apiKey: string,
  autoSplit: boolean = false
): Promise<SceneData[]> {
  const splitInstruction = autoSplit
    ? `- The user has NOT separated scenes manually. You MUST intelligently split the text into logical scenes (${maxScenes} max). Identify natural breaks: opening hooks, brand mentions, feature lists, stats, comparisons, and closing CTAs. Create the best possible scene breakdown from the raw text.`
    : `- If the script uses "---" as separators, treat each section as a scene. If no separators, split intelligently.`;

  const systemPrompt = `You are a video script parser for motion graphic clips. Your job is to analyze a user's script and split it into structured scenes.

Available scene types:
- "hook": Bold opening statement/question. Fields: headline, subheadline (optional)
- "brand": Brand name + tagline reveal. Fields: brandName, tagline (optional)
- "features": List of features/benefits (3-5 items). Fields: headline (optional), features (array of strings)
- "demo": Step-by-step process/how-it-works. Fields: demoTitle or headline, demoSteps (array of strings)
- "transformation": Before/after comparison. Fields: headline (optional), before, after, beforeLabel (optional), afterLabel (optional)
- "stats": Key numbers/metrics. Fields: headline (optional), stats (array of {value, label})
- "comparison": Problems vs solutions columns. Fields: headline (optional), problems (array), solutions (array)
- "cta": Call to action ending. Fields: headline, subheadline (optional), ctaText (button text), url (optional)

Rules:
- Maximum ${maxScenes} scenes
- Each scene should be 2-5 seconds of content
- Keep text SHORT and punchy (headlines under 10 words, features under 8 words each)
- If text is too long, shorten it while keeping the meaning
- Auto-detect the best scene type for each section
${splitInstruction}
- Always try to include a CTA as the last scene
- Return ONLY valid JSON array, no other text

Example output:
[
  {"type":"hook","headline":"Still spending 8 hours on content?","subheadline":"There's a better way"},
  {"type":"brand","brandName":"Postaify","tagline":"AI-Powered Content Automation"},
  {"type":"features","features":["Generate posts in seconds","Schedule everywhere","AI voiceovers built-in"]},
  {"type":"cta","headline":"Start creating smarter","ctaText":"Try Free","url":"postaify.com"}
]`;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "https://postaify.com",
        "X-Title": "POSTAIFY",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Parse this script into scenes (max ${maxScenes}):\n\n${script}`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI parsing failed: ${error}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  const content = data.choices[0]?.message?.content || "[]";

  // Extract JSON array from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse script - AI returned invalid format");
  }

  const scenes: SceneData[] = JSON.parse(jsonMatch[0]);

  // Validate scene types
  const validScenes = scenes
    .filter((s) => SCENE_TYPES.includes(s.type as (typeof SCENE_TYPES)[number]))
    .slice(0, maxScenes);

  if (validScenes.length === 0) {
    throw new Error("Failed to parse script into valid scenes");
  }

  return validScenes;
}

// ============================================================
// MAIN GENERATE ACTION
// ============================================================

export const generate = action({
  args: {
    script: v.string(),
    colors: v.object({
      primary: v.string(),
      secondary: v.string(),
      accent: v.string(),
    }),
    title: v.optional(v.string()),
    autoSplit: v.optional(v.boolean()),
    brandId: v.optional(v.id("brands")),
    theme: v.optional(v.union(v.literal("classic"), v.literal("cinematic"))),
  },
  handler: async (ctx, args) => {
    // Auth check
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const user = await ctx.runQuery(api.users.viewer);
    if (!user) throw new Error("User not found");

    // Plan limits
    const plan = (user.plan || "FREE") as Plan;
    const limits = getPlanLimits(plan);
    const clipsUsed = (user as any).usage?.clipsThisMonth ?? (user as any).clipsThisMonth ?? 0;

    if (clipsUsed >= limits.maxClipsPerMonth) {
      throw new Error(
        `LIMIT_REACHED: You've used all ${limits.maxClipsPerMonth} clips this month. Upgrade for more.`
      );
    }

    // Validate script
    const script = args.script.trim();
    if (script.length < 10) {
      throw new Error("Script is too short. Please add more content.");
    }
    if (script.length > 5000) {
      throw new Error("Script is too long. Maximum 5000 characters.");
    }

    // Validate colors (hex format)
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (
      !hexRegex.test(args.colors.primary) ||
      !hexRegex.test(args.colors.secondary) ||
      !hexRegex.test(args.colors.accent)
    ) {
      throw new Error("Invalid color format. Use hex colors like #FF5500.");
    }

    // Parse script with AI
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OpenRouter API key not configured");

    const theme: ClipTheme = args.theme || "classic";
    const maxScenes = theme === "cinematic"
      ? Math.max(limits.maxScenesPerClip - 1, 1) // reserve 1 slot for montage
      : limits.maxScenesPerClip;

    const scenes = await parseScriptWithAI(
      script,
      maxScenes,
      apiKey,
      args.autoSplit ?? false
    );

    // Cinematic: auto-generate montage scene from parsed content
    let allScenes: SceneData[] = scenes;
    if (theme === "cinematic") {
      const montageItems: string[] = [];
      const hookScene = scenes.find((s) => s.type === "hook");
      if (hookScene?.headline) {
        montageItems.push(hookScene.headline.split(" ").slice(0, 4).join(" "));
      }
      const brandScene = scenes.find((s) => s.type === "brand");
      if (brandScene?.brandName) {
        montageItems.push(brandScene.brandName);
      }
      const featScene = scenes.find((s) => s.type === "features");
      if (featScene?.features?.[0]) {
        montageItems.push(featScene.features[0]);
      }
      const ctaScene = scenes.find((s) => s.type === "cta");
      if (ctaScene?.ctaText) {
        montageItems.push(ctaScene.ctaText);
      }
      // Ensure at least 3 items
      if (montageItems.length < 3) {
        for (const s of scenes) {
          if (montageItems.length >= 3) break;
          const text = s.headline || s.demoTitle || s.brandName;
          if (text && !montageItems.includes(text)) {
            montageItems.push(text.split(" ").slice(0, 5).join(" "));
          }
        }
      }
      if (montageItems.length >= 2) {
        allScenes = [
          { type: "montage", montageItems: montageItems.slice(0, 5) },
          ...scenes,
        ];
      }
    }

    // Generate HTML
    const colors: ClipColors = args.colors;
    const title =
      args.title || `Clip - ${new Date().toLocaleDateString()}`;

    const htmlContent = generateClipHTML({
      title,
      scenes: allScenes,
      colors,
      brandName: allScenes.find((s) => s.type === "brand")?.brandName,
      theme,
    });

    const duration = estimateDuration(allScenes);

    // Save to DB
    const clipId: string = await ctx.runMutation((api as any).clips.create, {
      title,
      script,
      scenes: allScenes,
      colors,
      htmlContent,
      duration,
      scenesCount: allScenes.length,
      brandId: args.brandId,
      theme: theme !== "classic" ? theme : undefined,
    });

    return {
      clipId,
      scenesCount: allScenes.length,
      duration,
      htmlContent,
      scenes: allScenes.map((s) => ({
        type: s.type,
        headline: s.headline || s.brandName || s.demoTitle || (s.type === "montage" ? "Montage Intro" : ""),
      })),
    };
  },
});

// ============================================================
// EXPORT TO MP4 (Shotstack)
// PRO/BUSINESS only
// ============================================================

export const exportMp4 = action({
  args: {
    clipId: v.id("clips"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const user = await ctx.runQuery(api.users.viewer);
    if (!user) throw new Error("User not found");

    const plan = (user.plan || "FREE") as Plan;
    const limits = getPlanLimits(plan);

    if (!limits.hasClipMp4Export) {
      throw new Error(
        "MP4 export requires a PRO plan. Upgrade to download videos."
      );
    }

    const clip = await ctx.runQuery((api as any).clips.getById, { id: args.clipId });
    if (!clip) throw new Error("Clip not found");

    const shotstackKey = process.env.SHOTSTACK_API_KEY;
    if (!shotstackKey) {
      throw new Error("Video export is not configured yet. Coming soon!");
    }

    // Update status to rendering
    await ctx.runMutation((api as any).clips.updateRenderStatus, {
      clipId: args.clipId,
      renderStatus: "rendering",
    });

    try {
      // POST to Shotstack Edit API
      const response = await fetch(
        "https://api.shotstack.io/edit/stage/render",
        {
          method: "POST",
          headers: {
            "x-api-key": shotstackKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timeline: {
              tracks: [
                {
                  clips: [
                    {
                      asset: {
                        type: "html",
                        html: clip.htmlContent,
                        width: 1080,
                        height: 1920,
                      },
                      start: 0,
                      length: clip.duration,
                    },
                  ],
                },
              ],
            },
            output: {
              format: "mp4",
              resolution: "1080",
              aspectRatio: "9:16",
              fps: 30,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Shotstack error: ${error}`);
      }

      const data = (await response.json()) as {
        response: { id: string };
      };

      // Save render job ID
      await ctx.runMutation((api as any).clips.updateRenderStatus, {
        clipId: args.clipId,
        renderStatus: "rendering",
        renderJobId: data.response.id,
      });

      return { renderJobId: data.response.id };
    } catch (e: unknown) {
      await ctx.runMutation((api as any).clips.updateRenderStatus, {
        clipId: args.clipId,
        renderStatus: "failed",
      });
      throw e;
    }
  },
});

// ============================================================
// CHECK RENDER STATUS (Shotstack polling)
// ============================================================

export const checkRenderStatus = action({
  args: {
    clipId: v.id("clips"),
    renderJobId: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const shotstackKey = process.env.SHOTSTACK_API_KEY;
    if (!shotstackKey) throw new Error("Export not configured");

    const response = await fetch(
      `https://api.shotstack.io/edit/stage/render/${args.renderJobId}`,
      {
        headers: { "x-api-key": shotstackKey },
      }
    );

    if (!response.ok) throw new Error("Failed to check render status");

    const data = (await response.json()) as {
      response: { status: string; url?: string };
    };

    const status = data.response.status;

    if (status === "done" && data.response.url) {
      await ctx.runMutation((api as any).clips.updateRenderStatus, {
        clipId: args.clipId,
        renderStatus: "ready",
        mp4Url: data.response.url,
      });
      return { status: "ready", url: data.response.url };
    }

    if (status === "failed") {
      await ctx.runMutation((api as any).clips.updateRenderStatus, {
        clipId: args.clipId,
        renderStatus: "failed",
      });
      return { status: "failed" };
    }

    return { status: "rendering" };
  },
});
