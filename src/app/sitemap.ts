import { MetadataRoute } from 'next'

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
  ]

  const toolPages: MetadataRoute.Sitemap = tools.map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...toolPages]
}
