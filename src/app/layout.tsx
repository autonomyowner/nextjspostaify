import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { ConvexClientProvider } from '@/components/providers/convex-provider'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { DataProvider } from '@/context/DataContext'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.postaify.com'),
  title: {
    default: 'POSTAIFY - AI-Powered Social Media Automation',
    template: '%s | POSTAIFY',
  },
  description: 'Create brands, generate AI content, and schedule posts automatically. Turn YouTube videos into viral social media content with AI voice, images, and multi-platform publishing.',
  keywords: [
    'AI content generator',
    'social media automation',
    'YouTube to posts',
    'AI voice generator',
    'content scheduler',
    'AI social media',
    'post generator',
    'content repurposing',
    'multi-platform publishing',
  ],
  authors: [{ name: 'POSTAIFY' }],
  creator: 'POSTAIFY',
  publisher: 'POSTAIFY',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.postaify.com',
    siteName: 'POSTAIFY',
    title: 'POSTAIFY - AI-Powered Social Media Automation',
    description: 'Create brands, generate AI content, and schedule posts automatically. Turn YouTube videos into viral social media content.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'POSTAIFY - AI Social Media Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'POSTAIFY - AI-Powered Social Media Automation',
    description: 'Create brands, generate AI content, and schedule posts automatically.',
    creator: '@postaify',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* JSON-LD Organization Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'POSTAIFY',
                url: 'https://www.postaify.com',
                logo: 'https://www.postaify.com/logo.png',
                sameAs: [
                  'https://twitter.com/postaify',
                ],
                description: 'AI-powered social media content automation platform',
              }),
            }}
          />
          {/* JSON-LD Software Application Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'POSTAIFY',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.8',
                  ratingCount: '150',
                },
              }),
            }}
          />
        </head>
        <body className="antialiased">
          <ConvexClientProvider>
            <I18nProvider>
              <DataProvider>
                <SubscriptionProvider>
                  {children}
                </SubscriptionProvider>
              </DataProvider>
            </I18nProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
