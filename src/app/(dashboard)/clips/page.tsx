'use client'

import { useState, useCallback } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { motion } from 'framer-motion'
import { useSubscription } from '@/context/SubscriptionContext'
import { useConvexAuth } from '@/hooks/useCurrentUser'
import { useData } from '@/context/DataContext'
import { authClient } from '@/lib/auth-client'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { MobileNav } from '@/components/dashboard/MobileNav'
import Link from 'next/link'

export default function ClipsPage() {
  const { t } = useTranslation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clips = (useQuery as any)((api as any).clips?.listByUser) ?? []
  const { subscription } = useSubscription()
  const { user } = useData()
  const { isAuthenticated } = useConvexAuth()
  const signOut = () => authClient.signOut().then(() => window.location.href = '/')
  const hasMp4Export = subscription.plan !== 'free'

  const [previewId, setPreviewId] = useState<string | null>(null)
  const previewClip = clips.find((c: any) => c._id === previewId)

  const handlePreview = useCallback((htmlContent: string) => {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    window.open(URL.createObjectURL(blob), '_blank')
  }, [])

  const handleDownload = useCallback((htmlContent: string, title: string) => {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'clip'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.dashboard')}</Link>
              <Link href="/posts" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.posts')}</Link>
              <Link href="/clips" className="text-sm text-white font-medium">Clips</Link>
              <Link href="/brand-kit" className="text-sm text-muted-foreground hover:text-white transition-colors">Brand Kit</Link>
              <Link href="/calendar" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.calendar')}</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-sm font-medium">
                  {user?.name?.slice(0, 1) || user?.email?.slice(0, 1)?.toUpperCase() || 'U'}
                </div>
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-xs">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/sign-in">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-32 md:pb-8 mb-20 md:mb-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">My Clips</h1>
          <p className="text-sm text-white/40">Your AI-generated motion graphic clips</p>
        </div>

        {clips.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 opacity-20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-white/20">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M10 9l5 3-5 3V9z" />
              </svg>
            </div>
            <p className="text-white/30 text-sm">No clips yet. Create your first motion clip from the dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clips.map((clip: any) => (
              <motion.div
                key={clip._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all group"
              >
                {/* Color preview bar */}
                <div className="h-2 w-full flex">
                  <div className="flex-1" style={{ background: clip.colors.primary }} />
                  <div className="flex-1" style={{ background: clip.colors.secondary }} />
                  <div className="flex-1" style={{ background: clip.colors.accent }} />
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white/80 truncate mb-1">
                    {clip.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/30 mb-3">
                    <span>{clip.scenesCount} scenes</span>
                    <span>&middot;</span>
                    <span>~{clip.duration}s</span>
                    <span>&middot;</span>
                    <span>{new Date(clip.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Scene tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(clip.scenes as Array<{ type: string }>)?.slice(0, 4).map((scene, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 uppercase tracking-wider"
                      >
                        {scene.type}
                      </span>
                    ))}
                    {(clip.scenes as Array<{ type: string }>)?.length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30">
                        +{(clip.scenes as Array<{ type: string }>).length - 4}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(clip.htmlContent)}
                      className="flex-1 py-2 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium hover:from-yellow-500/20 hover:to-orange-500/20 transition-all"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(clip.htmlContent, clip.title)}
                      className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs font-medium hover:bg-white/10 transition-all"
                    >
                      Download
                    </button>
                    {clip.mp4Url && (
                      <a
                        href={clip.mp4Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-all text-center"
                      >
                        MP4
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
