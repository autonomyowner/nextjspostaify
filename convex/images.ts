import { query } from "./_generated/server";

// Available image models
export const AVAILABLE_MODELS = [
  { id: "fal-ai/flux/schnell", name: "Flux Schnell", speed: "fast" },
  { id: "fal-ai/flux/dev", name: "Flux Dev", speed: "slow" },
  { id: "fal-ai/stable-diffusion-v3-medium", name: "SD3 Medium", speed: "medium" },
];

// Logo-optimized models (Ideogram excels at logos and text)
export const LOGO_MODELS = [
  { id: "fal-ai/ideogram/v2/turbo", name: "Ideogram Turbo", speed: "fast", description: "Best for logos" },
  { id: "fal-ai/ideogram/v2", name: "Ideogram V2", speed: "medium", description: "High quality logos" },
  { id: "fal-ai/flux/dev", name: "Flux Dev", speed: "slow", description: "Alternative" },
];

// Available aspect ratios
export const ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "9:16", label: "Portrait (9:16)" },
  { value: "4:3", label: "Standard (4:3)" },
  { value: "3:4", label: "Portrait (3:4)" },
];

// Get available models
export const getModels = query({
  args: {},
  handler: async () => {
    return AVAILABLE_MODELS;
  },
});

// Get logo-optimized models
export const getLogoModels = query({
  args: {},
  handler: async () => {
    return LOGO_MODELS;
  },
});

// Get available aspect ratios
export const getAspectRatios = query({
  args: {},
  handler: async () => {
    return ASPECT_RATIOS;
  },
});
