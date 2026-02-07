import type { Metadata } from 'next'
import YouTubeSummaryClient from './youtube-summary-client'

export const metadata: Metadata = {
  title: 'Free YouTube Video Summarizer | POSTAIFY',
  description: 'Instantly summarize any YouTube video with AI. Get key takeaways in seconds. Free tool, no signup required.',
  keywords: ['youtube summarizer', 'summarize youtube video', 'youtube summary', 'video summary tool', 'ai video summary'],
  openGraph: {
    title: 'Free YouTube Video Summarizer',
    description: 'Get AI-powered summaries of any YouTube video in seconds.',
    url: 'https://postaify.com/youtube-summary',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free YouTube Video Summarizer',
    description: 'Get AI-powered summaries of any YouTube video in seconds.',
  },
  alternates: {
    canonical: 'https://postaify.com/youtube-summary',
  },
}

export default function YouTubeSummaryPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Free YouTube Video Summarizer',
    description: 'AI-powered YouTube video summarization tool',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <YouTubeSummaryClient />
    </>
  )
}
