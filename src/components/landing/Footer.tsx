'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()

  const footerLinks = {
    [t('footer.product.title')]: [
      { label: t('footer.product.features'), href: '/#features' },
      { label: t('footer.product.pricing'), href: '/pricing' },
      { label: t('footer.product.docs'), href: '#' },
      { label: t('footer.product.changelog'), href: '/roadmap' }
    ],
    [t('footer.company.title')]: [
      { label: t('footer.company.about'), href: '#' },
      { label: t('footer.company.blog'), href: '#' },
      { label: t('footer.company.careers'), href: '#' },
      { label: t('footer.company.contact'), href: '#' }
    ],
    [t('footer.legal.title')]: [
      { label: t('footer.legal.privacy'), href: '/privacy' },
      { label: t('footer.legal.terms'), href: '/terms' },
      { label: t('footer.legal.security'), href: '#' }
    ]
  }

  const freeTools = [
    { name: 'All Free Tools', href: '/tools' },
    { name: 'YouTube Summarizer', href: '/youtube-summary' },
    { name: 'YouTube to LinkedIn', href: '/tools/youtube-to-linkedin' },
    { name: 'YouTube to Twitter', href: '/tools/youtube-to-twitter' },
    { name: 'YouTube to Instagram', href: '/tools/youtube-to-instagram' },
  ]
  return (
    <footer className="py-16 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight mb-4">
              <Image
                src="/logo.png"
                alt="Postaify"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span>
                <span className="text-white">Post</span><span className="text-primary">aify</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground mb-4">
              Automate your content with AI-powered tools.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/Postaify/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-white transition-colors text-sm"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* Free Tools */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Free Tools</h4>
            <ul className="space-y-2">
              {freeTools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground hover:text-white transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 text-sm">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Post<span className="text-primary">aify</span>. {t('footer.rights')}
          </p>
          <p className="text-sm text-muted-foreground">
            In partnership with{" "}
            <a
              href="https://www.zsst.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ZST
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
