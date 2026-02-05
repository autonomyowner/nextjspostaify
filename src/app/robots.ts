import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const privateRoutes = [
    '/dashboard/',
    '/posts/',
    '/calendar/',
    '/admin/',
    '/sign-in/',
    '/sign-up/',
    '/sso-callback/',
    '/api/',
  ]

  return {
    rules: [
      // Default rule for all bots
      { userAgent: '*', allow: '/', disallow: privateRoutes },
      // OpenAI bots
      { userAgent: 'GPTBot', allow: '/', disallow: privateRoutes },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: privateRoutes },
      // Perplexity
      { userAgent: 'PerplexityBot', allow: '/', disallow: privateRoutes },
      // Common Crawl (used by many AI models)
      { userAgent: 'CCBot', allow: '/', disallow: privateRoutes },
      // Google AI (Gemini)
      { userAgent: 'Google-Extended', allow: '/', disallow: privateRoutes },
      // Anthropic
      { userAgent: 'anthropic-ai', allow: '/', disallow: privateRoutes },
      { userAgent: 'ClaudeBot', allow: '/', disallow: privateRoutes },
      // ByteDance AI
      { userAgent: 'Bytespider', allow: '/', disallow: privateRoutes },
      // Cohere
      { userAgent: 'cohere-ai', allow: '/', disallow: privateRoutes },
    ],
    sitemap: 'https://www.postaify.com/sitemap.xml',
  }
}
