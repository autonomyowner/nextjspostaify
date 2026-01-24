'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()

  const footerLinks = {
    [t('footer.product.title')]: [
      t('footer.product.features'),
      t('footer.product.pricing'),
      t('footer.product.docs'),
      t('footer.product.changelog')
    ],
    [t('footer.company.title')]: [
      t('footer.company.about'),
      t('footer.company.blog'),
      t('footer.company.careers'),
      t('footer.company.contact')
    ],
    [t('footer.legal.title')]: [
      t('footer.legal.privacy'),
      t('footer.legal.terms'),
      t('footer.legal.security')
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
            <a href="/" className="text-2xl font-bold tracking-tight mb-4 block">
              <span className="text-white">Post</span><span className="text-primary">aify</span>
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
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                      {link}
                    </a>
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
