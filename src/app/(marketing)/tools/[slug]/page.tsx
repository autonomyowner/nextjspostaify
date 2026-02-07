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
      url: `https://postaify.com/tools/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.title,
      description: tool.description,
    },
    alternates: {
      canonical: `https://postaify.com/tools/${slug}`,
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

  // HowTo Schema for featured snippets
  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to ${tool.h1}`,
    description: tool.description,
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Paste your YouTube video URL',
        text: `Copy the URL of any YouTube video and paste it into the ${tool.title} tool.`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Click Generate',
        text: `Our AI analyzes the video transcript and generates an optimized ${tool.platform} post.`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: `Copy your ${tool.platform} content`,
        text: `Review the generated content, make any edits, and copy it to ${tool.platform}. No signup required for your first conversion.`,
      },
    ],
    tool: {
      '@type': 'HowToTool',
      name: 'POSTAIFY',
    },
    totalTime: 'PT1M',
  }

  // Breadcrumb Schema
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://postaify.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Free AI Tools',
        item: 'https://postaify.com/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.title,
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ToolPageClient slug={slug} tool={tool} />
    </>
  )
}
