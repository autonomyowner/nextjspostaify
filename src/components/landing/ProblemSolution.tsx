'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'

// Chaotic scattered elements for "old way" visualization
function ChaoticElements({ isActive }: { isActive: boolean }) {
  const elements = [
    { x: 50, y: 40, size: 30, delay: 0 },
    { x: 120, y: 80, size: 25, delay: 0.2 },
    { x: 80, y: 130, size: 35, delay: 0.4 },
    { x: 160, y: 50, size: 20, delay: 0.1 },
    { x: 140, y: 140, size: 28, delay: 0.3 },
    { x: 40, y: 100, size: 22, delay: 0.5 },
  ]

  return (
    <g>
      {elements.map((el, i) => (
        <g key={i}>
          {/* Scattered document shapes */}
          <motion.rect
            x={el.x}
            y={el.y}
            width={el.size}
            height={el.size * 1.3}
            rx="3"
            fill="hsl(0, 60%, 25%)"
            stroke="hsl(0, 70%, 40%)"
            strokeWidth="1"
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={isActive ? {
              opacity: [0.3, 0.6, 0.3],
              scale: 1,
              rotate: [0, -5, 5, 0],
              x: [0, ((i * 3) % 10) - 5, 0],
              y: [0, ((i * 7) % 10) - 5, 0]
            } : { opacity: 0, scale: 0 }}
            transition={{
              duration: 3,
              delay: el.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Document lines */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 0.5 } : { opacity: 0 }}
            transition={{ delay: el.delay + 0.2 }}
          >
            <line x1={el.x + 4} y1={el.y + 6} x2={el.x + el.size - 4} y2={el.y + 6} stroke="hsl(0, 50%, 50%)" strokeWidth="1" />
            <line x1={el.x + 4} y1={el.y + 12} x2={el.x + el.size - 8} y2={el.y + 12} stroke="hsl(0, 50%, 50%)" strokeWidth="1" />
            <line x1={el.x + 4} y1={el.y + 18} x2={el.x + el.size - 6} y2={el.y + 18} stroke="hsl(0, 50%, 50%)" strokeWidth="1" />
          </motion.g>
        </g>
      ))}

      {/* Clock icon showing time waste */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <circle cx="100" cy="90" r="25" fill="none" stroke="hsl(0, 70%, 50%)" strokeWidth="2" strokeDasharray="4 2" />
        <motion.line
          x1="100"
          y1="90"
          x2="100"
          y2="72"
          stroke="hsl(0, 70%, 60%)"
          strokeWidth="2"
          strokeLinecap="round"
          animate={isActive ? { rotate: [0, 360] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 90px" }}
        />
        <motion.line
          x1="100"
          y1="90"
          x2="112"
          y2="90"
          stroke="hsl(0, 70%, 60%)"
          strokeWidth="2"
          strokeLinecap="round"
          animate={isActive ? { rotate: [0, 360] } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 90px" }}
        />
      </motion.g>

      {/* Stress indicators */}
      {[30, 90, 150].map((x, i) => (
        <motion.text
          key={i}
          x={x}
          y={170}
          fill="hsl(0, 70%, 50%)"
          fontSize="16"
          initial={{ opacity: 0, y: 10 }}
          animate={isActive ? {
            opacity: [0, 1, 0],
            y: [10, 0, -10]
          } : { opacity: 0 }}
          transition={{
            duration: 2,
            delay: i * 0.5,
            repeat: Infinity
          }}
        >
          !
        </motion.text>
      ))}
    </g>
  )
}

// Smooth automated flow for "new way" visualization
function AutomatedFlow({ isActive }: { isActive: boolean }) {
  return (
    <g>
      {/* Central processing node */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Outer glow rings */}
        <motion.circle
          cx="100"
          cy="90"
          r="40"
          fill="none"
          stroke="hsl(142, 70%, 45%)"
          strokeWidth="1"
          animate={isActive ? {
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle
          cx="100"
          cy="90"
          r="50"
          fill="none"
          stroke="hsl(142, 70%, 45%)"
          strokeWidth="0.5"
          animate={isActive ? {
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3]
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
        />

        {/* Main hub */}
        <circle cx="100" cy="90" r="30" fill="hsl(142, 50%, 15%)" stroke="hsl(142, 70%, 45%)" strokeWidth="2" />
        <motion.circle
          cx="100"
          cy="90"
          r="20"
          fill="hsl(142, 70%, 40%)"
          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ filter: "drop-shadow(0 0 10px hsl(142, 70%, 45%))" }}
        />
        <circle cx="100" cy="90" r="8" fill="white" />
      </motion.g>

      {/* Input streams */}
      {[
        { startX: 10, startY: 50, endX: 70, endY: 90 },
        { startX: 10, startY: 90, endX: 70, endY: 90 },
        { startX: 10, startY: 130, endX: 70, endY: 90 },
      ].map((path, i) => (
        <g key={`input-${i}`}>
          <motion.path
            d={`M ${path.startX} ${path.startY} Q 40 ${path.startY} ${path.endX} ${path.endY}`}
            stroke="hsl(142, 70%, 45%)"
            strokeWidth="2"
            fill="none"
            strokeOpacity="0.2"
            initial={{ pathLength: 0 }}
            animate={isActive ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1, delay: i * 0.2 }}
          />
          <motion.circle
            cx={path.startX}
            cy={path.startY}
            r="3"
            fill="hsl(142, 70%, 60%)"
            initial={{ opacity: 0 }}
            animate={isActive ? {
              opacity: [0, 1, 1, 0],
              cx: [path.startX, path.endX],
              cy: [path.startY, path.endY]
            } : { opacity: 0, cx: path.startX, cy: path.startY }}
            transition={{
              duration: 1.5,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: "drop-shadow(0 0 4px hsl(142, 70%, 60%))" }}
          />
        </g>
      ))}

      {/* Output streams */}
      {[
        { startX: 130, startY: 90, endX: 190, endY: 50 },
        { startX: 130, startY: 90, endX: 190, endY: 90 },
        { startX: 130, startY: 90, endX: 190, endY: 130 },
      ].map((path, i) => (
        <g key={`output-${i}`}>
          <motion.path
            d={`M ${path.startX} ${path.startY} Q 160 ${path.endY} ${path.endX} ${path.endY}`}
            stroke="hsl(142, 70%, 45%)"
            strokeWidth="2"
            fill="none"
            strokeOpacity="0.2"
            initial={{ pathLength: 0 }}
            animate={isActive ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
          />
          <motion.circle
            cx={path.startX}
            cy={path.startY}
            r="3"
            fill="hsl(142, 70%, 60%)"
            initial={{ opacity: 0 }}
            animate={isActive ? {
              opacity: [0, 1, 1, 0],
              cx: [path.startX, path.endX],
              cy: [path.startY, path.endY]
            } : { opacity: 0, cx: path.startX, cy: path.startY }}
            transition={{
              duration: 1.5,
              delay: 0.8 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: "drop-shadow(0 0 4px hsl(142, 70%, 60%))" }}
          />
        </g>
      ))}

      {/* Output content cards */}
      {[
        { x: 185, y: 35, delay: 1 },
        { x: 185, y: 75, delay: 1.3 },
        { x: 185, y: 115, delay: 1.6 },
      ].map((card, i) => (
        <motion.g
          key={`card-${i}`}
          initial={{ opacity: 0, x: -10 }}
          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
          transition={{ delay: card.delay, duration: 0.3 }}
        >
          <rect
            x={card.x}
            y={card.y}
            width="25"
            height="30"
            rx="3"
            fill="hsl(142, 40%, 20%)"
            stroke="hsl(142, 70%, 45%)"
            strokeWidth="1"
          />
          <line x1={card.x + 4} y1={card.y + 8} x2={card.x + 21} y2={card.y + 8} stroke="hsl(142, 70%, 50%)" strokeWidth="1" />
          <line x1={card.x + 4} y1={card.y + 14} x2={card.x + 18} y2={card.y + 14} stroke="hsl(142, 70%, 50%)" strokeWidth="1" />
          <line x1={card.x + 4} y1={card.y + 20} x2={card.x + 15} y2={card.y + 20} stroke="hsl(142, 70%, 50%)" strokeWidth="1" />

          {/* Checkmark */}
          <motion.path
            d={`M ${card.x + 8} ${card.y + 26} l 3 3 l 6 -6`}
            stroke="hsl(142, 70%, 60%)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={isActive ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ delay: card.delay + 0.3, duration: 0.3 }}
          />
        </motion.g>
      ))}

      {/* Success sparkles */}
      {isActive && [
        { x: 160, y: 40 },
        { x: 180, y: 100 },
        { x: 150, y: 140 },
      ].map((spark, i) => (
        <motion.text
          key={i}
          x={spark.x}
          y={spark.y}
          fill="hsl(142, 70%, 60%)"
          fontSize="12"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
            y: [spark.y, spark.y - 10, spark.y]
          }}
          transition={{
            duration: 2,
            delay: 1.5 + i * 0.4,
            repeat: Infinity
          }}
        >
          ✓
        </motion.text>
      ))}
    </g>
  )
}

// Transformation arrow animation
function TransformationArrow({ isAnimating }: { isAnimating: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-0">
      <motion.div
        className="relative"
        animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-primary/30 rounded-full blur-xl"
          animate={isAnimating ? { opacity: [0.3, 0.6, 0.3] } : { opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Arrow container */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-card border border-primary/30 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <motion.path
              d="M8 16H24M24 16L18 10M24 16L18 22"
              stroke="hsl(48, 96%, 53%)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={isAnimating ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
            />
          </svg>
        </div>
      </motion.div>

      {/* Label */}
      <motion.span
        className="mt-3 text-xs font-medium text-primary"
        animate={isAnimating ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        TRANSFORM
      </motion.span>
    </div>
  )
}

// Main comparison visualization
function ComparisonVisualization({ activeMode }: { activeMode: 'before' | 'after' | 'both' }) {
  return (
    <div className="relative w-full">
      {/* Container with glassmorphism */}
      <div className="relative rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
          <span className="ms-3 text-xs text-muted-foreground font-mono">workflow_comparison.viz</span>
        </div>

        {/* Visualization area */}
        <div className="grid grid-cols-7 gap-0 p-4">
          {/* Before side */}
          <div className="col-span-3 relative">
            <div className={`absolute top-2 start-2 px-2 py-1 rounded text-xs font-mono ${
              activeMode === 'before' || activeMode === 'both' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-muted-foreground'
            }`}>
              MANUAL
            </div>
            <svg viewBox="0 0 200 180" className="w-full h-48 md:h-56">
              <defs>
                <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g filter="url(#redGlow)">
                <ChaoticElements isActive={activeMode === 'before' || activeMode === 'both'} />
              </g>
            </svg>
          </div>

          {/* Center arrow */}
          <div className="col-span-1 flex items-center justify-center">
            <TransformationArrow isAnimating={activeMode === 'both'} />
          </div>

          {/* After side */}
          <div className="col-span-3 relative">
            <div className={`absolute top-2 end-2 px-2 py-1 rounded text-xs font-mono ${
              activeMode === 'after' || activeMode === 'both' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-muted-foreground'
            }`}>
              AUTOMATED
            </div>
            <svg viewBox="0 0 200 180" className="w-full h-48 md:h-56">
              <defs>
                <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g filter="url(#greenGlow)">
                <AutomatedFlow isActive={activeMode === 'after' || activeMode === 'both'} />
              </g>
            </svg>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 px-4 py-3 border-t border-white/5 bg-black/20">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-lg font-bold text-red-400">8+ hrs</div>
            <div className="text-xs text-muted-foreground">Manual Time</div>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="text-lg font-bold text-primary">→</div>
            <div className="text-xs text-muted-foreground">Becomes</div>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="text-lg font-bold text-green-400">5 min</div>
            <div className="text-xs text-muted-foreground">Automated</div>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-500/10 rounded-full blur-xl" />
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-500/10 rounded-full blur-xl" />
    </div>
  )
}

export function ProblemSolution() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeCard, setActiveCard] = useState<'before' | 'after' | null>(null)
  const [autoPlay, setAutoPlay] = useState(true)

  // Auto-cycle visualization
  useEffect(() => {
    if (!autoPlay || activeCard) return

    const interval = setInterval(() => {
      setActiveCard(prev => {
        if (prev === null) return 'before'
        if (prev === 'before') return 'after'
        return null
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [autoPlay, activeCard])

  // Determine visualization mode
  const visualizationMode = activeCard || 'both'

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-red-500/5 rounded-full blur-[100px] md:blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-green-500/5 rounded-full blur-[100px] md:blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('problem.title')} <span className="text-primary">{t('problem.titleHighlight')}</span>
          </h2>
        </motion.div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Comparison Cards */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => {
              setAutoPlay(true)
              setActiveCard(null)
            }}
          >
            {/* Before Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              onMouseEnter={() => setActiveCard('before')}
              className="cursor-pointer"
            >
              <Card className={`p-5 h-full transition-all duration-300 ${
                activeCard === 'before'
                  ? 'bg-red-500/10 border-red-500/40 scale-[1.02]'
                  : 'bg-red-500/5 border-red-500/20 hover:border-red-500/30'
              }`}>
                {/* Active indicator */}
                {activeCard === 'before' && (
                  <motion.div
                    layoutId="problemIndicator"
                    className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-red-500 rounded-e-full"
                    style={{ filter: "drop-shadow(0 0 8px hsl(0, 70%, 50%))" }}
                  />
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    activeCard === 'before' ? 'bg-red-500/30' : 'bg-red-500/20'
                  }`}>
                    <span className="text-red-400 text-lg">✕</span>
                  </div>
                  <div>
                    <div className="text-red-400 text-xs font-medium uppercase tracking-wider">{t('problem.oldWay')}</div>
                    <h3 className="text-lg font-semibold">{t('problem.before.title')}</h3>
                  </div>
                </div>

                <ul className="space-y-2">
                  {[
                    t('problem.before.point1'),
                    t('problem.before.point2'),
                    t('problem.before.point3'),
                    t('problem.before.point4'),
                    t('problem.before.point5')
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.4 + i * 0.05 }}
                    >
                      <span className="text-red-400/70 mt-0.5 text-xs">×</span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            {/* After Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              onMouseEnter={() => setActiveCard('after')}
              className="cursor-pointer"
            >
              <Card className={`p-5 h-full transition-all duration-300 relative ${
                activeCard === 'after'
                  ? 'bg-green-500/10 border-green-500/40 scale-[1.02]'
                  : 'bg-green-500/5 border-green-500/20 hover:border-green-500/30'
              }`}>
                {/* Active indicator */}
                {activeCard === 'after' && (
                  <motion.div
                    layoutId="problemIndicator"
                    className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-green-500 rounded-e-full"
                    style={{ filter: "drop-shadow(0 0 8px hsl(142, 70%, 45%))" }}
                  />
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    activeCard === 'after' ? 'bg-green-500/30' : 'bg-green-500/20'
                  }`}>
                    <span className="text-green-400 text-lg">✓</span>
                  </div>
                  <div>
                    <div className="text-green-400 text-xs font-medium uppercase tracking-wider">{t('problem.newWay')}</div>
                    <h3 className="text-lg font-semibold">{t('problem.after.title')}</h3>
                  </div>
                </div>

                <ul className="space-y-2">
                  {[
                    t('problem.after.point1'),
                    t('problem.after.point2'),
                    t('problem.after.point3'),
                    t('problem.after.point4'),
                    t('problem.after.point5')
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + i * 0.05 }}
                    >
                      <span className="text-green-400/70 mt-0.5 text-xs">✓</span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </motion.div>

          {/* Right Side - Dynamic Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:sticky lg:top-24"
          >
            <ComparisonVisualization activeMode={visualizationMode as 'before' | 'after' | 'both'} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
