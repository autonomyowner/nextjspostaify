'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useAuth, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/Logo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { t } = useTranslation()
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Logo size="lg" />

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#agents" className="text-sm text-muted-foreground hover:text-white transition-colors">
            {t('nav.features')}
          </a>
          <Link href="/tools" className="text-sm text-muted-foreground hover:text-white transition-colors">
            Free Tools
          </Link>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-white transition-colors">
            {t('nav.pricing')}
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-white transition-colors">
            {t('nav.faq')}
          </a>
        </div>

        {/* CTA - Auth aware */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          {!isLoaded ? (
            // Loading state
            <div className="w-20 h-8 bg-muted/20 rounded animate-pulse" />
          ) : isSignedIn ? (
            // Signed in state
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button size="sm">
                  {t('nav.dashboard') || 'Dashboard'}
                </Button>
              </Link>
              {user?.imageUrl && (
                <Link href="/dashboard" className="hidden sm:block">
                  <img
                    src={user.imageUrl}
                    alt={user.firstName || 'User'}
                    className="w-8 h-8 rounded-full border border-border hover:border-primary transition-colors"
                  />
                </Link>
              )}
            </div>
          ) : (
            // Signed out state
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
        </div>
      </div>
    </nav>
  )
}
