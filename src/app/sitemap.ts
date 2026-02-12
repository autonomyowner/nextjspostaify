import { MetadataRoute } from 'next'
import { competitorSlugs } from '@/lib/competitors-config'
import { blogSlugs, getBlogPost } from '@/lib/blog-posts'

// Initial launch: YouTube converters only
const tools = [
  'youtube-to-linkedin',
  'youtube-to-twitter',
  'youtube-to-instagram',
  'youtube-to-tiktok',
  'youtube-to-facebook',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://postaify.com'

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: '2026-02-10',
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: '2026-02-07',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: '2026-02-07',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: '2026-02-07',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/youtube-summary`,
      lastModified: '2026-02-07',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: '2026-01-15',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: '2026-01-15',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/roadmap`,
      lastModified: '2026-02-07',
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]

  const toolPages: MetadataRoute.Sitemap = tools.map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: '2026-02-07',
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Comparison pages for AEO (Generative Engine Optimization)
  const comparisonPages: MetadataRoute.Sitemap = competitorSlugs.map((slug) => ({
    url: `${baseUrl}/compare/${slug}`,
    lastModified: '2026-02-07',
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Blog pages - use actual publish dates
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => {
    const post = getBlogPost(slug)
    return {
      url: `${baseUrl}/blog/${slug}`,
      lastModified: post?.date || '2026-02-07',
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }
  })

  return [...staticPages, ...toolPages, ...comparisonPages, ...blogPages]
}
