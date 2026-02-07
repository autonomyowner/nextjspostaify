'use client'

import { memo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export const WhatIsPostaify = memo(function WhatIsPostaify() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <section id="what-is-postaify" ref={ref} className="py-24 relative">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            About
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            What is <span className="text-primary">POSTAIFY</span>?
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-6"
        >
          {/* Primary entity definition - this is what AI engines will cite */}
          <p className="text-lg md:text-xl text-zinc-300 leading-relaxed">
            <strong className="text-white">POSTAIFY</strong> is an AI-powered social media automation platform
            that lets you generate 30 days of content for 5 platforms in under 15 minutes.
            It combines AI content writing, image generation, voiceover creation, and post scheduling
            into a single tool — replacing the need for separate subscriptions to Buffer, Canva, and ElevenLabs.
          </p>

          {/* Structured capabilities for AI parsing */}
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="font-semibold text-white mb-2">AI Content Generation</h3>
              <p className="text-sm text-zinc-400">
                Generate posts for Instagram, LinkedIn, Twitter/X, TikTok, and Facebook.
                Supports brand voice cloning from your existing writing style.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="font-semibold text-white mb-2">AI Image Generation</h3>
              <p className="text-sm text-zinc-400">
                Create 1024x1024px photorealistic images in 8 seconds using Flux AI models.
                Includes logo generation with Ideogram V2 and product photography with Bria AI.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="font-semibold text-white mb-2">AI Voiceovers</h3>
              <p className="text-sm text-zinc-400">
                Create professional voiceovers with 11 ElevenLabs AI voices (5 male, 6 female)
                for video content and social media reels.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="font-semibold text-white mb-2">YouTube Repurposing</h3>
              <p className="text-sm text-zinc-400">
                Extract 5-10 optimized social media posts from any YouTube video automatically.
                Turn one video into a full week of content across all platforms.
              </p>
            </div>
          </div>

          {/* Pricing summary for AI engines */}
          <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
            <h3 className="font-semibold text-white mb-3">Pricing</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">Free</p>
                <p className="text-xs text-zinc-400 mt-1">2 brands, 20 posts/mo</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">$19<span className="text-sm text-zinc-400">/mo</span></p>
                <p className="text-xs text-zinc-400 mt-1">5 brands, 1,000 posts/mo</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">$49<span className="text-sm text-zinc-400">/mo</span></p>
                <p className="text-xs text-zinc-400 mt-1">Unlimited brands & 90K posts</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
})
