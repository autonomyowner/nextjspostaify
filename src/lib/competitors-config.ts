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
  canva: {
    slug: 'canva',
    name: 'Canva',
    tagline: 'Online Design Platform',
    category: 'Design',
    monthlyPrice: '$13',
    yearlyPrice: '$120',
    description:
      'Canva is a graphic design platform with templates, AI image generation, and basic social media scheduling.',
    bestFor: 'Users who need visual design templates and basic social media graphics',
    pros: [
      'Massive template library',
      'Easy drag-and-drop editor',
      'AI image generation (Magic Media)',
      'Brand kit management',
    ],
    cons: [
      'AI text generation is basic',
      'No multi-platform post optimization',
      'No voiceover features',
      'No YouTube repurposing',
    ],
    features: [
      {
        name: 'AI Content Generation',
        competitor: 'Magic Write (basic)',
        postaify: '1,000 posts/month (Pro)',
      },
      {
        name: 'AI Image Generation',
        competitor: 'Magic Media',
        postaify: 'Flux Pro 1.1 (200/month)',
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
        name: 'Design Templates',
        competitor: '250,000+ templates',
        postaify: 'AI-generated designs',
      },
      {
        name: 'Brand Voice Cloning',
        competitor: false,
        postaify: 'Analyzes your writing style',
      },
      {
        name: 'Monthly Price',
        competitor: '$13/mo (Pro)',
        postaify: '$19/mo (all-in-one)',
      },
    ],
    faqs: [
      {
        question: 'Is POSTAIFY better than Canva for social media?',
        answer:
          'Canva excels at visual design with templates. POSTAIFY excels at AI content generation, voiceovers, and multi-platform optimization. For a complete social media workflow (content + images + scheduling), POSTAIFY is more efficient. For graphic design, Canva offers more templates.',
      },
      {
        question: 'Can POSTAIFY replace Canva?',
        answer:
          'For social media content creation, yes. POSTAIFY generates AI images, posts, and voiceovers in one tool. However, if you need advanced graphic design features like photo editing or presentation creation, Canva is still useful.',
      },
      {
        question: 'Should I use both Canva and POSTAIFY?',
        answer:
          'Many users use POSTAIFY for content generation and scheduling, and Canva for custom graphic design. POSTAIFY Pro includes 200 AI images/month, reducing the need for Canva for most social media visuals.',
      },
    ],
  },
  later: {
    slug: 'later',
    name: 'Later',
    tagline: 'Social Media Scheduling & Link in Bio',
    category: 'Scheduling',
    monthlyPrice: '$25',
    yearlyPrice: '$200',
    description:
      'Later is a social media scheduling tool with a visual planner, link-in-bio feature, and Instagram-first approach.',
    bestFor: 'Instagram-focused creators who need visual planning and link-in-bio',
    pros: [
      'Visual content calendar',
      'Link-in-bio tool (Linkin.bio)',
      'Instagram-first features',
      'User-generated content discovery',
    ],
    cons: [
      'No AI content generation',
      'No AI image generation',
      'No voiceover features',
      'Limited to scheduling existing content',
    ],
    features: [
      {
        name: 'AI Content Generation',
        competitor: 'Caption writer (basic)',
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
        name: 'Visual Calendar',
        competitor: true,
        postaify: true,
      },
      {
        name: 'Link in Bio',
        competitor: 'Linkin.bio',
        postaify: false,
      },
      {
        name: 'Monthly Price',
        competitor: '$25/mo (Starter)',
        postaify: '$19/mo (Pro)',
      },
    ],
    faqs: [
      {
        question: 'Is POSTAIFY better than Later for social media?',
        answer:
          'POSTAIFY generates content with AI, while Later only schedules content you create yourself. If you want AI to write posts, generate images, and create voiceovers, POSTAIFY is better. If you only need scheduling with a visual planner, Later works.',
      },
      {
        question: 'Does POSTAIFY have a link-in-bio feature like Later?',
        answer:
          'Not currently. Later\'s Linkin.bio is a unique feature. However, POSTAIFY focuses on content creation, which is the bigger time investment. You can use free link-in-bio tools alongside POSTAIFY.',
      },
      {
        question: 'Can I switch from Later to POSTAIFY?',
        answer:
          'Yes. POSTAIFY handles scheduling plus generates your content with AI. Most Later users switch because they want AI content generation to save time on creating posts.',
      },
    ],
  },
  'sprout-social': {
    slug: 'sprout-social',
    name: 'Sprout Social',
    tagline: 'Enterprise Social Media Management',
    category: 'Enterprise',
    monthlyPrice: '$249',
    yearlyPrice: '$2,388',
    description:
      'Sprout Social is an enterprise social media management platform with advanced analytics, listening, and team collaboration.',
    bestFor: 'Large enterprises with dedicated social media teams and big budgets',
    pros: [
      'Enterprise-grade analytics',
      'Social listening tools',
      'Advanced team workflows',
      'CRM integration',
    ],
    cons: [
      'Extremely expensive ($249/mo minimum)',
      'Overkill for small businesses',
      'Limited AI content generation',
      'No AI image generation',
    ],
    features: [
      {
        name: 'AI Content Generation',
        competitor: 'AI Assist (suggestions only)',
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
        name: 'Social Listening',
        competitor: 'Advanced',
        postaify: false,
      },
      {
        name: 'Analytics',
        competitor: 'Enterprise-grade',
        postaify: 'Basic',
      },
      {
        name: 'YouTube Repurposing',
        competitor: false,
        postaify: '5-10 posts per video',
      },
      {
        name: 'Monthly Price',
        competitor: '$249/mo per user',
        postaify: '$19/mo',
      },
    ],
    faqs: [
      {
        question: 'Is POSTAIFY a good Sprout Social alternative?',
        answer:
          'For content creation and scheduling, POSTAIFY at $19/mo replaces the core features of Sprout Social at $249/mo. However, Sprout Social offers enterprise analytics, social listening, and CRM integrations that POSTAIFY does not. Choose based on your needs.',
      },
      {
        question: 'Why is Sprout Social so expensive compared to POSTAIFY?',
        answer:
          'Sprout Social targets enterprise teams with advanced analytics, social listening, approval workflows, and CRM integration. POSTAIFY focuses on AI content creation at 1/13th the cost. Most small businesses don\'t need Sprout Social\'s enterprise features.',
      },
      {
        question: 'Can a small business use POSTAIFY instead of Sprout Social?',
        answer:
          'Absolutely. POSTAIFY is built for small businesses and creators. At $19/mo vs $249/mo, you get AI content generation, images, voiceovers, and scheduling — the features that actually save time.',
      },
    ],
  },
  contentstudio: {
    slug: 'contentstudio',
    name: 'ContentStudio',
    tagline: 'Content Marketing & Social Media Tool',
    category: 'Content Marketing',
    monthlyPrice: '$25',
    yearlyPrice: '$240',
    description:
      'ContentStudio combines content discovery, planning, scheduling, and basic AI writing for social media management.',
    bestFor: 'Content marketers who need content discovery and curation alongside scheduling',
    pros: [
      'Content discovery and curation',
      'Multi-channel publishing',
      'Automation recipes',
      'Affordable pricing',
    ],
    cons: [
      'AI writing is basic',
      'No AI image generation',
      'No voiceover features',
      'No YouTube repurposing',
    ],
    features: [
      {
        name: 'AI Content Generation',
        competitor: 'AI Writer (basic)',
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
        name: 'Content Discovery',
        competitor: 'Built-in curation',
        postaify: false,
      },
      {
        name: 'YouTube Repurposing',
        competitor: false,
        postaify: '5-10 posts per video',
      },
      {
        name: 'Brand Voice Cloning',
        competitor: false,
        postaify: 'Analyzes your writing style',
      },
      {
        name: 'Monthly Price',
        competitor: '$25/mo (Starter)',
        postaify: '$19/mo (Pro)',
      },
    ],
    faqs: [
      {
        question: 'Is POSTAIFY better than ContentStudio?',
        answer:
          'POSTAIFY is better for AI-powered content creation — it generates posts, images, and voiceovers. ContentStudio is better for content curation and discovery. If you create original content, POSTAIFY saves more time.',
      },
      {
        question: 'Does ContentStudio have AI image generation?',
        answer:
          'No. ContentStudio offers basic AI text writing but no image generation, logo creation, or voiceovers. POSTAIFY includes Flux Pro 1.1 images (200/month), Ideogram logos, and ElevenLabs voiceovers.',
      },
      {
        question: 'Which is cheaper, ContentStudio or POSTAIFY?',
        answer:
          'POSTAIFY Pro ($19/mo) is cheaper than ContentStudio Starter ($25/mo) and includes AI images, voiceovers, and YouTube repurposing — features ContentStudio doesn\'t offer at any price.',
      },
    ],
  },
  socialbee: {
    slug: 'socialbee',
    name: 'SocialBee',
    tagline: 'Social Media Management with Content Categories',
    category: 'Scheduling',
    monthlyPrice: '$29',
    yearlyPrice: '$290',
    description:
      'SocialBee is a social media scheduling tool with content categorization, recycling, and basic AI caption writing.',
    bestFor: 'Users who want content category organization and post recycling',
    pros: [
      'Content categorization system',
      'Evergreen post recycling',
      'Canva integration',
      'Affordable for scheduling',
    ],
    cons: [
      'AI content generation is basic',
      'No AI image generation',
      'No voiceover features',
      'No YouTube repurposing',
    ],
    features: [
      {
        name: 'AI Content Generation',
        competitor: 'AI Post Generator (basic)',
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
        name: 'Content Recycling',
        competitor: 'Evergreen categories',
        postaify: false,
      },
      {
        name: 'Brand Voice Cloning',
        competitor: false,
        postaify: 'Analyzes your writing style',
      },
      {
        name: 'Monthly Price',
        competitor: '$29/mo (Bootstrap)',
        postaify: '$19/mo (Pro)',
      },
    ],
    faqs: [
      {
        question: 'Is POSTAIFY better than SocialBee?',
        answer:
          'POSTAIFY is better for AI content creation — generating posts, images, and voiceovers from scratch. SocialBee is better if you want content categorization and evergreen post recycling. POSTAIFY is also cheaper ($19/mo vs $29/mo).',
      },
      {
        question: 'Does SocialBee have AI image generation?',
        answer:
          'No. SocialBee integrates with Canva for design but doesn\'t generate AI images. POSTAIFY includes 200 Flux Pro 1.1 AI images per month, plus Ideogram logo generation and Bria product photography.',
      },
      {
        question: 'Can I use SocialBee and POSTAIFY together?',
        answer:
          'You could, but POSTAIFY handles both content creation and scheduling. Most users find POSTAIFY alone covers their needs at a lower price ($19/mo vs $29/mo).',
      },
    ],
  },
  'copy-ai': {
    slug: 'copy-ai',
    name: 'Copy.ai',
    tagline: 'AI Marketing Copy Generator',
    category: 'AI Content',
    monthlyPrice: '$49',
    yearlyPrice: '$432',
    description:
      'Copy.ai is an AI writing tool focused on marketing copy, ad text, email sequences, and product descriptions.',
    bestFor: 'Marketing teams needing ad copy, email sequences, and sales content',
    pros: [
      'Excellent ad copy and email generation',
      'Workflow automation (Workflows)',
      'Multiple AI models',
      'Good for sales teams',
    ],
    cons: [
      'Limited social media features',
      'No AI image generation',
      'No scheduling or publishing',
      'No voiceover features',
    ],
    features: [
      {
        name: 'AI Content Generation',
        competitor: 'Marketing copy focus',
        postaify: 'Social media focus (5 platforms)',
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
        name: 'Email Marketing Copy',
        competitor: 'Advanced',
        postaify: false,
      },
      {
        name: 'Monthly Price',
        competitor: '$49/mo (Pro)',
        postaify: '$19/mo (Pro)',
      },
    ],
    faqs: [
      {
        question: 'Is POSTAIFY better than Copy.ai for social media?',
        answer:
          'Yes. POSTAIFY is purpose-built for social media with platform-specific formatting, AI images, voiceovers, and scheduling. Copy.ai focuses on marketing copy (ads, emails, product descriptions) without social media publishing.',
      },
      {
        question: 'Is Copy.ai or POSTAIFY cheaper?',
        answer:
          'POSTAIFY Pro is $19/mo. Copy.ai Pro is $49/mo. POSTAIFY also includes AI images and voiceovers that Copy.ai doesn\'t offer at any price.',
      },
      {
        question: 'Can I use Copy.ai for social media posts?',
        answer:
          'Copy.ai can generate social media text, but it doesn\'t schedule posts, generate images, create voiceovers, or repurpose YouTube videos. For a complete social media workflow, POSTAIFY is more efficient.',
      },
    ],
  },
}

export const competitorSlugs = Object.keys(competitors)

export function getCompetitor(slug: string): Competitor | undefined {
  return competitors[slug]
}
