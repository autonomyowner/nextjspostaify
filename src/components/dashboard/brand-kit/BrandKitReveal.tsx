'use client'

import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LogoItem { type: string; url: string; prompt?: string }
interface MoodItem { url: string; prompt?: string; label?: string }
interface BackgroundItem { url: string; size?: string; prompt?: string }
interface MockupItem { type: string; url: string; prompt?: string }
interface SocialItem { platform: string; avatarUrl?: string; bannerUrl?: string }

interface BrandKitRevealProps {
  kitId: string
  onClose: () => void
}

export function BrandKitReveal({ kitId, onClose }: BrandKitRevealProps) {
  const kit = useQuery(api.brandKit.getById, { id: kitId as any })
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

  if (!kit || kit.status === 'GENERATING') {
    return (
      <div className="p-12 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-sm text-muted-foreground">Finalizing your brand kit...</p>
      </div>
    )
  }

  if (kit.status === 'FAILED') {
    return (
      <div className="p-12 text-center">
        <p className="text-red-400 mb-4">Generation failed. Please try again.</p>
        <Button onClick={onClose} variant="outline">Close</Button>
      </div>
    )
  }

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(null), 1500)
  }

  const palette = kit.palette
  const typography = kit.typography
  const logos = kit.logos || []
  const moodBoard = kit.moodBoard || []
  const backgrounds = kit.postBackgrounds || []
  const mockups = kit.mockups || []
  const socialProfiles = kit.socialProfiles || []

  const paletteColors = palette ? [
    { ...palette.primary, key: 'primary' },
    { ...palette.secondary, key: 'secondary' },
    { ...palette.accent, key: 'accent' },
    { ...palette.dark, key: 'dark' },
    { ...palette.light, key: 'light' },
  ] : []

  return (
    <div className="p-6 sm:p-8 overflow-y-auto max-h-[85vh]">
      {/* Header with Score */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-1">{kit.name}</h2>
        <p className="text-sm text-muted-foreground mb-4">{kit.description}</p>
        {kit.score !== undefined && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
          >
            <span className="text-sm text-muted-foreground">Brand Score</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl font-bold text-primary"
            >
              {kit.score}
            </motion.span>
            <span className="text-xs text-muted-foreground">/100</span>
          </motion.div>
        )}
      </motion.div>

      {/* ── Color Palette ────────────────────────────────────── */}
      {palette && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Color Palette</h3>
          <div className="flex gap-2 sm:gap-3">
            {paletteColors.map((color, i) => (
              <motion.button
                key={color.key}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300 }}
                onClick={() => copyHex(color.hex)}
                onMouseEnter={() => setHoveredColor(color.key)}
                onMouseLeave={() => setHoveredColor(null)}
                className="flex-1 group relative"
              >
                <div
                  className="aspect-square rounded-xl sm:rounded-2xl border border-white/10 group-hover:scale-105 transition-transform shadow-lg"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium truncate">{color.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {copiedHex === color.hex ? 'Copied!' : color.hex}
                  </p>
                </div>
                {hoveredColor === color.key && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground bg-card px-1.5 py-0.5 rounded border border-border whitespace-nowrap"
                  >
                    {color.use}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Typography ───────────────────────────────────────── */}
      {typography && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Typography</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/50 border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Heading</p>
              <p className="text-lg sm:text-xl font-bold" style={{ fontFamily: typography.heading.family }}>
                {typography.heading.family}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Weight: {typography.heading.weight} &middot; {typography.heading.style}</p>
            </div>
            <div className="bg-background/50 border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Body</p>
              <p className="text-lg sm:text-xl" style={{ fontFamily: typography.body.family }}>
                {typography.body.family}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Weight: {typography.body.weight} &middot; {typography.body.style}</p>
            </div>
          </div>
          {typography.recommendation && (
            <p className="text-xs text-muted-foreground mt-2 italic">{typography.recommendation}</p>
          )}
        </motion.section>
      )}

      {/* ── Logos ─────────────────────────────────────────────── */}
      {logos.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Logo Variations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {logos.map((logo: LogoItem, i: number) => (
              <motion.div
                key={logo.type}
                initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.9 + i * 0.15, type: 'spring', stiffness: 200 }}
                className="group relative"
              >
                <div className={`aspect-square rounded-xl border border-border overflow-hidden ${
                  logo.type === 'inverted' ? 'bg-[#0F0F23]' : 'bg-background/50'
                }`}>
                  <img
                    src={logo.url}
                    alt={`${logo.type} logo`}
                    className="w-full h-full object-contain p-3"
                  />
                </div>
                <p className="text-xs text-center mt-1.5 capitalize text-muted-foreground">{logo.type}</p>
                <a
                  href={logo.url}
                  download={`${kit.name}-${logo.type}-logo.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                >
                  <span className="text-xs font-medium bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    Download
                  </span>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Mood Board ───────────────────────────────────────── */}
      {moodBoard.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Mood Board</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {moodBoard.map((img: MoodItem, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + i * 0.1 }}
                className="group relative"
              >
                <div className="aspect-square rounded-xl border border-border overflow-hidden bg-background/50">
                  <img src={img.url} alt={img.label || 'Mood board'} className="w-full h-full object-cover" />
                </div>
                {img.label && (
                  <p className="text-xs text-center mt-1.5 text-muted-foreground">{img.label}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Post Backgrounds ─────────────────────────────────── */}
      {backgrounds.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Post Backgrounds</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {backgrounds.map((bg: BackgroundItem, i: number) => (
              <motion.a
                key={i}
                href={bg.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 + i * 0.08 }}
                className="group relative"
              >
                <div className="aspect-square rounded-lg border border-border overflow-hidden hover:scale-105 transition-transform">
                  <img src={bg.url} alt={`Background ${i + 1}`} className="w-full h-full object-cover" />
                </div>
                <p className="text-[9px] text-center mt-1 text-muted-foreground">{bg.size || '1080x1080'}</p>
              </motion.a>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Mockups ──────────────────────────────────────────── */}
      {mockups.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Mockup Previews</h3>
          <div className="grid grid-cols-3 gap-3">
            {mockups.map((mockup: MockupItem, i: number) => (
              <motion.div
                key={mockup.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.9 + i * 0.15 }}
                className="group relative"
              >
                <div className="aspect-square rounded-xl border border-border overflow-hidden bg-background/50">
                  <img src={mockup.url} alt={mockup.type} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-center mt-1.5 capitalize text-muted-foreground">
                  {mockup.type.replace('-', ' ')}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Social Profiles ──────────────────────────────────── */}
      {socialProfiles.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Social Media Banners</h3>
          <div className="space-y-3">
            {socialProfiles.map((profile: SocialItem, i: number) => (
              <motion.div
                key={profile.platform}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.2 + i * 0.1 }}
              >
                <p className="text-xs font-medium mb-1.5">{profile.platform}</p>
                {profile.bannerUrl && (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <img
                      src={profile.bannerUrl}
                      alt={`${profile.platform} banner`}
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: '120px' }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Pattern ──────────────────────────────────────────── */}
      {kit.pattern && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Brand Pattern</h3>
          <div className="rounded-xl border border-border overflow-hidden" style={{ maxHeight: '200px' }}>
            <img
              src={kit.pattern.url}
              alt="Brand pattern"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.section>
      )}

      {/* ── Actions ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.6 }}
        className="flex gap-3 pt-4 border-t border-border"
      >
        <Link href={`/brand-kit?id=${kitId}`} className="flex-1">
          <Button className="w-full">View Full Kit</Button>
        </Link>
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      </motion.div>
    </div>
  )
}
