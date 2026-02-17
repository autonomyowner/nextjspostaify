'use client'

import { memo, useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

export const MotionClipShowcase = memo(function MotionClipShowcase() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShouldLoad(true), 300)
      return () => clearTimeout(timer)
    }
  }, [isInView])

  const features = [
    { title: 'Script to Cinema', desc: 'Type your ad script, get a cinematic clip' },
    { title: '8 Scene Types', desc: 'Hook, brand, features, stats, CTA & more' },
    { title: '60fps Animations', desc: 'Pro easing curves, glow effects, particles' },
    { title: 'Export to MP4', desc: 'Screen-record or export directly' },
  ]

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column — text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">
              Motion Clips
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Script to Cinema{' '}
              <span className="text-primary">in Seconds</span>
            </h2>
            <p className="mt-4 text-base lg:text-lg text-white/50 max-w-lg">
              Type your ad script and watch it transform into a cinematic video clip with professional animations, transitions, and effects.
            </p>

            <div className="mt-8 space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="flex gap-3"
                >
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="text-white font-medium text-sm">{f.title}</p>
                    <p className="text-white/40 text-sm">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="/sign-up"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-8 inline-block px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Motion Clips Free
            </motion.a>
          </motion.div>

          {/* Right column — phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <div className="relative w-[260px] sm:w-[280px] lg:w-[300px]">
              {/* Phone frame */}
              <div className="relative rounded-[40px] border-[3px] border-white/10 bg-black overflow-hidden shadow-2xl shadow-primary/5">
                {/* Notch */}
                <div className="relative z-10 flex justify-center pt-2 pb-1">
                  <div className="w-24 h-5 bg-black rounded-b-2xl border-b border-x border-white/10" />
                </div>

                {/* Screen */}
                <div className="relative aspect-[9/19] bg-black -mt-2">
                  {shouldLoad ? (
                    <iframe
                      src="/clips/motion-clip-intro.html"
                      className="absolute inset-0 w-full h-full border-0"
                      title="Motion Clip Demo"
                      allow="autoplay"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Home indicator */}
                <div className="flex justify-center py-2">
                  <div className="w-28 h-1 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
})
