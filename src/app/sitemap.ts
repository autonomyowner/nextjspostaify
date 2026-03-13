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

  const today = new Date().toISOString().split('T')[0]

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: today,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/youtube-summary`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/roadmap`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/waitlist`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  const toolPages: MetadataRoute.Sitemap = tools.map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: today,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Comparison pages for AEO (Generative Engine Optimization)
  const comparisonPages: MetadataRoute.Sitemap = competitorSlugs.map((slug) => ({
    url: `${baseUrl}/compare/${slug}`,
    lastModified: today,
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
