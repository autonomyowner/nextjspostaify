export interface ToolConfig {
  title: string
  description: string
  h1: string
  platform: string
  keyword: string
  features: string[]
  faqs: {
    question: string
    answer: string
  }[]
}

export const tools: Record<string, ToolConfig> = {
  'youtube-to-linkedin': {
    title: 'Free YouTube to LinkedIn Post Converter',
    description: 'Convert any YouTube video into engaging LinkedIn posts instantly. AI-powered, no signup required.',
    h1: 'Turn YouTube Videos into LinkedIn Posts',
    platform: 'LinkedIn',
    keyword: 'youtube to linkedin converter',
    features: [
      'Extract key insights from any YouTube video',
      'Generate professional LinkedIn-ready posts',
      'Include relevant hashtags and formatting',
      'Perfect for thought leadership content',
    ],
    faqs: [
      {
        question: 'How does the YouTube to LinkedIn converter work?',
        answer: 'Simply paste a YouTube video URL, and our AI extracts the transcript, analyzes the key points, and generates a professional LinkedIn post with relevant hashtags and formatting.',
      },
      {
        question: 'Is this tool free to use?',
        answer: 'Yes! You can convert one video for free. Enter your email to unlock the full post and get more conversions.',
      },
      {
        question: 'What types of YouTube videos work best?',
        answer: 'Educational content, tutorials, interviews, and thought leadership videos work great. The AI adapts the content to LinkedIn\'s professional tone.',
      },
    ],
  },
  'youtube-to-twitter': {
    title: 'YouTube to Twitter Thread Generator',
    description: 'Turn YouTube videos into viral Twitter threads in seconds. Free AI tool.',
    h1: 'Convert YouTube to Twitter Threads',
    platform: 'Twitter',
    keyword: 'youtube to twitter thread',
    features: [
      'Break down videos into engaging tweet threads',
      'Optimize for Twitter\'s character limits',
      'Add hooks and CTAs automatically',
      'Generate viral-ready content',
    ],
    faqs: [
      {
        question: 'How many tweets does the generator create?',
        answer: 'The AI analyzes your video content and creates an optimal thread length, typically 5-15 tweets depending on the video length and content density.',
      },
      {
        question: 'Can I edit the generated tweets?',
        answer: 'Absolutely! The generated thread is fully editable. You can copy individual tweets or the entire thread.',
      },
      {
        question: 'Does it work with any YouTube video?',
        answer: 'Yes, it works with most public YouTube videos that have captions or transcripts available.',
      },
    ],
  },
  'youtube-to-instagram': {
    title: 'YouTube to Instagram Caption Generator',
    description: 'Create Instagram captions from YouTube videos. Perfect hashtags included.',
    h1: 'YouTube to Instagram Captions',
    platform: 'Instagram',
    keyword: 'youtube to instagram caption',
    features: [
      'Extract compelling captions from video content',
      'Generate relevant hashtag sets',
      'Optimize for Instagram engagement',
      'Include emojis and formatting',
    ],
    faqs: [
      {
        question: 'Does this generate captions for Reels too?',
        answer: 'Yes! The generated captions work for both regular posts and Reels. The AI considers Instagram\'s best practices for engagement.',
      },
      {
        question: 'How many hashtags are included?',
        answer: 'We generate 10-15 relevant hashtags, mixing popular and niche tags for optimal reach.',
      },
      {
        question: 'Can I use this for carousel posts?',
        answer: 'Definitely! The caption works great for carousels, and you can use key points from the video as carousel slides.',
      },
    ],
  },
  'youtube-to-tiktok': {
    title: 'YouTube to TikTok Script Converter',
    description: 'Transform YouTube content into TikTok-ready scripts. Hook-first format.',
    h1: 'Convert YouTube to TikTok Scripts',
    platform: 'TikTok',
    keyword: 'youtube to tiktok script',
    features: [
      'Create hook-first TikTok scripts',
      'Optimize for short-form video',
      'Include trending sound suggestions',
      'Perfect pacing for engagement',
    ],
    faqs: [
      {
        question: 'How long are the generated TikTok scripts?',
        answer: 'Scripts are optimized for 15-60 second videos, with a strong hook in the first 3 seconds.',
      },
      {
        question: 'Does it suggest trending sounds?',
        answer: 'Yes! Based on your content type, we suggest relevant trending sounds and music styles.',
      },
      {
        question: 'Can I use this for YouTube Shorts too?',
        answer: 'Absolutely! The script format works perfectly for YouTube Shorts and Instagram Reels as well.',
      },
    ],
  },
  'youtube-to-facebook': {
    title: 'YouTube to Facebook Post Generator',
    description: 'Convert YouTube videos into shareable Facebook posts with AI.',
    h1: 'YouTube to Facebook Posts',
    platform: 'Facebook',
    keyword: 'youtube to facebook post',
    features: [
      'Create engaging Facebook posts',
      'Optimize for shares and comments',
      'Include video embed suggestions',
      'Perfect for pages and groups',
    ],
    faqs: [
      {
        question: 'Should I embed the video or just use the post?',
        answer: 'We recommend both! Post the text with the video embedded for maximum engagement. The AI generates posts that complement video embeds.',
      },
      {
        question: 'Does it work for Facebook Groups?',
        answer: 'Yes! The generated posts are perfect for groups, with conversation-starting hooks built in.',
      },
      {
        question: 'Can I schedule these posts?',
        answer: 'The generated post can be copied to Facebook\'s native scheduler or any social media management tool.',
      },
    ],
  },
}

// Phase 2 expansion (after initial traction):
// 'ai-voice-generator', 'ai-image-generator', 'youtube-transcript-extractor'

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return tools[slug]
}

export function getAllToolSlugs(): string[] {
  return Object.keys(tools)
}
