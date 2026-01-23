'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// Animated particle component for the visualization
function Particle({ delay, duration, startX, startY, endX, endY }: {
  delay: number
  duration: number
  startX: number
  startY: number
  endX: number
  endY: number
}) {
  return (
    <motion.circle
      r="2"
      fill="url(#particleGradient)"
      initial={{ cx: startX, cy: startY, opacity: 0, scale: 0 }}
      animate={{
        cx: [startX, endX],
        cy: [startY, endY],
        opacity: [0, 1, 1, 0],
        scale: [0, 1.5, 1, 0]
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

// Data flow line with animated dash
function DataFlowLine({ d, delay, color }: { d: string; delay: number; color: string }) {
  return (
    <>
      <motion.path
        d={d}
        stroke={color}
        strokeWidth="1"
        fill="none"
        strokeOpacity="0.1"
      />
      <motion.path
        d={d}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0.3, 0.8, 0.3] }}
        transition={{
          pathLength: { duration: 2, delay, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 2, delay, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </>
  )
}

// Pulsing node component
function PulsingNode({ cx, cy, isActive, label, delay }: {
  cx: number
  cy: number
  isActive: boolean
  label: string
  delay: number
}) {
  return (
    <g>
      {/* Outer glow rings */}
      <motion.circle
        cx={cx}
        cy={cy}
        r="20"
        fill="none"
        stroke="hsl(48, 96%, 53%)"
        strokeWidth="1"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={isActive ? {
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5]
        } : { scale: 1, opacity: 0.1 }}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r="30"
        fill="none"
        stroke="hsl(48, 96%, 53%)"
        strokeWidth="0.5"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={isActive ? {
          scale: [1, 1.8, 1],
          opacity: [0.3, 0, 0.3]
        } : { scale: 1, opacity: 0 }}
        transition={{ duration: 2.5, repeat: Infinity, delay: delay + 0.3 }}
      />

      {/* Main node */}
      <motion.circle
        cx={cx}
        cy={cy}
        r="12"
        fill={isActive ? "hsl(48, 96%, 53%)" : "hsl(48, 30%, 20%)"}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: delay * 0.2 }}
        style={{
          filter: isActive ? "drop-shadow(0 0 15px hsl(48, 96%, 53%))" : "none"
        }}
      />

      {/* Inner highlight */}
      <motion.circle
        cx={cx}
        cy={cy}
        r="6"
        fill={isActive ? "white" : "hsl(262, 50%, 40%)"}
        initial={{ scale: 0 }}
        animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 1.5, repeat: Infinity, delay }}
      />

      {/* Label */}
      <motion.text
        x={cx}
        y={cy + 35}
        textAnchor="middle"
        fill={isActive ? "white" : "hsl(0, 0%, 50%)"}
        fontSize="10"
        fontWeight="500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay * 0.2 + 0.3 }}
      >
        {label}
      </motion.text>
    </g>
  )
}

// Main visualization component
function DataVisualization({ activeStep }: { activeStep: number }) {
  const particleCount = 20

  // Node positions for 4-step flow
  const nodes = [
    { x: 60, y: 80, label: "INPUT" },
    { x: 180, y: 150, label: "PROCESS" },
    { x: 300, y: 80, label: "GENERATE" },
    { x: 420, y: 150, label: "OUTPUT" }
  ]

  // Connection paths between nodes
  const paths = [
    { d: "M 72 80 Q 126 60 168 150", delay: 0 },
    { d: "M 192 150 Q 240 100 288 80", delay: 0.5 },
    { d: "M 312 80 Q 366 60 408 150", delay: 1 }
  ]

  // Generate particles along paths
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const pathIndex = i % 3
    const progress = (i / particleCount) * 3
    return {
      id: i,
      startX: nodes[pathIndex].x,
      startY: nodes[pathIndex].y,
      endX: nodes[pathIndex + 1].x,
      endY: nodes[pathIndex + 1].y,
      delay: progress * 0.5,
      duration: 2 + Math.random()
    }
  })

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Background glow effect */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at ${30 + activeStep * 20}% 50%, hsl(48, 96%, 40%) 0%, transparent 50%)`
        }}
      />

      <svg
        viewBox="0 0 480 280"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradient for particles */}
          <radialGradient id="particleGradient">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="hsl(48, 96%, 53%)" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Grid pattern */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.3" strokeOpacity="0.1" />
          </pattern>
        </defs>

        {/* Background grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Horizontal scan lines */}
        {[60, 120, 180, 240].map((y, i) => (
          <motion.line
            key={i}
            x1="0"
            y1={y}
            x2="480"
            y2={y}
            stroke="hsl(48, 96%, 53%)"
            strokeWidth="0.5"
            strokeOpacity="0.1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: i * 0.1 }}
          />
        ))}

        {/* Data flow connections */}
        <g filter="url(#glow)">
          {paths.map((path, i) => (
            <DataFlowLine
              key={i}
              d={path.d}
              delay={path.delay}
              color={i <= activeStep ? "hsl(48, 96%, 53%)" : "hsl(48, 30%, 30%)"}
            />
          ))}
        </g>

        {/* Animated particles */}
        <g filter="url(#glow)">
          {particles.map((p) => (
            <Particle
              key={p.id}
              delay={p.delay}
              duration={p.duration}
              startX={p.startX}
              startY={p.startY}
              endX={p.endX}
              endY={p.endY}
            />
          ))}
        </g>

        {/* Processing nodes */}
        {nodes.map((node, i) => (
          <PulsingNode
            key={i}
            cx={node.x}
            cy={node.y}
            isActive={i === activeStep}
            label={node.label}
            delay={i * 0.2}
          />
        ))}

        {/* Active step indicator beam */}
        <motion.rect
          x={nodes[activeStep].x - 40}
          y="230"
          width="80"
          height="3"
          rx="1.5"
          fill="hsl(48, 96%, 53%)"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ filter: "drop-shadow(0 0 10px hsl(48, 96%, 53%))" }}
        />

        {/* Step progress bar */}
        <g>
          <rect x="60" y="250" width="360" height="4" rx="2" fill="hsl(262, 20%, 15%)" />
          <motion.rect
            x="60"
            y="250"
            height="4"
            rx="2"
            fill="hsl(48, 96%, 53%)"
            initial={{ width: 0 }}
            animate={{ width: 90 * (activeStep + 1) }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ filter: "drop-shadow(0 0 8px hsl(48, 96%, 53%))" }}
          />
        </g>

        {/* Data metrics floating display */}
        <AnimatePresence mode="wait">
          <motion.g
            key={activeStep}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <rect
              x="340"
              y="200"
              width="120"
              height="40"
              rx="6"
              fill="hsl(262, 30%, 10%)"
              stroke="hsl(48, 96%, 53%)"
              strokeWidth="1"
              strokeOpacity="0.3"
            />
            <text x="350" y="218" fill="hsl(48, 96%, 70%)" fontSize="8" fontFamily="monospace">
              STEP {String(activeStep + 1).padStart(2, '0')}
            </text>
            <text x="350" y="232" fill="white" fontSize="10" fontWeight="600">
              {["Analyzing...", "Processing...", "Generating...", "Complete!"][activeStep]}
            </text>

            {/* Blinking cursor */}
            <motion.rect
              x="440"
              y="222"
              width="8"
              height="12"
              fill="hsl(48, 96%, 53%)"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.g>
        </AnimatePresence>

        {/* Corner decorations */}
        <g stroke="hsl(48, 96%, 53%)" strokeWidth="1" strokeOpacity="0.5" fill="none">
          <path d="M 10 25 L 10 10 L 25 10" />
          <path d="M 455 10 L 470 10 L 470 25" />
          <path d="M 470 255 L 470 270 L 455 270" />
          <path d="M 25 270 L 10 270 L 10 255" />
        </g>
      </svg>

      {/* Overlay scan effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, hsl(48, 96%, 53%) 50%, transparent 100%)",
          height: "2px"
        }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

export function HowItWorks() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeStep, setActiveStep] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  // Auto-cycle through steps when not hovering
  useEffect(() => {
    if (isHovering) return

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4)
    }, 3000)

    return () => clearInterval(interval)
  }, [isHovering])

  const steps = [
    {
      number: "01",
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description')
    },
    {
      number: "02",
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description')
    },
    {
      number: "03",
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description')
    },
    {
      number: "04",
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description')
    }
  ]

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] md:w-[800px] md:h-[600px] bg-primary/5 rounded-full blur-[100px] md:blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('howItWorks.title')} <span className="text-primary">{t('howItWorks.titleHighlight')}</span>
          </h2>
        </motion.div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Steps */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index + 0.3 }}
                className={`relative p-5 rounded-xl cursor-pointer transition-all duration-300 group ${
                  activeStep === index
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-card/30 border border-white/5 hover:border-white/10'
                }`}
                onClick={() => setActiveStep(index)}
              >
                {/* Active indicator line */}
                {activeStep === index && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-e-full"
                    style={{ filter: "drop-shadow(0 0 8px hsl(48, 96%, 53%))" }}
                  />
                )}

                <div className="flex items-start gap-4">
                  {/* Step Number */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    activeStep === index
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-muted-foreground group-hover:bg-white/10'
                  }`}>
                    <span className="text-lg font-bold font-mono">{step.number}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-1 transition-colors duration-300 ${
                      activeStep === index ? 'text-white' : 'text-white/80'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      activeStep === index ? 'text-muted-foreground' : 'text-muted-foreground/70'
                    }`}>
                      {step.description}
                    </p>
                  </div>

                  {/* Progress indicator */}
                  {activeStep === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0 w-2 h-2 rounded-full bg-primary animate-pulse"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Side - Dynamic Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            {/* Visualization container with glassmorphism */}
            <div className="relative rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10">
              {/* Top bar decoration */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="ms-3 text-xs text-muted-foreground font-mono">ai_pipeline.viz</span>
              </div>

              {/* Visualization */}
              <div className="p-4">
                <DataVisualization activeStep={activeStep} />
              </div>

              {/* Bottom status bar */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-xs text-muted-foreground font-mono">LIVE</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-yellow-500/10 rounded-full blur-xl" />
          </motion.div>
        </div>

      </div>
    </section>
  )
}
