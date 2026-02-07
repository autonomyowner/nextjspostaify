import type { Metadata } from 'next'
import { Pricing } from '@/components/landing/Pricing'

export const metadata: Metadata = {
  title: 'Pricing - Free, Pro & Business Plans',
  description: 'POSTAIFY pricing: Free (2 brands, 20 posts/mo), Pro $19/mo (5 brands, 1,000 posts, 200 AI images), Business $49/mo (unlimited brands, 90,000 posts). No credit card required to start.',
  keywords: [
    'POSTAIFY pricing',
    'social media automation pricing',
    'AI content generator cost',
    'Buffer alternative pricing',
    'cheap social media tool',
  ],
  openGraph: {
    title: 'POSTAIFY Pricing - Start Free, Scale as You Grow',
    description: 'Free tier with 2 brands and 20 posts. Pro at $19/mo. Business at $49/mo. No credit card required.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://postaify.com/pricing',
  },
}

export default function PricingPage() {
  const pricingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'POSTAIFY',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0',
      highPrice: '49',
      offerCount: 3,
      offers: [
        {
          '@type': 'Offer',
          name: 'Free',
          price: '0',
          priceCurrency: 'USD',
          description: '2 brands, 20 posts/month, 5 AI images/month',
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '19',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '19',
            priceCurrency: 'USD',
            billingDuration: 'P1M',
          },
          description: '5 brands, 1,000 posts/month, 200 AI images, 30 voiceovers, YouTube repurposing',
        },
        {
          '@type': 'Offer',
          name: 'Business',
          price: '49',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '49',
            priceCurrency: 'USD',
            billingDuration: 'P1M',
          },
          description: 'Unlimited brands, 90,000 posts/month, 1,000 AI images, 150 voiceovers, all premium features',
        },
      ],
    },
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <Pricing />
    </div>
  )
}
