'use client'

import { useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { motion } from 'framer-motion'
import { useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'

interface LogoItem { type: string; url: string; prompt?: string }
interface MoodItem { url: string; prompt?: string; label?: string }
interface BackgroundItem { url: string; size?: string; prompt?: string }
interface MockupItem { type: string; url: string; prompt?: string }
interface SocialItem { platform: string; avatarUrl?: string; bannerUrl?: string }
interface BrandKitItem { _id: string; name: string; description: string; status: string; score?: number; palette?: any; [key: string]: any }

function BrandKitPageContent() {
  const searchParams = useSearchParams()
  const kitId = searchParams.get('id')
  const kits = useQuery(api.brandKit.listByUser)
  const selectedKit = useQuery(
    api.brandKit.getById,
    kitId ? { id: kitId as any } : 'skip'
  )

  const [copiedHex, setCopiedHex] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'social' | 'templates'>('overview')

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(null), 1500)
  }

  // If no kit selected, show kit list
  if (!kitId || !selectedKit) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Logo />
              <h1 className="text-lg font-semibold">Brand Kits</h1>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Back to Dashboard</Button>
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {!kits ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          ) : kits.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-xl font-bold mb-2">No Brand Kits Yet</h2>
              <p className="text-muted-foreground mb-4">Generate your first brand identity from the dashboard.</p>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {kits.map((kit: BrandKitItem) => (
                <Link key={kit._id} href={`/brand-kit?id=${kit._id}`}>
                  <Card className="p-5 hover:border-primary/30 transition-all group cursor-pointer">
                    {/* Color strip */}
                    {kit.palette && (
                      <div className="flex gap-1 mb-4">
                        {[kit.palette.primary, kit.palette.secondary, kit.palette.accent, kit.palette.dark, kit.palette.light].map((c, i) => (
                          <div
                            key={i}
                            className="h-3 flex-1 rounded-full first:rounded-l-lg last:rounded-r-lg"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    )}
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{kit.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{kit.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        kit.status === 'READY' ? 'bg-green-500/10 text-green-400' :
                        kit.status === 'GENERATING' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {kit.status}
                      </span>
                      {kit.score !== undefined && (
                        <span className="text-xs text-muted-foreground">Score: {kit.score}/100</span>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  const kit = selectedKit
  const palette = kit.palette
  const typography = kit.typography
  const logos = kit.logos || []
  const moodBoard = kit.moodBoard || []
  const backgrounds = kit.postBackgrounds || []
  const mockups = kit.mockups || []
  const socialProfiles = kit.socialProfiles || []

  const paletteColors = palette ? [
    { ...palette.primary, key: 'primary', label: 'Primary' },
    { ...palette.secondary, key: 'secondary', label: 'Secondary' },
    { ...palette.accent, key: 'accent', label: 'Accent' },
    { ...palette.dark, key: 'dark', label: 'Dark' },
    { ...palette.light, key: 'light', label: 'Light' },
  ] : []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Logo />
            <div>
              <h1 className="text-lg font-semibold">{kit.name}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">{kit.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {kit.score !== undefined && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-xs text-muted-foreground">Score</span>
                <span className="text-sm font-bold text-primary">{kit.score}</span>
              </div>
            )}
            <Link href="/brand-kit">
              <Button variant="ghost" size="sm">All Kits</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-6">
            {(['overview', 'social', 'templates'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-primary text-white'
                    : 'border-transparent text-muted-foreground hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Color Palette */}
            {palette && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Color Palette</h2>
                <div className="grid grid-cols-5 gap-3 sm:gap-4">
                  {paletteColors.map((color) => (
                    <button
                      key={color.key}
                      onClick={() => copyHex(color.hex)}
                      className="group"
                    >
                      <div
                        className="aspect-[3/4] rounded-2xl border border-white/10 group-hover:scale-[1.03] transition-all shadow-lg"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="mt-2">
                        <p className="text-sm font-medium">{color.label}</p>
                        <p className="text-xs text-muted-foreground">{color.name}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">
                          {copiedHex === color.hex ? 'Copied!' : color.hex}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{color.use}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Typography */}
            {typography && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Typography</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card className="p-6">
                    <p className="text-xs text-muted-foreground mb-2">Heading Font</p>
                    <p className="text-3xl font-bold mb-2" style={{ fontFamily: typography.heading.family }}>
                      {typography.heading.family}
                    </p>
                    <p className="text-sm" style={{ fontFamily: typography.heading.family }}>
                      The quick brown fox jumps over the lazy dog
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">Weight: {typography.heading.weight} &middot; {typography.heading.style}</p>
                  </Card>
                  <Card className="p-6">
                    <p className="text-xs text-muted-foreground mb-2">Body Font</p>
                    <p className="text-3xl mb-2" style={{ fontFamily: typography.body.family }}>
                      {typography.body.family}
                    </p>
                    <p className="text-sm" style={{ fontFamily: typography.body.family }}>
                      The quick brown fox jumps over the lazy dog
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">Weight: {typography.body.weight} &middot; {typography.body.style}</p>
                  </Card>
                </div>
                {typography.recommendation && (
                  <p className="text-sm text-muted-foreground mt-3 italic">{typography.recommendation}</p>
                )}
              </section>
            )}

            {/* Logos */}
            {logos.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Logo Variations</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {logos.map((logo: LogoItem) => (
                    <div key={logo.type} className="group relative">
                      <Card className={`aspect-square overflow-hidden ${
                        logo.type === 'inverted' ? 'bg-[#0F0F23]' : ''
                      }`}>
                        <img src={logo.url} alt={logo.type} className="w-full h-full object-contain p-4" />
                      </Card>
                      <p className="text-sm text-center mt-2 capitalize">{logo.type}</p>
                      <a
                        href={logo.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                      >
                        <span className="text-sm font-medium bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Mood Board */}
            {moodBoard.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Mood Board</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {moodBoard.map((img: MoodItem, i: number) => (
                    <div key={i} className="group relative">
                      <Card className="aspect-square overflow-hidden">
                        <img src={img.url} alt={img.label || 'Mood'} className="w-full h-full object-cover" />
                      </Card>
                      {img.label && (
                        <p className="text-sm text-center mt-2 text-muted-foreground">{img.label}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Mockups */}
            {mockups.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Mockup Previews</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {mockups.map((mockup: MockupItem) => (
                    <div key={mockup.type}>
                      <Card className="aspect-square overflow-hidden">
                        <img src={mockup.url} alt={mockup.type} className="w-full h-full object-cover" />
                      </Card>
                      <p className="text-sm text-center mt-2 capitalize">{mockup.type.replace('-', ' ')}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pattern */}
            {kit.pattern && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Brand Pattern</h2>
                <Card className="overflow-hidden">
                  <img
                    src={kit.pattern.url}
                    alt="Brand pattern"
                    className="w-full"
                    style={{ maxHeight: '250px', objectFit: 'cover' }}
                  />
                </Card>
              </section>
            )}
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Social Media Profile Kit</h2>
            {socialProfiles.length > 0 ? (
              <div className="space-y-6">
                {socialProfiles.map((profile: SocialItem) => (
                  <Card key={profile.platform} className="p-5">
                    <h3 className="font-medium mb-3">{profile.platform}</h3>
                    {profile.bannerUrl && (
                      <div className="group relative">
                        <div className="rounded-lg overflow-hidden border border-border">
                          <img
                            src={profile.bannerUrl}
                            alt={`${profile.platform} banner`}
                            className="w-full"
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                          />
                        </div>
                        <a
                          href={profile.bannerUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block"
                        >
                          <Button variant="outline" size="sm">Download Banner</Button>
                        </a>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No social profiles generated. Upgrade your plan for social media assets.</p>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Post Templates & Backgrounds</h2>
            {backgrounds.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {backgrounds.map((bg: BackgroundItem, i: number) => (
                  <div key={i} className="group relative">
                    <Card className="aspect-square overflow-hidden">
                      <img src={bg.url} alt={`Template ${i + 1}`} className="w-full h-full object-cover" />
                    </Card>
                    <p className="text-xs text-center mt-1.5 text-muted-foreground">{bg.size || '1080x1080'}</p>
                    <a
                      href={bg.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                    >
                      <span className="text-sm font-medium bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">Download</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No post backgrounds generated.</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default function BrandKitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    }>
      <BrandKitPageContent />
    </Suspense>
  )
}
