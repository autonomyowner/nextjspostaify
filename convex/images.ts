import { query } from "./_generated/server";
import { v } from "convex/values";

// Plan types for model access
export type PlanTier = "FREE" | "PRO" | "BUSINESS";

// Model configuration with tier access
export interface ImageModel {
  id: string;
  name: string;
  speed: "fast" | "medium" | "slow";
  description?: string;
  requiredPlan: PlanTier;
  provider: "runware" | "fal";
  costPerImage: number; // Approximate cost for reference
}

// Available image models with tier access
export const AVAILABLE_MODELS: ImageModel[] = [
  {
    id: "fal-ai/flux/schnell",
    name: "FLUX.2 Klein",
    speed: "fast",
    description: "Fast, high quality (FREE)",
    requiredPlan: "FREE",
    provider: "runware",
    costPerImage: 0.0006, // $0.0006/image via Runware
  },
  {
    id: "fal-ai/flux/dev",
    name: "Flux Dev",
    speed: "medium",
    description: "Higher quality, slower",
    requiredPlan: "PRO",
    provider: "runware",
    costPerImage: 0.0025,
  },
  {
    id: "fal-ai/flux-pro/v1.1",
    name: "Flux Pro 1.1",
    speed: "slow",
    description: "Best quality Flux model",
    requiredPlan: "PRO",
    provider: "runware",
    costPerImage: 0.0038,
  },
  {
    id: "fal-ai/recraft-v3",
    name: "Recraft V3",
    speed: "medium",
    description: "Premium creative model",
    requiredPlan: "BUSINESS",
    provider: "runware",
    costPerImage: 0.005,
  },
];

// Logo-optimized models (Ideogram excels at logos and text)
export const LOGO_MODELS: ImageModel[] = [
  {
    id: "fal-ai/ideogram/v2/turbo",
    name: "Ideogram Turbo",
    speed: "fast",
    description: "Best for logos",
    requiredPlan: "PRO",
    provider: "fal",
    costPerImage: 0.02,
  },
  {
    id: "fal-ai/ideogram/v2",
    name: "Ideogram V2",
    speed: "medium",
    description: "High quality logos",
    requiredPlan: "PRO",
    provider: "fal",
    costPerImage: 0.025,
  },
];

// Product photography - uses Bria on Fal.ai for perfect product placement
export const PRODUCT_MODEL: ImageModel = {
  id: "fal-ai/bria/product-shot",
  name: "Bria Product Shot",
  speed: "medium",
  description: "Professional product photography - keeps product exact, changes background",
  requiredPlan: "PRO",
  provider: "fal",
  costPerImage: 0.04,
};

// Product photography scene presets
export const PRODUCT_SCENES = [
  {
    value: "studio-white",
    label: "Studio White",
    description: "Clean professional white background, studio lighting, commercial photography"
  },
  {
    value: "marble-surface",
    label: "Marble Surface",
    description: "On elegant white marble surface, soft shadows, luxury product photography, clean background"
  },
  {
    value: "wooden-table",
    label: "Wooden Table",
    description: "On rustic wooden table surface, warm natural lighting, artisan aesthetic, cozy atmosphere"
  },
  {
    value: "kitchen-counter",
    label: "Kitchen Counter",
    description: "On modern kitchen counter, bright natural light from window, lifestyle home setting"
  },
  {
    value: "living-room",
    label: "Living Room",
    description: "In stylish living room interior, soft ambient lighting, modern home decor, lifestyle shot"
  },
  {
    value: "nature-outdoor",
    label: "Nature Outdoor",
    description: "Outdoor natural setting, green plants and foliage, soft natural daylight, organic feel"
  },
  {
    value: "gradient-modern",
    label: "Gradient Modern",
    description: "Modern gradient background, smooth color transition, contemporary design, minimalist"
  },
  {
    value: "beach-seaside",
    label: "Beach Seaside",
    description: "On sandy beach, ocean waves in background, golden hour sunlight, summer vibes"
  },
  {
    value: "concrete-urban",
    label: "Concrete Urban",
    description: "On concrete surface, urban industrial aesthetic, moody lighting, edgy modern style"
  },
  {
    value: "fabric-textile",
    label: "Fabric Textile",
    description: "On soft fabric or linen textile, elegant folds, soft diffused lighting, boutique style"
  },
];

// Get product scene presets
export const getProductScenes = query({
  args: {},
  handler: async () => {
    return PRODUCT_SCENES;
  },
});

// Available aspect ratios
export const ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "9:16", label: "Portrait (9:16)" },
  { value: "4:3", label: "Standard (4:3)" },
  { value: "3:4", label: "Portrait (3:4)" },
];

// Check if user's plan can access a model
export function canAccessModel(userPlan: PlanTier, requiredPlan: PlanTier): boolean {
  const planHierarchy: Record<PlanTier, number> = {
    FREE: 0,
    PRO: 1,
    BUSINESS: 2,
  };
  return planHierarchy[userPlan] >= planHierarchy[requiredPlan];
}

// Get available models for a user's plan
export const getModels = query({
  args: {
    userPlan: v.optional(v.union(v.literal("FREE"), v.literal("PRO"), v.literal("BUSINESS"))),
  },
  handler: async (_ctx, args) => {
    const plan = args.userPlan || "FREE";
    // Return all models but mark which ones are accessible
    return AVAILABLE_MODELS.map(model => ({
      ...model,
      accessible: canAccessModel(plan, model.requiredPlan),
    }));
  },
});

// Get logo-optimized models for a user's plan
export const getLogoModels = query({
  args: {
    userPlan: v.optional(v.union(v.literal("FREE"), v.literal("PRO"), v.literal("BUSINESS"))),
  },
  handler: async (_ctx, args) => {
    const plan = args.userPlan || "FREE";
    return LOGO_MODELS.map(model => ({
      ...model,
      accessible: canAccessModel(plan, model.requiredPlan),
    }));
  },
});

// Get available aspect ratios
export const getAspectRatios = query({
  args: {},
  handler: async () => {
    return ASPECT_RATIOS;
  },
});

// Check if a specific model is accessible for a plan
export const checkModelAccess = query({
  args: {
    modelId: v.string(),
    userPlan: v.union(v.literal("FREE"), v.literal("PRO"), v.literal("BUSINESS")),
  },
  handler: async (_ctx, args) => {
    const allModels = [...AVAILABLE_MODELS, ...LOGO_MODELS];
    const model = allModels.find(m => m.id === args.modelId);

    if (!model) {
      return { accessible: false, reason: "Model not found" };
    }

    const accessible = canAccessModel(args.userPlan, model.requiredPlan);
    return {
      accessible,
      reason: accessible ? null : `This model requires ${model.requiredPlan} plan`,
      requiredPlan: model.requiredPlan,
    };
  },
});
