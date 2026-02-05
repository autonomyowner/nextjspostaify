import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { competitors, competitorSlugs } from '@/lib/competitors-config'
import { ComparisonPageClient } from './comparison-page-client'

interface Props {
  params: Promise<{ competitor: string }>
}

export async function generateStaticParams() {
  return competitorSlugs.map((slug) => ({
    competitor: slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { competitor: slug } = await params
  const competitor = competitors[slug]

  if (!competitor) {
    return {
      title: 'Comparison Not Found',
    }
  }

  const title = `POSTAIFY vs ${competitor.name} (2025) - Feature Comparison`
  const description = `Compare POSTAIFY vs ${competitor.name}: AI content generation, pricing, features. See why users choose POSTAIFY for social media automation at $19/mo vs ${competitor.monthlyPrice}.`

  return {
    title,
    description,
    keywords: [
      `${competitor.name} alternative`,
      `${competitor.name} vs POSTAIFY`,
      'AI social media tool',
      'social media automation',
      'AI content generator',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

export default async function ComparisonPage({ params }: Props) {
  const { competitor: slug } = await params
  const competitor = competitors[slug]

  if (!competitor) {
    notFound()
  }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `POSTAIFY vs ${competitor.name} Comparison`,
    description: `Compare POSTAIFY and ${competitor.name} features, pricing, and capabilities for social media automation.`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'SoftwareApplication',
          position: 1,
          name: 'POSTAIFY',
          applicationCategory: 'BusinessApplication',
          offers: {
            '@type': 'Offer',
            price: '19',
            priceCurrency: 'USD',
          },
        },
        {
          '@type': 'SoftwareApplication',
          position: 2,
          name: competitor.name,
          applicationCategory: 'BusinessApplication',
          offers: {
            '@type': 'Offer',
            price: competitor.monthlyPrice.replace('$', ''),
            priceCurrency: 'USD',
          },
        },
      ],
    },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: competitor.faqs.map((faq) => ({
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ComparisonPageClient competitor={competitor} />
    </>
  )
}
