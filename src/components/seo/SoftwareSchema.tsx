interface SoftwareSchemaProps {
  name: string
  description: string
  features: string[]
  price?: string
  priceCurrency?: string
  applicationCategory?: string
  operatingSystem?: string
  aggregateRating?: {
    ratingValue: number
    ratingCount: number
  }
}

export function SoftwareSchema({
  name,
  description,
  features,
  price = '0',
  priceCurrency = 'USD',
  applicationCategory = 'BusinessApplication',
  operatingSystem = 'Web',
  aggregateRating,
}: SoftwareSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory,
    operatingSystem,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency,
    },
    featureList: features,
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        ratingCount: aggregateRating.ratingCount,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface FAQSchemaProps {
  questions: Array<{
    question: string
    answer: string
  }>
}

export function FAQSchema({ questions }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface OrganizationSchemaProps {
  name: string
  url: string
  logo?: string
  description?: string
  sameAs?: string[]
}

export function OrganizationSchema({
  name,
  url,
  logo,
  description,
  sameAs,
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    ...(logo && { logo }),
    ...(description && { description }),
    ...(sameAs && { sameAs }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
