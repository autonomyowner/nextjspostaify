export const PLAN_LIMITS = {
  FREE: {
    maxBrands: 2,
    maxPostsPerMonth: 20,
    hasImageGeneration: true, // Limited to 5/month - taste to convert
    hasVoiceover: true, // Limited to 2/month - taste to convert
    hasVideoRepurpose: false,
    hasLogoGeneration: false, // Logo mode requires PRO
    hasProductPhotography: false, // Product mode requires PRO
    maxImagesPerMonth: 5,
    maxVoiceoversPerMonth: 2,
    maxVoiceProfiles: 1, // Voice cloning profiles
  },
  PRO: {
    maxBrands: 5,
    maxPostsPerMonth: 1000,
    hasImageGeneration: true,
    hasVoiceover: true,
    hasVideoRepurpose: true,
    hasLogoGeneration: true,
    hasProductPhotography: true,
    maxImagesPerMonth: 200, // Doubled from 100 due to cost savings
    maxVoiceoversPerMonth: 30,
    maxVoiceProfiles: 3, // Voice cloning profiles
  },
  BUSINESS: {
    maxBrands: 999,
    maxPostsPerMonth: 90000,
    hasImageGeneration: true,
    hasVoiceover: true,
    hasVideoRepurpose: true,
    hasLogoGeneration: true,
    hasProductPhotography: true,
    maxImagesPerMonth: 1000, // Doubled from 500 due to cost savings
    maxVoiceoversPerMonth: 150,
    maxVoiceProfiles: 999, // Unlimited voice cloning profiles
  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;
export type PlanLimits = (typeof PLAN_LIMITS)[Plan];

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

// Model tier requirements
export const MODEL_TIERS = {
  // Image models
  "fal-ai/flux/schnell": "FREE",
  "fal-ai/flux/dev": "PRO",
  "fal-ai/flux-pro/v1.1": "PRO",
  "fal-ai/recraft-v3": "BUSINESS",
  // Logo models
  "fal-ai/ideogram/v2/turbo": "PRO",
  "fal-ai/ideogram/v2": "PRO",
  // Product photography
  "fal-ai/bria/product-shot": "PRO",
} as const;

export function getModelRequiredPlan(modelId: string): Plan {
  return MODEL_TIERS[modelId as keyof typeof MODEL_TIERS] || "FREE";
}

export function canAccessModel(userPlan: Plan, modelId: string): boolean {
  const requiredPlan = getModelRequiredPlan(modelId);
  const planHierarchy: Record<Plan, number> = {
    FREE: 0,
    PRO: 1,
    BUSINESS: 2,
  };
  return planHierarchy[userPlan] >= planHierarchy[requiredPlan];
}
