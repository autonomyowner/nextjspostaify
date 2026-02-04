// Platform-specific image prompt templates for POSTAIFY
// These templates are optimized for each social media platform's best practices

export interface PromptTemplate {
  id: string;
  name: string;
  platform: 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'facebook' | 'youtube' | 'general';
  category: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  basePrompt: string;
  variables: string[];
  description: string;
  tips?: string;
}

// Instagram Templates (1:1 square and 9:16 stories)
const instagramTemplates: PromptTemplate[] = [
  {
    id: 'ig-flatlay',
    name: 'Product Flat Lay',
    platform: 'instagram',
    category: 'Product',
    aspectRatio: '1:1',
    basePrompt: 'top-down flat lay product photography of {product_type}, clean {surface_type} surface, soft natural lighting, minimal props, negative space for text overlay, Instagram aesthetic',
    variables: ['product_type', 'surface_type'],
    description: 'Perfect for product showcases with space for captions',
    tips: 'Best for e-commerce products, cosmetics, food items',
  },
  {
    id: 'ig-lifestyle',
    name: 'Lifestyle Moment',
    platform: 'instagram',
    category: 'Lifestyle',
    aspectRatio: '1:1',
    basePrompt: 'candid lifestyle photography, {subject} in {setting}, warm natural lighting, authentic moment, Instagram worthy, cozy aesthetic, shallow depth of field',
    variables: ['subject', 'setting'],
    description: 'Authentic lifestyle shots for brand storytelling',
  },
  {
    id: 'ig-quote-bg',
    name: 'Quote Background',
    platform: 'instagram',
    category: 'Content',
    aspectRatio: '1:1',
    basePrompt: 'abstract {color_scheme} gradient background, soft texture, space for text overlay, motivational aesthetic, clean minimal design, Instagram quote post',
    variables: ['color_scheme'],
    description: 'Backgrounds designed for text overlay quotes',
  },
  {
    id: 'ig-story-announcement',
    name: 'Story Announcement',
    platform: 'instagram',
    category: 'Content',
    aspectRatio: '9:16',
    basePrompt: 'vertical Instagram story graphic, {theme} aesthetic, bold visual impact, {color} accent colors, modern design, space for announcement text, eye-catching',
    variables: ['theme', 'color'],
    description: 'Vertical story format for announcements',
  },
  {
    id: 'ig-aesthetic-food',
    name: 'Food Photography',
    platform: 'instagram',
    category: 'Food',
    aspectRatio: '1:1',
    basePrompt: 'appetizing food photography of {dish_type}, beautiful plating, {style} restaurant style, natural window light, garnished perfectly, Instagram foodie aesthetic',
    variables: ['dish_type', 'style'],
    description: 'Restaurant-quality food shots',
  },
];

// LinkedIn Templates (professional 16:9 and 1:1)
const linkedinTemplates: PromptTemplate[] = [
  {
    id: 'li-professional-headshot-bg',
    name: 'Professional Background',
    platform: 'linkedin',
    category: 'Professional',
    aspectRatio: '16:9',
    basePrompt: 'professional corporate background, {setting_type}, clean modern office aesthetic, soft professional lighting, subtle blur, executive business environment, LinkedIn banner style',
    variables: ['setting_type'],
    description: 'Professional backgrounds for business content',
  },
  {
    id: 'li-team-collaboration',
    name: 'Team Collaboration',
    platform: 'linkedin',
    category: 'Business',
    aspectRatio: '16:9',
    basePrompt: 'professional team collaboration scene, diverse group in modern {office_type}, positive work environment, natural lighting, corporate photography, LinkedIn business post',
    variables: ['office_type'],
    description: 'Team and workplace imagery',
  },
  {
    id: 'li-data-visualization',
    name: 'Data Visualization',
    platform: 'linkedin',
    category: 'Business',
    aspectRatio: '16:9',
    basePrompt: 'clean data visualization background, {chart_type} aesthetic, professional blue and white color scheme, modern infographic style, business analytics, LinkedIn post graphic',
    variables: ['chart_type'],
    description: 'Backgrounds for data and analytics content',
  },
  {
    id: 'li-thought-leadership',
    name: 'Thought Leadership',
    platform: 'linkedin',
    category: 'Content',
    aspectRatio: '1:1',
    basePrompt: 'professional minimalist background, {theme} concept, subtle gradient, space for text overlay, executive thought leadership style, LinkedIn carousel post',
    variables: ['theme'],
    description: 'For carousel posts and thought leadership',
  },
];

// Twitter/X Templates (16:9 landscape focus)
const twitterTemplates: PromptTemplate[] = [
  {
    id: 'tw-announcement',
    name: 'Eye-catching Announcement',
    platform: 'twitter',
    category: 'News',
    aspectRatio: '16:9',
    basePrompt: 'bold announcement graphic, {theme} themed, high contrast, attention-grabbing visual, {color} color scheme, modern design, Twitter/X post optimized',
    variables: ['theme', 'color'],
    description: 'Stand-out announcements for maximum engagement',
  },
  {
    id: 'tw-thread-header',
    name: 'Thread Header',
    platform: 'twitter',
    category: 'Content',
    aspectRatio: '16:9',
    basePrompt: 'Twitter thread header image, {topic} concept visualization, numbered series aesthetic, professional infographic style, space for title text, engaging visual hook',
    variables: ['topic'],
    description: 'Headers for viral thread content',
  },
  {
    id: 'tw-tech-news',
    name: 'Tech News',
    platform: 'twitter',
    category: 'Technology',
    aspectRatio: '16:9',
    basePrompt: 'technology news graphic, {tech_subject} visualization, futuristic aesthetic, digital circuit patterns, blue and purple glow, tech industry style, Twitter breaking news',
    variables: ['tech_subject'],
    description: 'Tech industry news and updates',
  },
  {
    id: 'tw-meme-template',
    name: 'Meme Template',
    platform: 'twitter',
    category: 'Humor',
    aspectRatio: '1:1',
    basePrompt: 'meme-worthy image, {scenario} situation, relatable expression, viral content potential, clear subject, space for caption, Twitter humor style',
    variables: ['scenario'],
    description: 'Templates for viral meme content',
  },
];

// TikTok/Reels Templates (9:16 vertical)
const tiktokTemplates: PromptTemplate[] = [
  {
    id: 'tt-thumbnail',
    name: 'Video Thumbnail',
    platform: 'tiktok',
    category: 'Content',
    aspectRatio: '9:16',
    basePrompt: 'TikTok thumbnail, {content_type} theme, vertical format, bold visual, high contrast text space at top and bottom, scroll-stopping image, Gen-Z aesthetic',
    variables: ['content_type'],
    description: 'Thumbnails that stop the scroll',
  },
  {
    id: 'tt-before-after',
    name: 'Before/After Split',
    platform: 'tiktok',
    category: 'Transformation',
    aspectRatio: '9:16',
    basePrompt: 'before and after split composition, {transformation_type}, dramatic contrast, vertical TikTok format, transformation reveal aesthetic, split screen visual',
    variables: ['transformation_type'],
    description: 'Transformation content templates',
  },
  {
    id: 'tt-tutorial-step',
    name: 'Tutorial Step',
    platform: 'tiktok',
    category: 'Educational',
    aspectRatio: '9:16',
    basePrompt: 'tutorial step visual, {tutorial_topic}, clean instructional style, numbered step indicator, vertical format, educational content, TikTok learn style',
    variables: ['tutorial_topic'],
    description: 'Educational and how-to content',
  },
  {
    id: 'tt-trending',
    name: 'Trending Aesthetic',
    platform: 'tiktok',
    category: 'Lifestyle',
    aspectRatio: '9:16',
    basePrompt: '{aesthetic_type} aesthetic, TikTok trending visual style, vertical format, moody lighting, viral content vibes, Gen-Z approved, aesthetically pleasing',
    variables: ['aesthetic_type'],
    description: 'Tap into trending visual aesthetics',
  },
];

// YouTube Templates (16:9 thumbnails)
const youtubeTemplates: PromptTemplate[] = [
  {
    id: 'yt-thumbnail-reaction',
    name: 'Reaction Thumbnail',
    platform: 'youtube',
    category: 'Entertainment',
    aspectRatio: '16:9',
    basePrompt: 'YouTube thumbnail, {subject} with expressive reaction, bold colors, high contrast, clear focal point, space for text on sides, click-worthy composition',
    variables: ['subject'],
    description: 'High-CTR reaction style thumbnails',
  },
  {
    id: 'yt-thumbnail-tutorial',
    name: 'Tutorial Thumbnail',
    platform: 'youtube',
    category: 'Educational',
    aspectRatio: '16:9',
    basePrompt: 'YouTube tutorial thumbnail, {tutorial_topic} visualization, step-by-step implied, professional yet approachable, clear subject, text space on right third',
    variables: ['tutorial_topic'],
    description: 'Educational content thumbnails',
  },
  {
    id: 'yt-thumbnail-listicle',
    name: 'Listicle Thumbnail',
    platform: 'youtube',
    category: 'Content',
    aspectRatio: '16:9',
    basePrompt: 'YouTube listicle thumbnail, {topic} theme, bold number visual element, grid composition suggestion, vibrant colors, high contrast, engaging visual',
    variables: ['topic'],
    description: '"Top 10" and list content thumbnails',
  },
];

// Facebook Templates
const facebookTemplates: PromptTemplate[] = [
  {
    id: 'fb-event-cover',
    name: 'Event Cover',
    platform: 'facebook',
    category: 'Events',
    aspectRatio: '16:9',
    basePrompt: 'Facebook event cover image, {event_type} theme, celebratory atmosphere, space for event title and date, inviting visual, community gathering aesthetic',
    variables: ['event_type'],
    description: 'Event promotion covers',
  },
  {
    id: 'fb-community-post',
    name: 'Community Post',
    platform: 'facebook',
    category: 'Engagement',
    aspectRatio: '1:1',
    basePrompt: 'Facebook community post image, {topic} discussion starter, warm and inviting, diverse and inclusive visual, engagement-focused, shareable content',
    variables: ['topic'],
    description: 'Posts designed for community engagement',
  },
];

// General Purpose Templates
const generalTemplates: PromptTemplate[] = [
  {
    id: 'gen-gradient-bg',
    name: 'Gradient Background',
    platform: 'general',
    category: 'Background',
    aspectRatio: '1:1',
    basePrompt: 'beautiful {color1} to {color2} gradient background, smooth transition, modern design, versatile use, clean minimal aesthetic',
    variables: ['color1', 'color2'],
    description: 'Versatile gradient backgrounds',
  },
  {
    id: 'gen-abstract-art',
    name: 'Abstract Art',
    platform: 'general',
    category: 'Art',
    aspectRatio: '1:1',
    basePrompt: 'abstract {style} art, {color_palette} color palette, modern artistic expression, unique visual, gallery quality, social media post worthy',
    variables: ['style', 'color_palette'],
    description: 'Artistic abstract visuals',
  },
  {
    id: 'gen-nature-scene',
    name: 'Nature Scene',
    platform: 'general',
    category: 'Nature',
    aspectRatio: '16:9',
    basePrompt: 'stunning {nature_type} photography, {time_of_day}, dramatic natural lighting, breathtaking landscape, travel inspiration, high quality nature shot',
    variables: ['nature_type', 'time_of_day'],
    description: 'Beautiful nature photography',
  },
];

// Export all templates organized by platform
export const PROMPT_TEMPLATES = {
  instagram: instagramTemplates,
  linkedin: linkedinTemplates,
  twitter: twitterTemplates,
  tiktok: tiktokTemplates,
  youtube: youtubeTemplates,
  facebook: facebookTemplates,
  general: generalTemplates,
};

// Get all templates as flat array
export const getAllTemplates = (): PromptTemplate[] => {
  return Object.values(PROMPT_TEMPLATES).flat();
};

// Get templates by platform
export const getTemplatesByPlatform = (platform: string): PromptTemplate[] => {
  return PROMPT_TEMPLATES[platform as keyof typeof PROMPT_TEMPLATES] || [];
};

// Get template by ID
export const getTemplateById = (id: string): PromptTemplate | undefined => {
  return getAllTemplates().find(t => t.id === id);
};

// Build final prompt from template and variables
export const buildPromptFromTemplate = (
  template: PromptTemplate,
  variables: Record<string, string>
): string => {
  let prompt = template.basePrompt;

  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
  }

  return prompt;
};

// Get suggested aspect ratio for a platform
export const getSuggestedAspectRatio = (platform: string): '1:1' | '16:9' | '9:16' => {
  const platformRatios: Record<string, '1:1' | '16:9' | '9:16'> = {
    instagram: '1:1',
    linkedin: '16:9',
    twitter: '16:9',
    tiktok: '9:16',
    youtube: '16:9',
    facebook: '1:1',
  };
  return platformRatios[platform] || '1:1';
};
