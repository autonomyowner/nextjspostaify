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
import { createHmac } from "crypto";

// ============================================================
// BUILT-IN CARTESIA VOICES (curated for clips)
// ============================================================

const CLIP_VOICES = [
  { id: "794f9389-aac1-45b6-b726-9d9369183238", name: "Confident Narrator", gender: "male" },
  { id: "a0e99571-b01d-4dab-983d-db22d8e3376b", name: "Energetic Host", gender: "female" },
  { id: "638efaaa-4d0c-442e-b701-3fae16aad012", name: "Calm Explainer", gender: "male" },
  { id: "c2ac25f9-ecc4-4f56-9095-651354df60c0", name: "Upbeat Creator", gender: "female" },
] as const;

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
  "narrative",
  "quote",
  "chapter",
  "reveal",
  "tip",
  "listicle",
] as const;

// Category → recommended scene types mapping
const CATEGORY_SCENE_HINTS: Record<string, string[]> = {
  saas: ["hook", "brand", "features", "demo", "transformation", "stats", "comparison", "cta"],
  storytelling: ["chapter", "narrative", "quote", "reveal", "cta"],
  educational: ["hook", "tip", "listicle", "demo", "cta"],
  ecommerce: ["hook", "features", "transformation", "stats", "cta"],
  personal: ["hook", "quote", "tip", "narrative", "cta"],
};

async function parseScriptWithAI(
  script: string,
  maxScenes: number,
  apiKey: string,
  autoSplit: boolean = false,
  category: string = "saas"
): Promise<SceneData[]> {
  const splitInstruction = autoSplit
    ? `- The user has NOT separated scenes manually. You MUST intelligently split the text into logical scenes (${maxScenes} max). Identify natural breaks: opening hooks, brand mentions, feature lists, stats, comparisons, and closing CTAs. Create the best possible scene breakdown from the raw text.`
    : `- If the script uses "---" as separators, treat each section as a scene. If no separators, split intelligently.`;

  // Build category-specific guidance
  const recommendedTypes = CATEGORY_SCENE_HINTS[category] || CATEGORY_SCENE_HINTS.saas;
  const categoryHint = `- PREFERRED scene types for this "${category}" clip: ${recommendedTypes.join(", ")}. Strongly favor these types unless the content clearly demands otherwise.`;

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
- "narrative": Story paragraph with mood. Fields: text, mood (optional: "hopeful"|"dark"|"neutral"|"inspiring"|"tense")
- "quote": Quote with attribution. Fields: quote, author (optional), source (optional)
- "chapter": Section/chapter marker. Fields: chapterNumber (number), chapterTitle
- "reveal": Dramatic single-word/phrase reveal. Fields: revealText, subtext (optional)
- "tip": Educational tip card. Fields: tipNumber (number), tipTitle, tipBody (optional)
- "listicle": Numbered list of items. Fields: headline (optional), items (array of strings)

Rules:
- Maximum ${maxScenes} scenes
- Each scene should be 2-5 seconds of content
- Keep text SHORT and punchy (headlines under 10 words, features under 8 words each)
- If text is too long, shorten it while keeping the meaning
- Auto-detect the best scene type for each section
${splitInstruction}
${categoryHint}
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
        model: "anthropic/claude-haiku-4.5",
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
// NARRATION BUILDER
// Convert parsed scenes into a TTS-optimized voiceover script
// ============================================================

// Estimate per-scene duration in ms (mirrors estimateDuration logic)
function getSceneDurationMs(scene: SceneData): number {
  switch (scene.type) {
    case "montage":
      return ((scene.montageItems?.length || 3) * 1100) + 500 + 600;
    case "hook":
      return 3500 + 600;
    case "brand":
      return 3200 + 600;
    case "features":
      return 2000 + (scene.features?.length || 0) * 520 + 600;
    case "demo":
      return 2000 + (scene.demoSteps?.length || 0) * 800 + 600;
    case "transformation":
      return 4500 + 600;
    case "stats":
      return 2500 + (scene.stats?.length || 0) * 300 + 600;
    case "comparison":
      return 2500 + ((scene.problems?.length || 0) + (scene.solutions?.length || 0)) * 150 + 600;
    case "cta":
      return 4500 + 600;
    case "narrative":
      return 4200 + 600;
    case "quote":
      return 4000 + 600;
    case "chapter":
      return 3600 + 600;
    case "reveal":
      return 4200 + 600;
    case "tip":
      return 4200 + 600;
    case "listicle":
      return 2200 + ((scene.items?.length || scene.features?.length || 0) * 700) + 600;
    default:
      return 3500 + 600;
  }
}

// Compute pause marker based on scene duration
function getPauseMarker(durationMs: number): string {
  if (durationMs < 3200) return "";
  if (durationMs < 4000) return "...";
  if (durationMs < 5000) return "... ...";
  return "... ... ...";
}

function buildNarrationFromScenes(scenes: SceneData[]): { text: string; sceneTextLengths: number[] } {
  const segments: string[] = [];
  const sceneTextLengths: number[] = [];

  for (const scene of scenes) {
    const parts: string[] = [];

    switch (scene.type) {
      case "hook":
        if (scene.headline) parts.push(scene.headline);
        if (scene.subheadline) parts.push(scene.subheadline);
        break;
      case "brand":
        if (scene.brandName) parts.push(scene.brandName);
        if (scene.tagline) parts.push(scene.tagline);
        break;
      case "features":
        if (scene.headline) parts.push(scene.headline);
        if (scene.features) {
          parts.push(scene.features.join(". ") + ".");
        }
        break;
      case "demo":
        parts.push(scene.demoTitle || scene.headline || "Here's how it works.");
        if (scene.demoSteps) {
          parts.push(scene.demoSteps.join(". ") + ".");
        }
        break;
      case "transformation":
        if (scene.headline) parts.push(scene.headline);
        if (scene.before && scene.after) {
          parts.push(`From ${scene.before}, to ${scene.after}.`);
        }
        break;
      case "stats":
        if (scene.headline) parts.push(scene.headline);
        if (scene.stats) {
          parts.push(
            scene.stats.map((s) => `${s.value} ${s.label}`).join(". ") + "."
          );
        }
        break;
      case "comparison":
        if (scene.headline) parts.push(scene.headline);
        break;
      case "cta":
        if (scene.headline) parts.push(scene.headline);
        if (scene.subheadline) parts.push(scene.subheadline);
        if (scene.ctaText) parts.push(scene.ctaText);
        if (scene.url) parts.push(scene.url);
        break;
      case "narrative":
        if (scene.text) parts.push(scene.text);
        else if (scene.headline) parts.push(scene.headline);
        break;
      case "quote":
        if (scene.quote) parts.push(scene.quote);
        if (scene.author) parts.push(`by ${scene.author}`);
        break;
      case "chapter":
        if (scene.chapterTitle) parts.push(scene.chapterTitle);
        else if (scene.headline) parts.push(scene.headline);
        break;
      case "reveal":
        if (scene.revealText) parts.push(scene.revealText);
        if (scene.subtext) parts.push(scene.subtext);
        break;
      case "tip":
        if (scene.tipTitle) parts.push(scene.tipTitle);
        if (scene.tipBody) parts.push(scene.tipBody);
        break;
      case "listicle":
        if (scene.headline) parts.push(scene.headline);
        if (scene.items) {
          parts.push(scene.items.join(". ") + ".");
        }
        break;
      case "montage":
        // Montage is visual-only, skip narration
        break;
    }

    const text = parts.filter(Boolean).join(" ");
    // Track text length for every scene (0 for montage/empty)
    sceneTextLengths.push(text.length);
    if (text) segments.push(text);
  }

  // Join segments with paragraph breaks and pause markers proportional to scene duration
  const result: string[] = [];
  let segIdx = 0;
  for (let i = 0; i < segments.length; i++) {
    result.push(segments[i]);
    // Find the matching scene index for pause markers
    while (segIdx < scenes.length && sceneTextLengths[segIdx] === 0) segIdx++;
    if (i < segments.length - 1) {
      const sceneDuration = getSceneDurationMs(scenes[segIdx] || scenes[i]);
      const pause = getPauseMarker(sceneDuration);
      // Always add paragraph break for TTS pacing
      result.push("\n\n");
      if (pause) result.push(pause + "\n\n");
    }
    segIdx++;
  }

  return { text: result.join(""), sceneTextLengths };
}

// ============================================================
// CARTESIA TTS
// Generate voiceover audio from narration text
// ============================================================

async function generateCartesiaTTS(
  text: string,
  voiceId: string,
  apiKey: string,
  style: "conversational" | "professional" | "energetic" | "calm" = "conversational",
  openRouterKey?: string
): Promise<{ url: string; finalText: string; durationMs: number }> {
  // Optimize text for voiceover if OpenRouter key is available
  let finalText = text;
  if (openRouterKey) {
    const styleInstructions: Record<string, string> = {
      conversational:
        "Natural, like talking to a friend. Casual pacing with natural pauses.",
      professional:
        "Clear, authoritative, and polished. Suitable for business content.",
      energetic:
        "Upbeat, enthusiastic, and dynamic. Great for motivational content.",
      calm: "Soothing, measured, and relaxed. Perfect for educational content.",
    };

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "anthropic/claude-haiku-4.5",
          messages: [
            {
              role: "system",
              content: `Transform text into a voiceover script optimized for TTS on a short-form video (TikTok/Reels).

Style: ${styleInstructions[style]}

Rules:
1. Remove hashtags, @mentions, emojis, URLs
2. Use proper punctuation for pacing
3. Break long sentences
4. Write numbers as words when appropriate
5. Keep it concise - match the pace of a 15-30 second video
6. Make it sound natural when spoken aloud
7. IMPORTANT: Preserve all paragraph breaks (\\n\\n) and ellipsis pauses (...) — these sync the voiceover to visual scene transitions. Do NOT remove or merge them.
8. Add brief pauses via commas where needed within segments

Output ONLY the voiceover script.`,
            },
            {
              role: "user",
              content: `Transform this into a ${style} voiceover script:\n\n${text}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      }
    );

    if (response.ok) {
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      finalText = data.choices?.[0]?.message?.content || text;
    }
  }

  // Call Cartesia TTS
  const response = await fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Cartesia-Version": "2025-04-16",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: "sonic-2",
      transcript: finalText,
      voice: {
        mode: "id",
        id: voiceId,
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
    throw new Error(`Cartesia TTS failed: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUrl = `data:audio/mpeg;base64,${base64}`;

  // Estimate duration from MP3 byte length (128kbps CBR)
  const durationMs = Math.round((arrayBuffer.byteLength * 8 / 128000) * 1000);

  return { url: dataUrl, finalText, durationMs };
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
      background: v.optional(v.string()),
    }),
    title: v.optional(v.string()),
    autoSplit: v.optional(v.boolean()),
    brandId: v.optional(v.id("brands")),
    theme: v.optional(v.union(v.literal("classic"), v.literal("cinematic"))),
    category: v.optional(v.union(
      v.literal("saas"),
      v.literal("storytelling"),
      v.literal("educational"),
      v.literal("ecommerce"),
      v.literal("personal"),
    )),
    voiceover: v.optional(v.object({
      enabled: v.boolean(),
      voiceId: v.optional(v.string()),
      style: v.optional(v.union(
        v.literal("conversational"),
        v.literal("professional"),
        v.literal("energetic"),
        v.literal("calm")
      )),
    })),
  },
  handler: async (ctx, args) => {
    console.log("[clipActions:generate] Starting clip generation...");

    // Auth check (getAuthUser throws when unauthenticated, so wrap in try-catch)
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch (e) {
      console.error("[clipActions:generate] Auth failed:", e);
      throw new Error("Not authenticated");
    }
    if (!authUser) throw new Error("Not authenticated");
    console.log("[clipActions:generate] Auth OK, email:", authUser.email);

    // Ensure user record exists in DB (new accounts may not have one yet)
    try {
      await ctx.runMutation(api.users.ensureUserExists);
      console.log("[clipActions:generate] ensureUserExists OK");
    } catch (e) {
      console.error("[clipActions:generate] ensureUserExists failed:", e);
      throw new Error("Failed to initialize user record");
    }

    const user = await ctx.runQuery(api.users.viewer);
    if (!user) throw new Error("User not found");
    console.log("[clipActions:generate] User found, plan:", user.plan);

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
      !hexRegex.test(args.colors.accent) ||
      (args.colors.background && !hexRegex.test(args.colors.background))
    ) {
      throw new Error("Invalid color format. Use hex colors like #FF5500.");
    }

    // Parse script with AI
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OpenRouter API key not configured");
    console.log("[clipActions:generate] Validation passed, calling AI parser...");

    const theme: ClipTheme = args.theme || "classic";
    const maxScenes = theme === "cinematic"
      ? Math.max(limits.maxScenesPerClip - 1, 1) // reserve 1 slot for montage
      : limits.maxScenesPerClip;

    const category = args.category || "saas";

    let scenes: SceneData[];
    try {
      scenes = await parseScriptWithAI(
        script,
        maxScenes,
        apiKey,
        args.autoSplit ?? false,
        category
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[clipActions:generate] AI parse failed:", msg);
      throw new Error(`Script parsing failed: ${msg}`);
    }
    console.log("[clipActions:generate] AI parsed", scenes.length, "scenes");

    // Cinematic: auto-generate montage scene from parsed content
    let allScenes: SceneData[] = scenes;
    if (theme === "cinematic") {
      const montageItems: string[] = [];
      const hookS = scenes.find((s) => s.type === "hook");
      if (hookS?.headline) {
        montageItems.push(hookS.headline.split(" ").slice(0, 4).join(" "));
      }
      const brandS = scenes.find((s) => s.type === "brand");
      if (brandS?.brandName) {
        montageItems.push(brandS.brandName);
      }
      const featS = scenes.find((s) => s.type === "features");
      if (featS?.features?.[0]) {
        montageItems.push(featS.features[0]);
      }
      const ctaS = scenes.find((s) => s.type === "cta");
      if (ctaS?.ctaText) {
        montageItems.push(ctaS.ctaText);
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

    // Generate voiceover (if enabled and Cartesia key available)
    let voiceoverStorageId: string | undefined;
    let voiceoverText: string | undefined;
    let voiceId: string | undefined;
    let voiceoverDurationMs: number | undefined;
    let sceneTextLengths: number[] | undefined;

    if (args.voiceover?.enabled) {
      const cartesiaKey = process.env.CARTESIA_API_KEY;
      if (!cartesiaKey) {
        throw new Error("Cartesia API key not configured for voiceover");
      }

      // Check voiceover plan access (FREE plan has hasVoiceover=true but limited to 2/mo)
      if ((user as any).usage?.voiceoversThisMonth >= (user as any).usage?.voiceoversLimit) {
        throw new Error("You've reached your monthly voiceover limit. Upgrade for more.");
      }

      voiceId = args.voiceover.voiceId || CLIP_VOICES[0].id;
      const voiceStyle = args.voiceover.style || "energetic";

      // Build narration script from parsed scenes
      const narrationResult = buildNarrationFromScenes(allScenes);
      const rawNarration = narrationResult.text;
      sceneTextLengths = narrationResult.sceneTextLengths;
      if (rawNarration.length < 5) {
        throw new Error("Not enough text in scenes for voiceover narration");
      }

      try {
        const ttsResult = await generateCartesiaTTS(
          rawNarration,
          voiceId,
          cartesiaKey,
          voiceStyle,
          apiKey // OpenRouter key for text optimization
        );
        voiceoverText = ttsResult.finalText;
        voiceoverDurationMs = ttsResult.durationMs;

        // Store audio in Convex file storage (not in document — too large for base64)
        const audioBlob = new Blob(
          [Buffer.from(ttsResult.url.split(",")[1], "base64")],
          { type: "audio/mpeg" }
        );
        voiceoverStorageId = await ctx.storage.store(audioBlob);

        // Increment voiceover usage
        await ctx.runMutation(api.users.incrementVoiceoverUsage);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        // Don't fail the whole clip — generate without voiceover
        console.error(`Voiceover generation failed: ${msg}`);
      }
    }

    // Generate HTML (no embedded audio — voiceover plays separately via frontend)
    const colors: ClipColors = args.colors;
    const title =
      args.title || `Clip - ${new Date().toLocaleDateString()}`;

    console.log("[clipActions:generate] Generating HTML...");
    let htmlContent: string;
    try {
      htmlContent = generateClipHTML({
        title,
        scenes: allScenes,
        colors,
        brandName: allScenes.find((s) => s.type === "brand")?.brandName,
        theme,
        voiceoverDurationMs,
        sceneTextLengths,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[clipActions:generate] HTML gen failed:", msg);
      throw new Error(`HTML generation failed: ${msg}`);
    }

    const baseDuration = estimateDuration(allScenes);
    const durationWaitRatio = voiceoverDurationMs
      ? Math.max(0.6, Math.min(1.8, voiceoverDurationMs / (baseDuration * 1000)))
      : 1;
    const duration = Math.round(baseDuration * durationWaitRatio * 10) / 10;
    console.log("[clipActions:generate] HTML OK, duration:", duration, "s (ratio:", durationWaitRatio.toFixed(2), "). Saving to DB...");

    // Save to DB
    let clipId: string;
    try {
      clipId = await ctx.runMutation((api as any).clips.create, {
        title,
        script,
        scenes: allScenes,
        colors,
        htmlContent,
        duration,
        scenesCount: allScenes.length,
        brandId: args.brandId,
        theme: theme !== "classic" ? theme : undefined,
        category: category !== "saas" ? category : undefined,
        voiceoverStorageId,
        voiceoverText,
        voiceId,
        voiceProvider: voiceoverStorageId ? "cartesia" as const : undefined,
        voiceoverDurationMs,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[clipActions:generate] DB save failed:", msg);
      throw new Error(`DB save failed: ${msg}`);
    }
    console.log("[clipActions:generate] Saved clip:", clipId);

    // Get voiceover playback URL from storage
    let voiceoverPlayUrl: string | null = null;
    if (voiceoverStorageId) {
      voiceoverPlayUrl = await ctx.storage.getUrl(voiceoverStorageId as any);
    }

    return {
      clipId,
      scenesCount: allScenes.length,
      duration,
      htmlContent,
      hasVoiceover: !!voiceoverStorageId,
      voiceoverUrl: voiceoverPlayUrl,
      scenes: allScenes.map((s) => ({
        type: s.type,
        headline: s.headline || s.brandName || s.demoTitle || s.chapterTitle || s.tipTitle || s.revealText || s.quote?.slice(0, 40) || s.text?.slice(0, 40) || (s.type === "montage" ? "Montage Intro" : ""),
      })),
    };
  },
});

// ============================================================
// GET AVAILABLE CLIP VOICES
// ============================================================

export const getClipVoices = action({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    return CLIP_VOICES.map((v) => ({
      id: v.id,
      name: v.name,
      gender: v.gender,
    }));
  },
});

// ============================================================
// EXPORT TO MP4 (Browserless.io)
// PRO/BUSINESS only — uses real headless Chrome to record animations
// ============================================================

function generateHmac(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}

export const exportMp4 = action({
  args: {
    clipId: v.id("clips"),
  },
  handler: async (ctx, args) => {
    console.log("[exportMp4] Starting export for clipId:", args.clipId);
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");
    console.log("[exportMp4] Auth OK");

    const user = await ctx.runQuery(api.users.viewer);
    if (!user) throw new Error("User not found");

    const plan = (user.plan || "FREE") as Plan;
    const limits = getPlanLimits(plan);
    console.log("[exportMp4] Plan:", plan, "hasClipMp4Export:", limits.hasClipMp4Export);

    if (!limits.hasClipMp4Export) {
      throw new Error(
        "MP4 export requires a PRO plan. Upgrade to download videos."
      );
    }

    const clip = await ctx.runQuery((api as any).clips.getById, { id: args.clipId });
    if (!clip) throw new Error("Clip not found");
    console.log("[exportMp4] Clip found, duration:", clip.duration, "title:", clip.title);

    const browserlessToken = process.env.BROWSERLESS_TOKEN;
    if (!browserlessToken) {
      throw new Error("Video export is not configured yet. Coming soon!");
    }

    const convexSiteUrl = process.env.CONVEX_SITE_URL;
    const authSecret = process.env.BETTER_AUTH_SECRET;
    console.log("[exportMp4] CONVEX_SITE_URL:", convexSiteUrl ? "SET" : "MISSING", "BETTER_AUTH_SECRET:", authSecret ? "SET" : "MISSING");
    if (!convexSiteUrl || !authSecret) {
      throw new Error("Server misconfigured: missing CONVEX_SITE_URL or BETTER_AUTH_SECRET");
    }

    // Update status to rendering
    await ctx.runMutation((api as any).clips.updateRenderStatus, {
      clipId: args.clipId,
      renderStatus: "rendering",
    });

    try {
      // Build HMAC-signed clip render URL
      const clipIdStr = args.clipId as string;
      const hmacToken = generateHmac(clipIdStr, authSecret);
      const clipRenderUrl = `${convexSiteUrl}/clip-render/${clipIdStr}?token=${hmacToken}`;
      console.log("[exportMp4] Clip render URL:", clipRenderUrl);

      // Calculate recording duration (clip duration + 2s buffer) in ms
      const recordDurationMs = (clip.duration + 2) * 1000;

      const browserlessUrl = process.env.BROWSERLESS_URL || "https://chrome.browserless.io";

      // Two-phase approach:
      // Phase 1: Navigate to clip URL, capture JPEG frames via CDP Page.startScreencast
      // Phase 2: Encode frames into real H.264 MP4 using WebCodecs VideoEncoder + mp4-muxer
      // Produces actual MP4 files compatible with iOS, TikTok, Instagram, etc.
      const functionCode = `
export default async function ({ page }) {
  const CLIP_URL = ${JSON.stringify(clipRenderUrl)};
  const DURATION_MS = ${recordDurationMs};
  const W = 1080, H = 1920;
  const TARGET_FPS = 30;

  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(CLIP_URL, { waitUntil: 'networkidle0', timeout: 60000 });

  // Phase 1: Capture frames via CDP while animation plays
  const cdp = await page.createCDPSession();
  const frames = [];
  cdp.on('Page.screencastFrame', params => {
    frames.push(params.data);
    cdp.send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', {
    format: 'jpeg', quality: 85, maxWidth: W, maxHeight: H, everyNthFrame: 1
  });

  // Wait for the full clip animation to play
  await new Promise(r => setTimeout(r, DURATION_MS));
  await cdp.send('Page.stopScreencast');

  console.log('[exportMp4] Captured', frames.length, 'frames');

  // Inject mp4-muxer library into the page for Phase 2
  await page.addScriptTag({
    url: 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.min.js'
  });

  // Phase 2: Encode frames into H.264 MP4 using WebCodecs + mp4-muxer
  const mp4Base64 = await page.evaluate(async (allFrames) => {
    if (!allFrames.length) return '';

    const W = 1080, H = 1920;
    const FPS = 30;
    const MICROS_PER_FRAME = 1_000_000 / FPS;

    // Check WebCodecs support
    if (typeof VideoEncoder === 'undefined') {
      throw new Error('WebCodecs API not available in this Chrome version');
    }

    // Set up mp4-muxer (loaded via CDN script tag)
    const { Muxer, ArrayBufferTarget } = globalThis.Mp4Muxer;
    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      video: { codec: 'avc', width: W, height: H },
      fastStart: 'in-memory',
    });

    // Set up H.264 encoder
    let encoderError = null;
    const encoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => { encoderError = e; console.error('VideoEncoder error:', e); },
    });

    encoder.configure({
      codec: 'avc1.640033',
      width: W,
      height: H,
      bitrate: 5_000_000,
      framerate: FPS,
      latencyMode: 'quality',
    });

    // Encode each captured frame
    for (let i = 0; i < allFrames.length; i++) {
      if (encoderError) throw encoderError;

      const blob = await fetch('data:image/jpeg;base64,' + allFrames[i]).then(r => r.blob());
      const bitmap = await createImageBitmap(blob);
      const timestamp = Math.round(i * MICROS_PER_FRAME);
      const frame = new VideoFrame(bitmap, { timestamp });
      encoder.encode(frame, { keyFrame: i % 60 === 0 });
      frame.close();
      bitmap.close();

      // Yield to prevent UI thread starvation on large clips
      if (i % 30 === 0) await new Promise(r => setTimeout(r, 0));
    }

    // Finalize
    await encoder.flush();
    encoder.close();
    muxer.finalize();

    // Convert ArrayBuffer to base64
    const bytes = new Uint8Array(target.buffer);
    const CHUNK = 8192;
    let binary = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + CHUNK, bytes.length)));
    }
    return btoa(binary);
  }, frames);

  return { data: mp4Base64, type: 'application/json' };
}
      `;

      // Browserless timeout in MILLISECONDS: 2x recording time (capture + encode) + 60s overhead
      const browserlessTimeoutMs = recordDurationMs * 2 + 60000;
      console.log("[exportMp4] recordDurationMs:", recordDurationMs, "browserlessTimeoutMs:", browserlessTimeoutMs);

      const fetchUrl = `${browserlessUrl}/function?token=${browserlessToken}&timeout=${browserlessTimeoutMs}`;
      console.log("[exportMp4] Calling Browserless...", browserlessUrl);
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/javascript" },
        body: functionCode,
      });

      console.log("[exportMp4] Browserless response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[exportMp4] Browserless error:", errorText);
        throw new Error(`Browserless error (${response.status}): ${errorText}`);
      }

      const responseText = await response.text();
      console.log("[exportMp4] Response length:", responseText.length, "first 200 chars:", responseText.slice(0, 200));

      let result: { data: string };
      try {
        result = JSON.parse(responseText);
      } catch (parseErr) {
        console.error("[exportMp4] JSON parse failed, response:", responseText.slice(0, 500));
        throw new Error(`Failed to parse Browserless response: ${responseText.slice(0, 200)}`);
      }

      if (!result.data) {
        console.error("[exportMp4] Empty video data in result. Keys:", Object.keys(result));
        throw new Error("Browserless returned empty video data");
      }

      console.log("[exportMp4] Video base64 length:", result.data.length);
      // Decode base64 video and store in Convex file storage
      const videoBuffer = Buffer.from(result.data, "base64");
      console.log("[exportMp4] Video buffer size:", videoBuffer.length, "bytes");
      const blob = new Blob([videoBuffer], { type: "video/mp4" });
      const storageId = await ctx.storage.store(blob);
      const storageUrl = await ctx.storage.getUrl(storageId);
      console.log("[exportMp4] Stored video, URL:", storageUrl);

      if (!storageUrl) {
        throw new Error("Failed to get storage URL for recorded video");
      }

      // Update clip with video URL — done!
      await ctx.runMutation((api as any).clips.updateRenderStatus, {
        clipId: args.clipId,
        renderStatus: "ready",
        mp4Url: storageUrl,
      });

      return { mp4Url: storageUrl };
    } catch (e: unknown) {
      console.error("[exportMp4] FAILED:", e instanceof Error ? e.message : String(e));
      console.error("[exportMp4] Stack:", e instanceof Error ? e.stack : "no stack");
      await ctx.runMutation((api as any).clips.updateRenderStatus, {
        clipId: args.clipId,
        renderStatus: "failed",
      });
      throw e;
    }
  },
});
