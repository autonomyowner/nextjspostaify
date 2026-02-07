import type { Metadata } from 'next'
import Link from 'next/link'
import { tools } from '@/lib/tools-config'

export const metadata: Metadata = {
  title: 'Free AI Tools for Content Creators',
  description: 'Convert YouTube videos to social media posts for LinkedIn, Twitter, Instagram, TikTok, and Facebook. Free AI-powered tools.',
  openGraph: {
    title: 'Free AI Tools for Content Creators | POSTAIFY',
    description: 'Convert YouTube videos to social media posts for all platforms. Free AI-powered tools.',
  },
}

export default function ToolsPage() {
  const toolList = Object.entries(tools)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Free AI Tools for Content Creators
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert YouTube videos into engaging social media posts for any platform.
            No signup required for your first conversion.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolList.map(([slug, tool]) => (
            <Link
              key={slug}
              href={`/tools/${slug}`}
              className="group bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300"
            >
              <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {tool.h1}
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                {tool.description}
              </p>
              <div className="flex items-center text-primary text-sm font-medium">
                Try Free
                <svg
                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-card rounded-2xl p-8 sm:p-12 border border-border">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Want Unlimited Access?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Get unlimited conversions, AI image generation, voiceovers, and more with POSTAIFY Pro.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </div>

      {/* JSON-LD for the tools index page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: toolList.map(([slug, tool], index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'SoftwareApplication',
                name: tool.title,
                url: `https://postaify.com/tools/${slug}`,
                applicationCategory: 'MultimediaApplication',
                operatingSystem: 'Web',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                },
              },
            })),
          }),
        }}
      />
    </div>
  )
}
