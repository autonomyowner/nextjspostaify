import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing'

export const metadata: Metadata = {
  title: 'POSTAIFY - AI-Powered Social Media Automation',
  description: 'Create brands, generate AI content, and schedule posts automatically. Turn YouTube videos into viral social media content with AI voice, images, and multi-platform publishing.',
  keywords: ['AI content', 'social media automation', 'YouTube to posts', 'AI voice generator', 'AI image generator'],
  openGraph: {
    title: 'POSTAIFY - AI-Powered Social Media Automation',
    description: 'Turn YouTube videos into viral social media content. AI voice, images, and multi-platform publishing.',
    type: 'website',
  },
}

export default function HomePage() {
  return <LandingPage />
}
