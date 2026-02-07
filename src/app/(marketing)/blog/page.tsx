import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/blog-posts'

export const metadata: Metadata = {
  title: 'Blog - AI Social Media Tips & Guides',
  description:
    'Learn how to automate social media with AI. Guides on content creation, YouTube repurposing, brand building, and growing your audience with POSTAIFY.',
  keywords: [
    'AI social media blog',
    'content creation tips',
    'social media automation guide',
    'AI content marketing',
  ],
  openGraph: {
    title: 'POSTAIFY Blog - AI Social Media Tips & Guides',
    description:
      'Practical guides on AI content creation, social media automation, and growing your brand.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://postaify.com/blog',
  },
}

export default function BlogPage() {
  const posts = getAllBlogPosts()

  const blogListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'POSTAIFY Blog',
    description: 'AI social media automation tips, guides, and strategies.',
    url: 'https://postaify.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'POSTAIFY',
      url: 'https://postaify.com',
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `https://postaify.com/blog/${post.slug}`,
      author: {
        '@type': 'Organization',
        name: 'POSTAIFY',
      },
    })),
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <div className="text-center mb-16">
          <p className="text-sm font-medium uppercase tracking-wider text-yellow-400 mb-4">
            Blog
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            AI Social Media Tips & Guides
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Practical guides on automating social media, creating content with AI,
            and growing your brand across every platform.
          </p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-yellow-400/30 hover:bg-zinc-900/80"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                  {post.category}
                </span>
                <span className="text-xs text-zinc-500">{post.date}</span>
                <span className="text-xs text-zinc-500">{post.readTime}</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-yellow-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-zinc-400 text-sm">{post.description}</p>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h2 className="text-2xl font-bold mb-3">Ready to Try AI Content?</h2>
          <p className="text-zinc-400 mb-6">
            Start free with 2 brands and 20 posts. No credit card required.
          </p>
          <Link
            href="/sign-up"
            className="inline-block rounded-full bg-yellow-400 px-8 py-3 font-semibold text-black transition-colors hover:bg-yellow-300"
          >
            Start Free Today
          </Link>
        </div>
      </div>
    </div>
  )
}
