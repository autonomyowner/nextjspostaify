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
