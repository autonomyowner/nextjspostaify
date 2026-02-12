'use client'

import { memo, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { getAllBlogPosts } from '@/lib/blog-posts'
import { competitorSlugs, competitors } from '@/lib/competitors-config'

export const BlogPreview = memo(function BlogPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const posts = getAllBlogPosts().slice(0, 3)
  const topCompetitors = competitorSlugs.slice(0, 6).map((slug) => ({
    slug,
    name: competitors[slug]?.name || slug,
  }))

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Blog */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-yellow-400 mb-3">
            Resources
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Latest from our Blog
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Guides on AI content creation, social media automation, and growing your brand.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {posts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="block group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 h-full transition-all hover:border-yellow-400/30"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                  {post.category}
                </span>
                <h3 className="mt-3 font-semibold group-hover:text-yellow-400 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                  {post.description}
                </p>
                <span className="mt-3 inline-block text-xs text-zinc-500">
                  {post.readTime}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-20">
          <Link
            href="/blog"
            className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            View all articles →
          </Link>
        </div>

        {/* Comparisons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-8"
        >
          <h3 className="text-xl font-bold mb-6">
            See how POSTAIFY compares
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {topCompetitors.map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-yellow-400/50 hover:text-white transition-all"
              >
                vs {c.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
})
