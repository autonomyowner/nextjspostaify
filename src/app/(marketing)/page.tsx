import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing'
import { SoftwareSchema, OrganizationSchema } from '@/components/seo/SoftwareSchema'

export const metadata: Metadata = {
  title: 'POSTAIFY - AI-Powered Social Media Automation',
  description:
    'Generate 30 posts for 5 platforms in under 15 minutes. AI content, Flux images (1024x1024px in 8 seconds), ElevenLabs voiceovers, YouTube repurposing. Free: 2 brands, 20 posts, 5 AI images/month.',
  keywords: [
    'AI content generator',
    'social media automation',
    'YouTube to LinkedIn posts',
    'AI image generator',
    'AI voiceover generator',
    'Buffer alternative',
    'Hootsuite alternative',
    'social media scheduling',
  ],
  openGraph: {
    title: 'POSTAIFY - 30 Days of Content in 15 Minutes',
    description:
      'AI-powered social media automation. Generate content, images, and voiceovers for Instagram, LinkedIn, Twitter, TikTok, and Facebook.',
    type: 'website',
  },
}

// FAQ data for JSON-LD schema (must be hardcoded for server-side rendering)
const faqData = [
  {
    question: 'What is POSTAIFY?',
    answer: 'POSTAIFY is an AI-powered social media automation platform. It helps you create brands, generate social media content with AI, and schedule posts automatically across all platforms.',
  },
  {
    question: 'How does AI content generation work?',
    answer: "You set up your brand's voice and style, then our AI generates engaging posts tailored to your brand. You can generate content for Instagram, Facebook, TikTok, LinkedIn, and more.",
  },
  {
    question: 'Do I need technical knowledge to use POSTAIFY?',
    answer: 'No! The platform is designed to be simple. Just create your brand, click generate, and get professional content instantly. No coding or technical skills required.',
  },
  {
    question: 'What social media platforms are supported?',
    answer: 'We support all major social platforms including Instagram, Facebook, TikTok, LinkedIn, Twitter/X, and more. You can manage all your content from one dashboard.',
  },
  {
    question: 'Can I manage multiple brands?',
    answer: 'Yes! Depending on your plan, you can manage 2 to unlimited brands. Each brand has its own voice, style, and content. Perfect for agencies and businesses with multiple products.',
  },
  {
    question: 'How many posts can I create per month?',
    answer: 'The Free plan includes 20 posts, Pro plan includes 1,000 posts, and Business plan includes up to 90,000 posts per month. Upgrade anytime as you grow.',
  },
  {
    question: 'What AI models does POSTAIFY use for image generation?',
    answer: 'POSTAIFY uses Flux Schnell (8-second generation), Flux Dev, and Flux Pro 1.1 for 1024x1024px photorealistic images. Logos use Ideogram V2 Turbo. Product shots use Bria Product Shot AI.',
  },
  {
    question: 'How many posts can I generate from one YouTube video?',
    answer: '5-10 optimized posts from a single video. A 10-minute video yields 7-8 posts for LinkedIn, Twitter, Instagram, TikTok, and Facebook.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes! There are no long-term contracts. You can cancel or change your plan anytime from your dashboard.',
  },
]

export default function HomePage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <SoftwareSchema
        name="POSTAIFY"
        description="AI-powered social media automation platform. Generate 30 days of content for 5 platforms in under 15 minutes with AI images and voiceovers."
        features={[
          'Generate 30 days of content in 15 minutes',
          'Flux AI Image Generation (1024x1024px in 8 seconds)',
          '11 ElevenLabs AI voices for voiceovers',
          'YouTube to social media (5-10 posts per video)',
          'Multi-platform: Instagram, LinkedIn, Twitter, TikTok, Facebook',
          'Ideogram V2 Turbo for logo generation',
          'Bria Product Shot AI for e-commerce photography',
        ]}
        price="0"
        applicationCategory="BusinessApplication"
        operatingSystem="Web"
      />
      <OrganizationSchema
        name="POSTAIFY"
        url="https://postaify.com"
        description="AI-powered social media automation for content creators and businesses."
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <LandingPage />
    </>
  )
}
