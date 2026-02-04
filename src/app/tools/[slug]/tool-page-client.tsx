'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import type { ToolConfig } from '@/lib/tools-config'

interface ToolPageClientProps {
  slug: string
  tool: ToolConfig
}

type Step = 'input' | 'processing' | 'result' | 'unlocked'

export default function ToolPageClient({ slug, tool }: ToolPageClientProps) {
  const [step, setStep] = useState<Step>('input')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [email, setEmail] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  // Convex mutations
  const captureEmail = useMutation(api.tools.captureToolEmail)
  const trackFeatureClick = useMutation(api.tools.trackFeatureClick)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic YouTube URL validation
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL')
      return
    }

    setStep('processing')
    setIsGenerating(true)

    try {
      // Use API route for server-side rate limiting
      const response = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          youtubeUrl,
          platform: tool.platform,
          toolSlug: slug,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate content')
      }

      setGeneratedContent(result.content)
      setVideoTitle(result.videoTitle)
      setStep('result')
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate content. Please try again.')
      setStep('input')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    try {
      await captureEmail({
        email,
        toolSlug: slug,
        youtubeUrl,
      })
      setStep('unlocked')
    } catch (err) {
      console.error('Email capture error:', err)
      // Still unlock even if email capture fails
      setStep('unlocked')
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetTool = () => {
    setStep('input')
    setYoutubeUrl('')
    setEmail('')
    setGeneratedContent('')
    setVideoTitle('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/tools"
            className="inline-block text-sm text-muted-foreground hover:text-white mb-6 transition-colors"
          >
            &larr; Back to All Tools
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            {tool.h1}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {tool.description}
          </p>
        </div>

        {/* Step 1: Input */}
        {step === 'input' && (
          <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border">
            <form onSubmit={handleGenerate}>
              <label className="block text-sm font-medium mb-2">
                YouTube Video URL
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                required
                disabled={isGenerating}
              />
              {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              )}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black py-3 rounded-lg font-bold hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : `Generate ${tool.platform} Post - Free`}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              No signup required. One free conversion per tool.
            </p>
          </div>
        )}

        {/* Step 2: Processing */}
        {step === 'processing' && (
          <div className="bg-card rounded-2xl p-8 border border-border text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-white font-medium">Generating your {tool.platform} post...</p>
              <div className="text-muted-foreground space-y-1">
                <p className="animate-pulse">Fetching video information...</p>
                <p className="animate-pulse" style={{ animationDelay: '0.5s' }}>Analyzing content...</p>
                <p className="animate-pulse" style={{ animationDelay: '1s' }}>Crafting {tool.platform} post...</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Result with Email Gate */}
        {step === 'result' && (
          <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your {tool.platform} Post</h2>
              {videoTitle && (
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  From: {videoTitle}
                </span>
              )}
            </div>

            {/* Preview with blur */}
            <div className="relative bg-secondary/50 rounded-lg p-4 mb-6 overflow-hidden">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {generatedContent.slice(0, 200)}...
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card via-card/80 to-transparent"></div>
            </div>

            {/* Email capture */}
            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="text-center">
                <p className="text-white font-medium mb-1">Unlock your full post</p>
                <p className="text-sm text-muted-foreground">
                  Enter your email to see the complete content
                </p>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black py-3 rounded-lg font-bold hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                Unlock Full Post
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              We&apos;ll send you tips on content creation. Unsubscribe anytime.
            </p>
          </div>
        )}

        {/* Step 4: Unlocked Result */}
        {step === 'unlocked' && (
          <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your {tool.platform} Post</h2>
              <button
                onClick={copyToClipboard}
                className={`text-sm px-4 py-2 rounded-lg transition-all ${
                  copied
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 mb-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{generatedContent}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={resetTool}
                className="flex-1 bg-secondary hover:bg-secondary/80 py-2.5 rounded-lg font-medium transition-colors"
              >
                Convert Another Video
              </button>
            </div>

            {/* Thumbnail Upsell - specific to this post */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Make it visual</h3>
                  <p className="text-sm text-muted-foreground">Generate an AI thumbnail for this post</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Posts with images get 2x more engagement. Create a matching visual in seconds.
              </p>

              <Link
                href="/sign-up?feature=ai-images&redirect=/dashboard"
                onClick={() => {
                  // Track the click for analytics
                  trackFeatureClick({
                    feature: 'thumbnail-upsell',
                    toolSlug: slug,
                  })
                }}
                className="block w-full text-center bg-gradient-to-r from-amber-500 to-orange-500 text-black py-3 rounded-lg font-bold hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                Generate Image - Pro Feature
              </Link>

              <p className="text-center text-xs text-muted-foreground mt-3">
                Includes 200 AI images/month + unlimited conversions
              </p>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Features</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {tool.features.map((feature, i) => (
              <div
                key={i}
                className="bg-card rounded-lg p-4 border border-border flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {tool.faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-card rounded-lg p-6 border border-border"
              >
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Other Tools */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Try Other Tools</h2>
          <Link
            href="/tools"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            View All Free Tools &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
