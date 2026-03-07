'use client'

import { useState, useEffect, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { useConvexAuth } from '@/hooks/useCurrentUser'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/Logo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { cn } from '@/lib/utils'

export const Navbar = memo(function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslation()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const user = useQuery(api.users.viewer)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change / resize
  useEffect(() => {
    const close = () => setMobileOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  const navLinks = [
    { href: '#agents', label: t('nav.features') },
    { href: '/tools', label: 'Free Tools', isLink: true },
    { href: '/blog', label: 'Blog', isLink: true },
    { href: '#pricing', label: t('nav.pricing') },
    { href: '#faq', label: t('nav.faq') },
  ]

  return (
    <nav
      className={cn(
        'fixed z-50 transition-all duration-500',
        scrolled
          ? 'top-4 left-4 right-4 glass rounded-2xl py-3 shadow-lg shadow-black/20'
          : 'top-0 left-0 right-0 bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Logo size="lg" />

        {/* Nav Links — Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.isLink ? (
              <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-white transition-colors">
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-white transition-colors">
                {link.label}
              </a>
            )
          )}
        </div>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {isLoading ? (
            <div className="w-20 h-8 bg-muted/20 rounded animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button size="sm">
                  {t('nav.dashboard') || 'Dashboard'}
                </Button>
              </Link>
              {user?.avatarUrl && (
                <Link href="/dashboard" className="hidden sm:block">
                  <Image
                    src={user.avatarUrl}
                    alt={user.name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full border border-border hover:border-primary transition-colors"
                  />
                </Link>
              )}
            </div>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  {t('nav.signIn')}
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">
                  {t('nav.getStarted')}
                </Button>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1 p-2 cursor-pointer"
            aria-label="Toggle menu"
          >
            <span className={cn('block w-5 h-0.5 bg-white transition-all duration-300', mobileOpen && 'rotate-45 translate-y-1.5')} />
            <span className={cn('block w-5 h-0.5 bg-white transition-all duration-300', mobileOpen && 'opacity-0')} />
            <span className={cn('block w-5 h-0.5 bg-white transition-all duration-300', mobileOpen && '-rotate-45 -translate-y-1.5')} />
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <div className={cn(
        'md:hidden overflow-hidden transition-all duration-300',
        mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="px-6 pt-4 pb-6 flex flex-col gap-3 border-t border-white/5 mt-3">
          {navLinks.map((link) =>
            link.isLink ? (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-white transition-colors py-2">
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-white transition-colors py-2">
                {link.label}
              </a>
            )
          )}
        </div>
      </div>
    </nav>
  )
})
