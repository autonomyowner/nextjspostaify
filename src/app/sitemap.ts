import { MetadataRoute } from 'next'
import { competitorSlugs } from '@/lib/competitors-config'

// Initial launch: YouTube converters only
const tools = [
  'youtube-to-linkedin',
  'youtube-to-twitter',
  'youtube-to-instagram',
  'youtube-to-tiktok',
  'youtube-to-facebook',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.postaify.com'

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/youtube-summary`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const toolPages: MetadataRoute.Sitemap = tools.map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Comparison pages for AEO (Generative Engine Optimization)
  const comparisonPages: MetadataRoute.Sitemap = competitorSlugs.map((slug) => ({
    url: `${baseUrl}/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...toolPages, ...comparisonPages]
}
