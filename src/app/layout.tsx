import type { Metadata } from 'next'
import { DM_Sans, Syne, Noto_Sans_Arabic } from 'next/font/google'
import './globals.css'

// Optimized font loading with next/font - eliminates render-blocking CSS @imports
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: true,
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
  preload: true,
})

// Arabic font - lazy loaded, only needed for RTL users
const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-arabic',
  display: 'swap',
  preload: false,
})

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
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/favicon/site.webmanifest',
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
    <html lang="en" className={`${dmSans.variable} ${syne.variable} ${notoArabic.variable}`}>
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
        {/* Providers are now in route group layouts:
            - (marketing)/layout.tsx: ConvexClientProvider + I18nProvider
            - (dashboard)/layout.tsx: All 4 providers
            This reduces JS bundle for marketing pages */}
        {children}
      </body>
    </html>
  )
}
