export const PLAN_LIMITS = {
  FREE: {
    maxBrands: 2,
    maxPostsPerMonth: 20,
    hasImageGeneration: false,
    hasVoiceover: false,
    hasVideoRepurpose: false,
  },
  PRO: {
    maxBrands: 5,
    maxPostsPerMonth: 1000,
    hasImageGeneration: true,
    hasVoiceover: true,
    hasVideoRepurpose: true,
  },
  BUSINESS: {
    maxBrands: 999,
    maxPostsPerMonth: 90000,
    hasImageGeneration: true,
    hasVoiceover: true,
    hasVideoRepurpose: true,
  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;
export type PlanLimits = (typeof PLAN_LIMITS)[Plan];

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}
