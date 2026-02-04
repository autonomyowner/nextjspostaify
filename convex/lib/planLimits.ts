export const PLAN_LIMITS = {
  FREE: {
    maxBrands: 2,
    maxPostsPerMonth: 20,
    hasImageGeneration: true, // Limited to 5/month - taste to convert
    hasVoiceover: true, // Limited to 2/month - taste to convert
    hasVideoRepurpose: false,
    maxImagesPerMonth: 5,
    maxVoiceoversPerMonth: 2,
  },
  PRO: {
    maxBrands: 5,
    maxPostsPerMonth: 1000,
    hasImageGeneration: true,
    hasVoiceover: true,
    hasVideoRepurpose: true,
    maxImagesPerMonth: 100,
    maxVoiceoversPerMonth: 30,
  },
  BUSINESS: {
    maxBrands: 999,
    maxPostsPerMonth: 90000,
    hasImageGeneration: true,
    hasVoiceover: true,
    hasVideoRepurpose: true,
    maxImagesPerMonth: 500,
    maxVoiceoversPerMonth: 150,
  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;
export type PlanLimits = (typeof PLAN_LIMITS)[Plan];

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}
