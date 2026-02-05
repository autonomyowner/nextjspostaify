export interface Competitor {
  slug: string
  name: string
  tagline: string
  category: string
  monthlyPrice: string
  yearlyPrice?: string
  description: string
  pros: string[]
  cons: string[]
  bestFor: string
  features: {
    name: string
    competitor: string | boolean
    postaify: string | boolean
  }[]
  faqs: {
    question: string
    answer: string
  }[]
}

export const competitors: Record<string, Competitor> = {
  buffer: {
    slug: 'buffer',
    name: 'Buffer',
    tagline: 'Social Media Scheduling Tool',
    category: 'Scheduling',
    monthlyPrice: '$60',
    yearlyPrice: '$480',
    description:
      'Buffer is a social media management platform focused on scheduling and publishing.',
    bestFor: 'Users who only need scheduling without AI content generation',
    pros: [
      'Clean, simple interface',
      'Good mobile app',
      'Established company since 2010',
    ],
    cons: [
      'No AI content generation',
      'No AI image generation',
      'No voiceover features',
      'Expensive for multiple channels ($60/mo for 5)',
    ],
    features: [
      {
        name: 'AI Content Generation',
        competitor: false,
        postaify: '1,000 posts/month (Pro)',
      },
      {
        name: 'AI Image Generation',
        competitor: false,
        postaify: '200 images/month (Pro)',
      },
      {
        name: 'AI Voiceovers',
        competitor: false,
        postaify: '30 voiceovers/month (Pro)',
      },
      {
        name: 'YouTube Repurposing',
        competitor: false,
        postaify: '5-10 posts per video',
      },
      {
        name: 'Post Scheduling',
        competitor: true,
        postaify: true,
      },
      {
        name: 'Multi-platform Support',
        competitor: '5 channels',
        postaify: '5 platforms included',
      },
      {
        name: 'Monthly Price',
        competitor: '$60/mo (5 channels)',
        postaify: '$19/mo',
      },
    ],
    faqs: [
      {
        question: 'Can Buffer generate AI content like POSTAIFY?',
        answer:
          'No, Buffer focuses on scheduling and analytics. It does not generate content, images, or voiceovers. You need to create content yourself or use a separate AI tool.',
      },
      {
        question: 'Is POSTAIFY cheaper than Buffer?',
        answer:
          "Yes. POSTAIFY Pro costs $19/month and includes AI content generation, 200 AI images, and 30 voiceovers. Buffer's comparable plan (5 channels) costs $60/month without any AI features.",
      },
      {
        question: 'Can I switch from Buffer to POSTAIFY?',
        answer:
          'Yes. POSTAIFY handles scheduling like Buffer does, plus generates your content. You can start with our free plan to test it before switching.',
      },
    ],
  },
  hootsuite: {
    slug: 'hootsuite',
    name: 'Hootsuite',
    tagline: 'Enterprise Social Media Management',
    category: 'Scheduling',
    monthlyPrice: '$99',
    yearlyPrice: '$948',
    description:
      'Hootsuite is an enterprise social media management platform with team collaboration features.',
    bestFor: 'Large enterprises needing extensive team collaboration tools',
    pros: [
      'Enterprise-grade features',
      'Extensive integrations',
      'Team collaboration',
    ],
    cons: [
      'Expensive ($99/mo minimum)',
      'Complex learning curve',
      'Limited AI features',
      'OwlyWriter AI is basic compared to dedicated tools',
    ],
    features: [
      {
        name: 'AI Content Generation',
        competitor: 'OwlyWriter AI (basic)',
        postaify: '1,000 posts/month (Pro)',
      },
      {
        name: 'AI Image Generation',
        competitor: false,
        postaify: '200 images/month (Pro)',
      },
      {
        name: 'AI Voiceovers',
        competitor: false,
        postaify: '30 voiceovers/month (Pro)',
      },
      {
        name: 'YouTube Repurposing',
        competitor: false,
        postaify: '5-10 posts per video',
      },
      {
        name: 'Post Scheduling',
        competitor: true,
        postaify: true,
      },
      {
        name: 'Team Collaboration',
        competitor: 'Advanced',
        postaify: 'Business plan',
      },
      {
        name: 'Monthly Price',
        competitor: '$99/mo',
        postaify: '$19/mo',
      },
    ],
    faqs: [
      {
        question: 'How does POSTAIFY compare to Hootsuite for AI content?',
        answer:
          "Hootsuite's OwlyWriter AI provides basic caption suggestions. POSTAIFY generates complete posts with brand voice matching, AI images (Flux Pro 1.1), and voiceovers (ElevenLabs) - all for $19/mo vs $99/mo.",
      },
      {
        question: 'Is Hootsuite worth it for small businesses?',
        answer:
          'Hootsuite is designed for enterprises with large teams. At $99/mo minimum, small businesses often find POSTAIFY ($19/mo) more cost-effective with better AI content generation.',
      },
      {
        question: 'Can POSTAIFY replace Hootsuite?',
        answer:
          'For content creation and scheduling, yes. POSTAIFY generates 30 days of content in 15 minutes. If you need enterprise team management, Hootsuite may still be relevant.',
      },
    ],
  },
  jasper: {
    slug: 'jasper',
    name: 'Jasper AI',
    tagline: 'AI Writing Assistant',
    category: 'AI Content',
    monthlyPrice: '$49',
    yearlyPrice: '$468',
    description:
      'Jasper is an AI writing assistant for marketing teams and content creators.',
    bestFor: 'Users who need long-form content like blog posts and ads',
    pros: [
      'Strong long-form content',
      'Brand voice training',
      'Marketing templates',
    ],
    cons: [
      'No built-in scheduling',
      'No image generation (needs separate subscription)',
      'No voiceover features',
      '$49/mo for Creator plan',
    ],
    features: [
      {
        name: 'AI Content Generation',
        competitor: 'Unlimited words',
        postaify: '1,000 posts/month (Pro)',
      },
      {
        name: 'AI Image Generation',
        competitor: 'Jasper Art ($20/mo extra)',
        postaify: '200 images/month included',
      },
      {
        name: 'AI Voiceovers',
        competitor: false,
        postaify: '30 voiceovers/month (Pro)',
      },
      {
        name: 'Post Scheduling',
        competitor: false,
        postaify: 'Built-in calendar',
      },
      {
        name: 'YouTube Repurposing',
        competitor: false,
        postaify: '5-10 posts per video',
      },
      {
        name: 'Brand Voice',
        competitor: true,
        postaify: true,
      },
      {
        name: 'Monthly Price',
        competitor: '$49/mo (+$20 for images)',
        postaify: '$19/mo (all-in-one)',
      },
    ],
    faqs: [
      {
        question: 'What can POSTAIFY do that Jasper cannot?',
        answer:
          'POSTAIFY includes scheduling, AI images (Flux Pro 1.1), voiceovers (ElevenLabs), and YouTube repurposing in one $19/mo package. Jasper charges $49/mo for content only, plus $20/mo extra for images.',
      },
      {
        question: 'Is Jasper better for social media content?',
        answer:
          'Jasper is optimized for long-form content. POSTAIFY is purpose-built for social media with platform-specific formatting, optimal posting times, and visual content calendar.',
      },
      {
        question: 'Can I use both Jasper and POSTAIFY?',
        answer:
          'Yes, but POSTAIFY handles the full social media workflow. Use Jasper for blog posts, and POSTAIFY to repurpose that content into social posts automatically.',
      },
    ],
  },
  midjourney: {
    slug: 'midjourney',
    name: 'Midjourney',
    tagline: 'AI Image Generation',
    category: 'AI Images',
    monthlyPrice: '$10',
    yearlyPrice: '$96',
    description:
      'Midjourney is an AI image generation tool known for artistic and creative outputs.',
    bestFor: 'Artists and designers needing highly creative AI artwork',
    pros: [
      'Exceptional artistic quality',
      'Strong community',
      'Discord-based workflow',
    ],
    cons: [
      'Image-only (no content or scheduling)',
      'Requires separate tools for everything else',
      'Discord interface learning curve',
      'No social media workflow',
    ],
    features: [
      {
        name: 'AI Content Generation',
        competitor: false,
        postaify: '1,000 posts/month (Pro)',
      },
      {
        name: 'AI Image Generation',
        competitor: '200 images/mo ($10)',
        postaify: '200 images/month (Pro)',
      },
      {
        name: 'AI Voiceovers',
        competitor: false,
        postaify: '30 voiceovers/month (Pro)',
      },
      {
        name: 'Post Scheduling',
        competitor: false,
        postaify: 'Built-in calendar',
      },
      {
        name: 'Logo Generation',
        competitor: 'Basic',
        postaify: 'Ideogram V2 Turbo',
      },
      {
        name: 'Product Photography',
        competitor: false,
        postaify: 'Bria Product Shot AI',
      },
      {
        name: 'Social Media Workflow',
        competitor: false,
        postaify: 'Full workflow',
      },
    ],
    faqs: [
      {
        question: 'Should I use Midjourney or POSTAIFY for social media images?',
        answer:
          'POSTAIFY is designed for social media workflows. It generates images AND creates posts, schedules them, and handles voiceovers. Midjourney generates images only - you still need separate tools for everything else.',
      },
      {
        question: 'How does POSTAIFY image quality compare to Midjourney?',
        answer:
          'POSTAIFY uses Flux Pro 1.1 for photorealistic images (1024x1024px in 8 seconds). Midjourney excels at artistic styles. For social media marketing, Flux images perform excellently.',
      },
      {
        question: 'Can I use Midjourney images in POSTAIFY?',
        answer:
          'Yes, you can upload any images to POSTAIFY. However, POSTAIFY Pro includes 200 AI images/month, so you may not need Midjourney separately.',
      },
    ],
  },
  taplio: {
    slug: 'taplio',
    name: 'Taplio',
    tagline: 'LinkedIn Growth Tool',
    category: 'LinkedIn',
    monthlyPrice: '$49',
    yearlyPrice: '$468',
    description:
      'Taplio is a LinkedIn-specific tool for content creation and growth.',
    bestFor: 'Users focused exclusively on LinkedIn personal branding',
    pros: [
      'LinkedIn-specific features',
      'Carousel creator',
      'LinkedIn analytics',
    ],
    cons: [
      'LinkedIn only - no other platforms',
      '$49/mo for one platform',
      'No image generation',
      'No voiceover features',
    ],
    features: [
      {
        name: 'AI Content Generation',
        competitor: 'LinkedIn only',
        postaify: '5 platforms included',
      },
      {
        name: 'AI Image Generation',
        competitor: false,
        postaify: '200 images/month (Pro)',
      },
      {
        name: 'AI Voiceovers',
        competitor: false,
        postaify: '30 voiceovers/month (Pro)',
      },
      {
        name: 'YouTube Repurposing',
        competitor: false,
        postaify: '5-10 posts per video',
      },
      {
        name: 'Platforms Supported',
        competitor: 'LinkedIn only',
        postaify: 'Instagram, LinkedIn, Twitter, TikTok, Facebook',
      },
      {
        name: 'Carousel Creator',
        competitor: true,
        postaify: 'Coming soon',
      },
      {
        name: 'Monthly Price',
        competitor: '$49/mo (1 platform)',
        postaify: '$19/mo (5 platforms)',
      },
    ],
    faqs: [
      {
        question: 'Is Taplio or POSTAIFY better for LinkedIn?',
        answer:
          "Taplio specializes in LinkedIn with features like carousel creation. POSTAIFY handles LinkedIn plus 4 other platforms for $19/mo vs Taplio's $49/mo. If you only need LinkedIn, compare features. If you need multiple platforms, POSTAIFY is more cost-effective.",
      },
      {
        question: 'Can POSTAIFY create LinkedIn carousels like Taplio?',
        answer:
          'Carousel creation is coming to POSTAIFY. Currently, POSTAIFY excels at text posts, AI images, and voiceovers for LinkedIn and 4 other platforms at $19/mo.',
      },
      {
        question: 'Does POSTAIFY have LinkedIn analytics like Taplio?',
        answer:
          "POSTAIFY focuses on content creation rather than platform analytics. For LinkedIn analytics, you can use LinkedIn's native tools alongside POSTAIFY.",
      },
    ],
  },
}

export const competitorSlugs = Object.keys(competitors)

export function getCompetitor(slug: string): Competitor | undefined {
  return competitors[slug]
}
