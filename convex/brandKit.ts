"use node";

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { authComponent } from "./auth";
import { getPlanLimits, Plan } from "./lib/planLimits";

// ============================================================
// QUERIES
// ============================================================

export const getByBrandId = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch {
      return null;
    }
    if (!authUser || !authUser.email) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();
    if (!user) return null;

    return await ctx.db
      .query("brandKits")
      .withIndex("by_brandId", (q) => q.eq("brandId", args.brandId))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("brandKits") },
  handler: async (ctx, args) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch {
      return null;
    }
    if (!authUser || !authUser.email) return null;

    return await ctx.db.get(args.id);
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch {
      return [];
    }
    if (!authUser || !authUser.email) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();
    if (!user) return [];

    return await ctx.db
      .query("brandKits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brandKits")
      .withIndex("by_publicSlug", (q) => q.eq("publicSlug", args.slug))
      .first();
  },
});

// ============================================================
// MUTATIONS
// ============================================================

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    vibes: v.array(v.string()),
    brandId: v.optional(v.id("brands")),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser || !authUser.email) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", authUser.email))
      .first();
    if (!user) throw new Error("User not found");

    // Check plan limits
    const plan = (user.plan || "FREE") as Plan;
    const limits = getPlanLimits(plan);
    const existingKits = await ctx.db
      .query("brandKits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    if (existingKits.length >= limits.maxBrandKits) {
      throw new Error(
        `You've reached the maximum of ${limits.maxBrandKits} brand kit(s) on your ${plan} plan. Upgrade to create more.`
      );
    }

    const kitId = await ctx.db.insert("brandKits", {
      userId: user._id,
      brandId: args.brandId,
      name: args.name,
      description: args.description,
      vibes: args.vibes,
      status: "GENERATING",
      progress: {
        palette: false,
        typography: false,
        logos: false,
        moodBoard: false,
        backgrounds: false,
        mockups: false,
        socialKit: false,
        pattern: false,
      },
      createdAt: Date.now(),
    });

    // Increment user's kit count
    await ctx.db.patch(user._id, {
      brandKitsGenerated: (user.brandKitsGenerated ?? 0) + 1,
    });

    return kitId;
  },
});

export const updateProgress = mutation({
  args: {
    kitId: v.id("brandKits"),
    step: v.string(),
  },
  handler: async (ctx, args) => {
    const kit = await ctx.db.get(args.kitId);
    if (!kit) throw new Error("Brand kit not found");

    const progress = kit.progress || {
      palette: false,
      typography: false,
      logos: false,
      moodBoard: false,
      backgrounds: false,
      mockups: false,
      socialKit: false,
      pattern: false,
    };

    await ctx.db.patch(args.kitId, {
      progress: { ...progress, [args.step]: true },
    });
  },
});

export const savePalette = mutation({
  args: {
    kitId: v.id("brandKits"),
    palette: v.object({
      primary: v.object({ hex: v.string(), name: v.string(), use: v.string() }),
      secondary: v.object({ hex: v.string(), name: v.string(), use: v.string() }),
      accent: v.object({ hex: v.string(), name: v.string(), use: v.string() }),
      dark: v.object({ hex: v.string(), name: v.string(), use: v.string() }),
      light: v.object({ hex: v.string(), name: v.string(), use: v.string() }),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { palette: args.palette });
  },
});

export const saveTypography = mutation({
  args: {
    kitId: v.id("brandKits"),
    typography: v.object({
      heading: v.object({ family: v.string(), weight: v.string(), style: v.string() }),
      body: v.object({ family: v.string(), weight: v.string(), style: v.string() }),
      recommendation: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { typography: args.typography });
  },
});

export const saveLogos = mutation({
  args: {
    kitId: v.id("brandKits"),
    logos: v.array(v.object({
      type: v.string(),
      url: v.string(),
      prompt: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { logos: args.logos });
  },
});

export const saveMoodBoard = mutation({
  args: {
    kitId: v.id("brandKits"),
    moodBoard: v.array(v.object({
      url: v.string(),
      prompt: v.optional(v.string()),
      label: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { moodBoard: args.moodBoard });
  },
});

export const saveBackgrounds = mutation({
  args: {
    kitId: v.id("brandKits"),
    postBackgrounds: v.array(v.object({
      url: v.string(),
      size: v.optional(v.string()),
      prompt: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { postBackgrounds: args.postBackgrounds });
  },
});

export const saveMockups = mutation({
  args: {
    kitId: v.id("brandKits"),
    mockups: v.array(v.object({
      type: v.string(),
      url: v.string(),
      prompt: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { mockups: args.mockups });
  },
});

export const saveSocialProfiles = mutation({
  args: {
    kitId: v.id("brandKits"),
    socialProfiles: v.array(v.object({
      platform: v.string(),
      avatarUrl: v.optional(v.string()),
      bannerUrl: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { socialProfiles: args.socialProfiles });
  },
});

export const savePattern = mutation({
  args: {
    kitId: v.id("brandKits"),
    pattern: v.object({
      url: v.string(),
      prompt: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, { pattern: args.pattern });
  },
});

export const finalize = mutation({
  args: {
    kitId: v.id("brandKits"),
    score: v.number(),
    status: v.union(v.literal("READY"), v.literal("FAILED")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.kitId, {
      status: args.status,
      score: args.score,
    });
  },
});

export const deleteKit = mutation({
  args: { id: v.id("brandKits") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser || !authUser.email) throw new Error("Not authenticated");

    const kit = await ctx.db.get(args.id);
    if (!kit) throw new Error("Brand kit not found");

    await ctx.db.delete(args.id);
  },
});

// ============================================================
// RUNWARE IMAGE GENERATION (reused from imagesAction.ts pattern)
// ============================================================

async function generateWithRunware(
  prompt: string,
  width: number,
  height: number,
  apiKey: string,
  model: string = "runware:101@1" // Default to Flux Dev for quality
): Promise<string> {
  const requestBody: Record<string, unknown> = {
    taskType: "imageInference",
    taskUUID: crypto.randomUUID(),
    positivePrompt: prompt,
    model,
    width,
    height,
    numberResults: 1,
    outputFormat: "png",
    outputQuality: 95,
    outputType: "URL",
    includeCost: false,
  };

  if (model !== "runware:400@4") {
    requestBody.CFGScale = 3.5;
  }

  const response = await fetch("https://api.runware.ai/v1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify([requestBody]),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Runware API error: ${errorText || response.statusText}`);
  }

  const result = (await response.json()) as {
    data?: Array<{ imageURL?: string }>;
  };

  if (!result.data || result.data.length === 0 || !result.data[0].imageURL) {
    throw new Error("No image was generated");
  }

  return result.data[0].imageURL;
}

// ============================================================
// IDEOGRAM LOGO GENERATION (reused from imagesAction.ts pattern)
// ============================================================

async function generateLogoWithIdeogram(
  prompt: string,
  apiKey: string
): Promise<string> {
  const response = await fetch("https://fal.run/fal-ai/ideogram/v2/turbo", {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: "1:1",
      expand_prompt: true,
      style: "auto",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Ideogram API error: ${errorText || response.statusText}`);
  }

  const result = (await response.json()) as {
    images?: Array<{ url: string }>;
  };

  if (!result.images || result.images.length === 0) {
    throw new Error("No logo was generated");
  }

  return result.images[0].url;
}

// ============================================================
// AI GENERATION HELPERS
// ============================================================

async function callAI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string = "anthropic/claude-3-haiku"
): Promise<string> {
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
        max_tokens: 2000,
        temperature: 0.7,
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

  return data.choices[0]?.message?.content || "";
}

// ============================================================
// CURATED GOOGLE FONT PAIRINGS
// ============================================================

const FONT_PAIRINGS = [
  // Bold / Impactful
  { heading: { family: "Syne", weight: "700", style: "Bold geometric" }, body: { family: "DM Sans", weight: "400", style: "Clean modern" }, vibes: ["bold", "tech", "modern"] },
  { heading: { family: "Space Grotesk", weight: "700", style: "Techy bold" }, body: { family: "Inter", weight: "400", style: "Universal clean" }, vibes: ["tech", "modern", "minimal"] },
  { heading: { family: "Clash Display", weight: "600", style: "Sharp editorial" }, body: { family: "Satoshi", weight: "400", style: "Geometric clean" }, vibes: ["bold", "creative", "edgy"] },

  // Minimal / Clean
  { heading: { family: "Plus Jakarta Sans", weight: "700", style: "Friendly geometric" }, body: { family: "Plus Jakarta Sans", weight: "400", style: "Consistent friendly" }, vibes: ["minimal", "corporate", "modern"] },
  { heading: { family: "Outfit", weight: "700", style: "Geometric round" }, body: { family: "Outfit", weight: "400", style: "Soft geometric" }, vibes: ["minimal", "playful", "modern"] },
  { heading: { family: "Manrope", weight: "800", style: "Rounded bold" }, body: { family: "Manrope", weight: "400", style: "Rounded friendly" }, vibes: ["minimal", "tech", "organic"] },

  // Playful / Creative
  { heading: { family: "Bricolage Grotesque", weight: "800", style: "Quirky bold" }, body: { family: "DM Sans", weight: "400", style: "Clean contrast" }, vibes: ["playful", "creative", "bold"] },
  { heading: { family: "Archivo Black", weight: "400", style: "Impact heavy" }, body: { family: "Work Sans", weight: "400", style: "Friendly readable" }, vibes: ["bold", "playful", "edgy"] },
  { heading: { family: "Righteous", weight: "400", style: "Retro round" }, body: { family: "Nunito", weight: "400", style: "Soft rounded" }, vibes: ["retro", "playful", "creative"] },

  // Luxury / Elegant
  { heading: { family: "Playfair Display", weight: "700", style: "Elegant serif" }, body: { family: "Lato", weight: "400", style: "Clean humanist" }, vibes: ["luxury", "corporate", "elegant"] },
  { heading: { family: "Cormorant Garamond", weight: "600", style: "Refined serif" }, body: { family: "Montserrat", weight: "400", style: "Modern geometric" }, vibes: ["luxury", "elegant", "minimal"] },
  { heading: { family: "DM Serif Display", weight: "400", style: "Classic display" }, body: { family: "DM Sans", weight: "400", style: "Matching clean" }, vibes: ["luxury", "corporate", "retro"] },

  // Tech / Modern
  { heading: { family: "Urbanist", weight: "800", style: "Geometric futuristic" }, body: { family: "Urbanist", weight: "400", style: "Consistent futuristic" }, vibes: ["tech", "modern", "minimal"] },
  { heading: { family: "Lexend", weight: "700", style: "Optimized readability" }, body: { family: "Lexend", weight: "400", style: "Highly readable" }, vibes: ["tech", "corporate", "modern"] },
  { heading: { family: "Albert Sans", weight: "800", style: "Geometric sharp" }, body: { family: "Source Sans 3", weight: "400", style: "Clean professional" }, vibes: ["tech", "corporate", "minimal"] },

  // Organic / Natural
  { heading: { family: "Fraunces", weight: "700", style: "Organic serif" }, body: { family: "Commissioner", weight: "400", style: "Flowing humanist" }, vibes: ["organic", "luxury", "creative"] },
  { heading: { family: "Vollkorn", weight: "700", style: "Warm serif" }, body: { family: "Nunito Sans", weight: "400", style: "Friendly rounded" }, vibes: ["organic", "retro", "corporate"] },

  // Retro
  { heading: { family: "Bebas Neue", weight: "400", style: "Condensed retro" }, body: { family: "Open Sans", weight: "400", style: "Neutral clean" }, vibes: ["retro", "bold", "edgy"] },
  { heading: { family: "Oswald", weight: "700", style: "Condensed impact" }, body: { family: "Merriweather", weight: "400", style: "Classic readable" }, vibes: ["retro", "corporate", "bold"] },

  // Corporate
  { heading: { family: "Poppins", weight: "700", style: "Geometric professional" }, body: { family: "Poppins", weight: "400", style: "Consistent geometric" }, vibes: ["corporate", "modern", "minimal"] },
  { heading: { family: "Raleway", weight: "700", style: "Elegant thin" }, body: { family: "Roboto", weight: "400", style: "Universal safe" }, vibes: ["corporate", "elegant", "tech"] },

  // Edgy
  { heading: { family: "Anton", weight: "400", style: "Heavy condensed" }, body: { family: "Barlow", weight: "400", style: "Semi-condensed clean" }, vibes: ["edgy", "bold", "creative"] },
  { heading: { family: "Rubik Mono One", weight: "400", style: "Monospace impact" }, body: { family: "Rubik", weight: "400", style: "Rounded geometric" }, vibes: ["edgy", "tech", "playful"] },
];

function findBestFontPairing(vibes: string[]): typeof FONT_PAIRINGS[0] {
  const lowerVibes = vibes.map((v) => v.toLowerCase());

  let bestMatch = FONT_PAIRINGS[0];
  let bestScore = 0;

  for (const pairing of FONT_PAIRINGS) {
    let score = 0;
    for (const vibe of lowerVibes) {
      if (pairing.vibes.includes(vibe)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = pairing;
    }
  }

  return bestMatch;
}

// ============================================================
// MAIN ORCHESTRATOR ACTION
// ============================================================

export const generate = action({
  args: {
    name: v.string(),
    description: v.string(),
    vibes: v.array(v.string()),
    brandId: v.optional(v.id("brands")),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const user = await ctx.runQuery(api.users.viewer);
    if (!user) throw new Error("User not found. Please refresh the page.");

    const plan = (user.plan || "FREE") as Plan;
    const limits = getPlanLimits(plan);

    // Create kit record
    const kitId = await ctx.runMutation(api.brandKit.create, {
      name: args.name,
      description: args.description,
      vibes: args.vibes,
      brandId: args.brandId,
    });

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) throw new Error("OpenRouter API key not configured");

    const runwareKey = process.env.RUNWARE_API_KEY;
    const falKey = process.env.FAL_API_KEY;

    try {
      // ── STEP 1: Generate Color Palette (AI) ─────────────────
      const paletteResponse = await callAI(
        `You are a world-class brand designer. Generate a harmonious 5-color palette for a brand.
Return ONLY valid JSON, no markdown, no explanation.

Color theory rules:
- Primary: The hero color that represents the brand's core identity
- Secondary: Complementary or analogous to primary, for supporting elements
- Accent: A contrasting pop color for CTAs and highlights
- Dark: A near-black shade with brand undertones for text
- Light: A near-white shade with brand undertones for backgrounds

Consider the brand vibes and create colors that evoke the right emotions.`,
        `Brand: "${args.name}"
Description: "${args.description}"
Vibes: ${args.vibes.join(", ")}

Return JSON:
{
  "primary": { "hex": "#XXXXXX", "name": "Color Name", "use": "Primary buttons, headers, key elements" },
  "secondary": { "hex": "#XXXXXX", "name": "Color Name", "use": "Supporting elements, cards, borders" },
  "accent": { "hex": "#XXXXXX", "name": "Color Name", "use": "CTAs, highlights, badges" },
  "dark": { "hex": "#XXXXXX", "name": "Color Name", "use": "Text, headings, dark backgrounds" },
  "light": { "hex": "#XXXXXX", "name": "Color Name", "use": "Backgrounds, light sections, cards" }
}`,
        openrouterKey
      );

      let palette;
      try {
        const jsonMatch = paletteResponse.match(/\{[\s\S]*\}/);
        palette = JSON.parse(jsonMatch?.[0] || "{}");
      } catch {
        throw new Error("Failed to parse color palette");
      }

      await ctx.runMutation(api.brandKit.savePalette, { kitId, palette });
      await ctx.runMutation(api.brandKit.updateProgress, { kitId, step: "palette" });

      // ── STEP 2: Generate Typography ──────────────────────────
      const fontPairing = findBestFontPairing(args.vibes);

      // Also ask AI for a recommendation note
      const typoResponse = await callAI(
        "You are a typography expert. Given a brand and its selected fonts, write a 1-sentence recommendation on how to use them. Be specific and practical. Return ONLY the sentence, no quotes.",
        `Brand: "${args.name}" (${args.description})
Heading font: ${fontPairing.heading.family} (${fontPairing.heading.style})
Body font: ${fontPairing.body.family} (${fontPairing.body.style})
Vibes: ${args.vibes.join(", ")}`,
        openrouterKey
      );

      const typography = {
        heading: fontPairing.heading,
        body: fontPairing.body,
        recommendation: typoResponse.trim(),
      };

      await ctx.runMutation(api.brandKit.saveTypography, { kitId, typography });
      await ctx.runMutation(api.brandKit.updateProgress, { kitId, step: "typography" });

      // ── STEP 3: Generate Logos (Ideogram or Runware) ─────────
      const logoCount = limits.brandKitLogoVariations;
      const primaryHex = palette.primary?.hex || "#3B82F6";
      const secondaryHex = palette.secondary?.hex || "#8B5CF6";

      const logoTypes = [
        { type: "primary", prompt: `Professional modern logo for "${args.name}", ${args.description}. Clean design using ${primaryHex} and ${secondaryHex}. ${args.vibes.join(", ")} style. White background, centered, no text description, vector-like quality.` },
        { type: "icon", prompt: `Simple icon mark / app icon for "${args.name}". Minimal geometric symbol, single color ${primaryHex}, works at small sizes. No text, clean white background, bold shape.` },
        { type: "monochrome", prompt: `Monochrome logo for "${args.name}", single dark color #1A1A2E on white background. Clean professional, minimal, vector-like. ${args.vibes.join(", ")} aesthetic.` },
        { type: "inverted", prompt: `Logo for "${args.name}" on dark background #0F0F23. Light/white version of logo, clean modern design. Glowing ${primaryHex} accents. Minimal, professional.` },
      ];

      const logosToGenerate = logoTypes.slice(0, logoCount);
      const logos: Array<{ type: string; url: string; prompt: string }> = [];

      // Generate logos - use Ideogram if Fal key available, else Runware
      for (const logo of logosToGenerate) {
        try {
          let url: string;
          if (falKey) {
            url = await generateLogoWithIdeogram(logo.prompt, falKey);
          } else if (runwareKey) {
            url = await generateWithRunware(logo.prompt, 1024, 1024, runwareKey);
          } else {
            throw new Error("No image API key configured");
          }
          logos.push({ type: logo.type, url, prompt: logo.prompt });
        } catch (e) {
          console.error(`Failed to generate ${logo.type} logo:`, e);
        }
      }

      if (logos.length > 0) {
        await ctx.runMutation(api.brandKit.saveLogos, { kitId, logos });
      }
      await ctx.runMutation(api.brandKit.updateProgress, { kitId, step: "logos" });

      // ── STEP 4: Generate Mood Board (Runware) ────────────────
      if (runwareKey) {
        const moodBoardCount = limits.brandKitMoodBoardImages;
        const moodPrompts = [
          { label: "Brand Lifestyle", prompt: `${args.description}, lifestyle photography, ${args.vibes.join(" ")} aesthetic, color palette ${primaryHex} ${secondaryHex}, professional, aspirational, editorial style` },
          { label: "Product Context", prompt: `Professional workspace or product context related to ${args.description}, ${args.vibes.join(" ")} mood, colors ${primaryHex} accents, clean composition, commercial photography` },
          { label: "Brand Texture", prompt: `Abstract textured background, ${args.vibes.join(" ")} aesthetic, dominant colors ${primaryHex} and ${secondaryHex}, artistic, high quality, subtle gradient mesh` },
          { label: "Brand Energy", prompt: `Dynamic energetic scene representing ${args.description}, ${args.vibes.join(" ")} mood, ${primaryHex} accent lighting, cinematic, professional, aspirational` },
          { label: "Brand Nature", prompt: `Natural organic scene with ${args.vibes.join(" ")} aesthetic, color tones matching ${primaryHex} and ${secondaryHex}, peaceful, premium quality, editorial` },
          { label: "Brand Abstract", prompt: `Abstract 3D shapes and forms, ${args.vibes.join(" ")} style, colors ${primaryHex} ${secondaryHex}, modern digital art, clean background, professional` },
        ];

        const moodBoard: Array<{ url: string; prompt: string; label: string }> = [];
        const moodToGenerate = moodPrompts.slice(0, moodBoardCount);

        for (const mood of moodToGenerate) {
          try {
            const url = await generateWithRunware(mood.prompt, 1024, 1024, runwareKey);
            moodBoard.push({ url, prompt: mood.prompt, label: mood.label });
          } catch (e) {
            console.error(`Failed to generate mood board image:`, e);
          }
        }

        if (moodBoard.length > 0) {
          await ctx.runMutation(api.brandKit.saveMoodBoard, { kitId, moodBoard });
        }
      }
      await ctx.runMutation(api.brandKit.updateProgress, { kitId, step: "moodBoard" });

      // ── STEP 5: Generate Post Backgrounds (Runware) ──────────
      if (runwareKey) {
        const bgCount = limits.brandKitPostTemplates;
        const bgPrompts = [
          { size: "1080x1080", w: 1024, h: 1024, prompt: `Abstract gradient mesh background, dominant colors ${primaryHex} and ${secondaryHex}, smooth flowing shapes, minimal, clean, social media post background, no text, no objects` },
          { size: "1080x1080", w: 1024, h: 1024, prompt: `Soft geometric pattern background in ${primaryHex}, subtle shapes, modern ${args.vibes[0] || "minimal"} design, social media ready, no text` },
          { size: "1080x1920", w: 768, h: 1344, prompt: `Vertical gradient background for stories, colors ${primaryHex} to ${secondaryHex}, smooth blend, minimal, no text, clean` },
          { size: "1200x675", w: 1344, h: 768, prompt: `Horizontal banner background, ${args.vibes.join(" ")} aesthetic, colors ${primaryHex} and ${palette.light?.hex || "#F5F5F5"}, abstract, professional, no text` },
          { size: "1080x1080", w: 1024, h: 1024, prompt: `Textured paper background with subtle ${primaryHex} tint, organic texture, premium feel, ${args.vibes[0] || "minimal"} aesthetic, no text` },
          { size: "1080x1080", w: 1024, h: 1024, prompt: `Dark moody background with ${primaryHex} glow effects, ${args.vibes.join(" ")} style, abstract light particles, no text, premium social media` },
          { size: "1080x1920", w: 768, h: 1344, prompt: `Vertical abstract wave background, flowing shapes in ${secondaryHex} and ${palette.accent?.hex || primaryHex}, dynamic, story-sized, no text` },
          { size: "1200x675", w: 1344, h: 768, prompt: `Wide cinematic gradient, ${primaryHex} to dark ${palette.dark?.hex || "#1A1A2E"}, professional, LinkedIn banner ready, no text, subtle grain` },
          { size: "1080x1080", w: 1024, h: 1024, prompt: `Marble texture with ${primaryHex} veins, luxury aesthetic, premium brand background, clean, no text, high detail` },
          { size: "1080x1080", w: 1024, h: 1024, prompt: `Bokeh light background, soft ${primaryHex} and ${secondaryHex} circles, dreamy, professional photography style, no text` },
        ];

        const bgsToGenerate = bgPrompts.slice(0, bgCount);
        const backgrounds: Array<{ url: string; size: string; prompt: string }> = [];

        for (const bg of bgsToGenerate) {
          try {
            const url = await generateWithRunware(bg.prompt, bg.w, bg.h, runwareKey);
            backgrounds.push({ url, size: bg.size, prompt: bg.prompt });
          } catch (e) {
            console.error(`Failed to generate background:`, e);
          }
        }

        if (backgrounds.length > 0) {
          await ctx.runMutation(api.brandKit.saveBackgrounds, { kitId, postBackgrounds: backgrounds });
        }
      }
      await ctx.runMutation(api.brandKit.updateProgress, { kitId, step: "backgrounds" });

      // ── STEP 6: Generate Mockups (Runware) - PRO+ ────────────
      if (runwareKey && limits.brandKitMockups > 0) {
        const mockupPrompts = [
          { type: "business-card", prompt: `Professional business card mockup on marble surface, showing brand name "${args.name}" in ${fontPairing.heading.family} font, primary color ${primaryHex}, clean modern design, photorealistic, studio lighting, shallow depth of field` },
          { type: "phone", prompt: `Smartphone mockup showing mobile app splash screen for "${args.name}", brand color ${primaryHex}, modern UI, floating on gradient background ${secondaryHex}, photorealistic, professional product photography` },
          { type: "storefront", prompt: `Modern storefront sign mockup with "${args.name}" branding, ${primaryHex} accent color, clean architecture, professional signage, street view, daylight photography, realistic` },
          { type: "laptop", prompt: `Laptop screen mockup showing "${args.name}" website, brand colors ${primaryHex} and ${secondaryHex}, modern workspace, photorealistic, clean desk, professional` },
          { type: "packaging", prompt: `Product packaging box mockup for "${args.name}", minimal design with ${primaryHex} brand color, white background, studio photography, premium feel, floating shadow` },
        ];

        const mockupsToGenerate = mockupPrompts.slice(0, limits.brandKitMockups);
        const mockups: Array<{ type: string; url: string; prompt: string }> = [];

        for (const mockup of mockupsToGenerate) {
          try {
            const url = await generateWithRunware(mockup.prompt, 1024, 1024, runwareKey);
            mockups.push({ type: mockup.type, url, prompt: mockup.prompt });
          } catch (e) {
            console.error(`Failed to generate ${mockup.type} mockup:`, e);
          }
        }

        if (mockups.length > 0) {
          await ctx.runMutation(api.brandKit.saveMockups, { kitId, mockups });
        }
      }
      await ctx.runMutation(api.brandKit.updateProgress, { kitId, step: "mockups" });

      // ── STEP 7: Generate Social Profile Banners (Runware) ────
      if (runwareKey) {
        const bannerSpecs = [
          { platform: "Twitter", w: 1344, h: 448, prompt: `Twitter header banner for "${args.name}", ${args.description}. Abstract gradient background ${primaryHex} to ${secondaryHex}, modern ${args.vibes[0] || "minimal"} design, no text, professional, wide format` },
          { platform: "LinkedIn", w: 1344, h: 448, prompt: `LinkedIn banner for "${args.name}", professional brand cover, ${primaryHex} accent color, corporate yet modern, abstract shapes, no text, wide format` },
          { platform: "Facebook", w: 1344, h: 512, prompt: `Facebook cover photo for "${args.name}", brand identity banner, colors ${primaryHex} and ${secondaryHex}, ${args.vibes.join(" ")} aesthetic, no text, professional` },
          { platform: "YouTube", w: 1344, h: 768, prompt: `YouTube channel banner for "${args.name}", bold ${args.vibes[0] || "modern"} design, colors ${primaryHex} and ${palette.dark?.hex || "#1A1A2E"}, dynamic, energetic, no text` },
        ];

        const socialProfiles: Array<{ platform: string; bannerUrl: string }> = [];

        for (const spec of bannerSpecs) {
          try {
            const bannerUrl = await generateWithRunware(spec.prompt, spec.w, spec.h, runwareKey);
            socialProfiles.push({ platform: spec.platform, bannerUrl });
          } catch (e) {
            console.error(`Failed to generate ${spec.platform} banner:`, e);
          }
        }

        if (socialProfiles.length > 0) {
          await ctx.runMutation(api.brandKit.saveSocialProfiles, {
            kitId,
            socialProfiles,
          });
        }
      }
      await ctx.runMutation(api.brandKit.updateProgress, { kitId, step: "socialKit" });

      // ── STEP 8: Generate Brand Pattern (Runware) - PRO+ ──────
      if (runwareKey && limits.hasBrandKitExport) {
        try {
          const patternPrompt = `Seamless repeating pattern, ${args.vibes.join(" ")} style, colors ${primaryHex} and ${secondaryHex} on ${palette.light?.hex || "#FAFAFA"} background, tileable texture, geometric or organic shapes, professional brand pattern, no text`;
          const url = await generateWithRunware(patternPrompt, 1024, 1024, runwareKey);
          await ctx.runMutation(api.brandKit.savePattern, {
            kitId,
            pattern: { url, prompt: patternPrompt },
          });
        } catch (e) {
          console.error("Failed to generate pattern:", e);
        }
      }
      await ctx.runMutation(api.brandKit.updateProgress, { kitId, step: "pattern" });

      // ── STEP 9: Calculate Brand Score ─────────────────────────
      // Score based on completeness + color harmony
      let score = 50; // Base score
      if (palette) score += 10;
      if (typography) score += 5;
      if (logos.length >= 2) score += 10;
      if (logos.length >= 4) score += 5;
      // Bonus for having mood board, mockups, backgrounds
      const kit = await ctx.runQuery(api.brandKit.getById, { id: kitId });
      if (kit?.moodBoard && kit.moodBoard.length > 0) score += 5;
      if (kit?.postBackgrounds && kit.postBackgrounds.length > 0) score += 5;
      if (kit?.mockups && kit.mockups.length > 0) score += 5;
      if (kit?.socialProfiles && kit.socialProfiles.length > 0) score += 3;
      if (kit?.pattern) score += 2;

      // Cap at 100
      score = Math.min(score, 100);

      await ctx.runMutation(api.brandKit.finalize, {
        kitId,
        score,
        status: "READY",
      });

      return { kitId, score, status: "READY" };
    } catch (error) {
      // Mark as failed
      await ctx.runMutation(api.brandKit.finalize, {
        kitId,
        score: 0,
        status: "FAILED",
      });
      throw error;
    }
  },
});
