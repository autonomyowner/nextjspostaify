import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tools, getAllToolSlugs, getToolBySlug } from '@/lib/tools-config'
import ToolPageClient from './tool-page-client'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tool = getToolBySlug(slug)

  if (!tool) {
    return {}
  }

  return {
    title: tool.title,
    description: tool.description,
    keywords: [tool.keyword, tool.platform, 'youtube converter', 'AI tool', 'content creator'],
    openGraph: {
      title: tool.title,
      description: tool.description,
      url: `https://www.postaify.com/tools/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.title,
      description: tool.description,
    },
    alternates: {
      canonical: `https://www.postaify.com/tools/${slug}`,
    },
  }
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params
  const tool = getToolBySlug(slug)

  if (!tool) {
    notFound()
  }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    description: tool.description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  // FAQ Schema
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map(faq => ({
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
      <ToolPageClient slug={slug} tool={tool} />
    </>
  )
}
