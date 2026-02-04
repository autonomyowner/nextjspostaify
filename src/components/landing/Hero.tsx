'use client'

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useConvexAuth } from '@/hooks/useCurrentUser'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Detect if device prefers reduced motion or is mobile for performance
const useReducedMotion = () => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isMobile = window.innerWidth < 768
    setShouldReduceMotion(mediaQuery.matches || isMobile)

    const handler = () => setShouldReduceMotion(mediaQuery.matches || window.innerWidth < 768)
    mediaQuery.addEventListener('change', handler)
    window.addEventListener('resize', handler)

    return () => {
      mediaQuery.removeEventListener('change', handler)
      window.removeEventListener('resize', handler)
    }
  }, [])

  return shouldReduceMotion
}

// Floating orb component
function FloatingOrb({ size, x, y, delay, duration }: {
  size: number
  x: string
  y: string
  delay: number
  duration: number
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, hsl(48, 96%, 53%) 0%, transparent 70%)`,
        filter: "blur(1px)"
      }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.1, 1]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

// Animated connection line
function ConnectionLine({ startX, startY, endX, endY, delay }: {
  startX: number
  startY: number
  endX: number
  endY: number
  delay: number
}) {
  return (
    <motion.line
      x1={startX}
      y1={startY}
      x2={endX}
      y2={endY}
      stroke="hsl(48, 96%, 53%)"
      strokeWidth="1"
      strokeOpacity="0.2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: [0, 1, 0] }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

export function Hero() {
  const { t } = useTranslation()
  const { isAuthenticated } = useConvexAuth()
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/20 rounded-full blur-[100px] md:blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-yellow-500/10 rounded-full blur-[80px] md:blur-[120px]" />
      <div className="absolute top-0 right-0 w-[150px] h-[150px] md:w-[300px] md:h-[300px] bg-amber-500/10 rounded-full blur-[60px] md:blur-[100px]" />

      {/* Floating Orbs - Only render on desktop for better mobile performance */}
      {!reduceMotion && (
        <>
          <FloatingOrb size={8} x="15%" y="30%" delay={0} duration={4} />
          <FloatingOrb size={6} x="85%" y="25%" delay={0.5} duration={3.5} />
          <FloatingOrb size={10} x="10%" y="60%" delay={1} duration={4.5} />
          <FloatingOrb size={5} x="90%" y="65%" delay={1.5} duration={3} />
          <FloatingOrb size={7} x="20%" y="80%" delay={0.8} duration={4} />
          <FloatingOrb size={6} x="80%" y="75%" delay={0.3} duration={3.8} />
        </>
      )}

      {/* Subtle SVG visualization behind content - Hidden on mobile for performance */}
      {!reduceMotion && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-full max-w-4xl md:max-w-6xl opacity-30"
            preserveAspectRatio="xMidYMid meet"
          >
          <defs>
            <filter id="heroGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g filter="url(#heroGlow)">
            {/* Orbital rings */}
            <motion.ellipse
              cx="400"
              cy="300"
              rx="250"
              ry="100"
              fill="none"
              stroke="hsl(48, 96%, 53%)"
              strokeWidth="0.5"
              strokeOpacity="0.3"
              strokeDasharray="8 4"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "400px 300px" }}
            />
            <motion.ellipse
              cx="400"
              cy="300"
              rx="200"
              ry="80"
              fill="none"
              stroke="hsl(48, 96%, 53%)"
              strokeWidth="0.5"
              strokeOpacity="0.2"
              strokeDasharray="4 8"
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "400px 300px" }}
            />

            {/* Connection lines */}
            <ConnectionLine startX={150} startY={200} endX={300} endY={280} delay={0} />
            <ConnectionLine startX={500} startY={280} endX={650} endY={200} delay={1} />
            <ConnectionLine startX={200} startY={400} endX={350} endY={320} delay={0.5} />
            <ConnectionLine startX={450} startY={320} endX={600} endY={400} delay={1.5} />

            {/* Small nodes */}
            {[
              { cx: 150, cy: 200, delay: 0 },
              { cx: 650, cy: 200, delay: 0.5 },
              { cx: 200, cy: 400, delay: 1 },
              { cx: 600, cy: 400, delay: 1.5 },
            ].map((node, i) => (
              <motion.circle
                key={i}
                cx={node.cx}
                cy={node.cy}
                r="4"
                fill="hsl(48, 96%, 53%)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  duration: 3,
                  delay: node.delay,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}

            {/* Traveling particles on orbit */}
            <motion.circle
              r="3"
              fill="white"
              animate={{
                cx: [650, 400, 150, 400, 650],
                cy: [300, 200, 300, 400, 300]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ filter: "drop-shadow(0 0 4px white)" }}
            />
            <motion.circle
              r="2"
              fill="hsl(48, 96%, 70%)"
              animate={{
                cx: [150, 400, 650, 400, 150],
                cy: [300, 380, 300, 220, 300]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ filter: "drop-shadow(0 0 3px hsl(48, 96%, 70%))" }}
            />
          </g>
        </svg>
      </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm">
            {t('hero.users')}
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight"
        >
          <span className="text-white">{t('hero.title')}</span>
          <br />
          <span className="text-gradient-yellow">{t('hero.titleHighlight')}</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 px-4"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* Transformation Stat - The Grand Slam Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mb-10"
        >
          <div className="flex flex-col items-center px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-2xl sm:text-3xl font-bold text-red-400 line-through decoration-2">
              {t('hero.transformationBefore') || '8+ hours'}
            </span>
            <span className="text-xs sm:text-sm text-red-400/70">{t('hero.transformationLabel') || 'of content work'}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <div className="flex flex-col items-center px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-2xl sm:text-3xl font-bold text-primary">
              {t('hero.transformationAfter') || '15 min'}
            </span>
            <span className="text-xs sm:text-sm text-primary/70">{t('hero.transformationLabel') || 'of content work'}</span>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {isAuthenticated ? (
            // Signed in - show dashboard button
            <Button size="lg" className="w-full sm:w-auto min-w-[200px]" asChild>
              <Link href="/dashboard">
                {t('hero.goToDashboard') || 'Go to Dashboard'}
              </Link>
            </Button>
          ) : (
            // Signed out - show sign up flow
            <>
              <div className="flex flex-col items-center">
                <Button size="lg" className="w-full sm:w-auto min-w-[200px]" asChild>
                  <Link href="/sign-up">
                    {t('hero.ctaFree') || 'Start Free - No Credit Card'}
                  </Link>
                </Button>
                <span className="text-xs text-muted-foreground mt-2">
                  {t('hero.freePlanInfo') || '2 brands, 20 posts/month free'}
                </span>
              </div>
              <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]" asChild>
                <a href="#pricing">
                  {t('hero.viewPricing') || 'View Pricing'}
                </a>
              </Button>
            </>
          )}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{t('hero.trustNoCreditCard')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{t('hero.trustCancel')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{t('hero.trustLocalData')}</span>
          </div>
        </motion.div>

      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-white/40 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
