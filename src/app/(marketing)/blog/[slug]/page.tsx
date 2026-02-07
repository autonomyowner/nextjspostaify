import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { blogPosts, blogSlugs, getBlogPost, getAllBlogPosts } from '@/lib/blog-posts'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    return {}
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://postaify.com/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: ['POSTAIFY'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `https://postaify.com/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  // Get related posts (same category or just other posts)
  const relatedPosts = getAllBlogPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, 3)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'POSTAIFY',
      url: 'https://postaify.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'POSTAIFY',
      url: 'https://postaify.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://postaify.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://postaify.com/blog/${slug}`,
    },
    articleSection: post.category,
    keywords: post.keywords.join(', '),
  }

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
        name: 'Blog',
        item: 'https://postaify.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-zinc-400 truncate">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
              {post.category}
            </span>
            <span className="text-sm text-zinc-500">{post.date}</span>
            <span className="text-sm text-zinc-500">{post.readTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-zinc-400">{post.description}</p>
        </header>

        {/* Content */}
        <div className="space-y-10">
          {post.content.map((section, index) => (
            <section key={index}>
              <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>
              <div className="text-zinc-300 leading-relaxed whitespace-pre-line">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Try POSTAIFY Free</h2>
          <p className="text-zinc-400 mb-6">
            Start with 2 brands and 20 posts per month. No credit card required.
          </p>
          <Link
            href="/sign-up"
            className="inline-block rounded-full bg-yellow-400 px-8 py-3 font-semibold text-black transition-colors hover:bg-yellow-300"
          >
            Start Free Today
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="space-y-4">
              {relatedPosts.map((relPost) => (
                <Link
                  key={relPost.slug}
                  href={`/blog/${relPost.slug}`}
                  className="block group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-yellow-400/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-yellow-400">
                      {relPost.category}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {relPost.readTime}
                    </span>
                  </div>
                  <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">
                    {relPost.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
