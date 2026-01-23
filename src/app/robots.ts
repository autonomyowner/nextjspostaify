import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/posts/',
        '/calendar/',
        '/admin/',
        '/sign-in/',
        '/sign-up/',
        '/sso-callback/',
      ],
    },
    sitemap: 'https://www.postaify.com/sitemap.xml',
  }
}
