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

export default function HomePage() {
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
        url="https://www.postaify.com"
        description="AI-powered social media automation for content creators and businesses."
      />
      <LandingPage />
    </>
  )
}
