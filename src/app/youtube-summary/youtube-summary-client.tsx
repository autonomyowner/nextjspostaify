'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'

type Step = 'input' | 'processing' | 'result'

interface UsageData {
  date: string
  count: number
}

const STORAGE_KEY = 'postaify_summary_usage'
const DAILY_LIMIT = 3

function getUsageData(): UsageData {
  if (typeof window === 'undefined') return { date: '', count: 0 }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Invalid data, reset
  }
  return { date: '', count: 0 }
}

function incrementUsage(): boolean {
  const today = new Date().toDateString()
  const usage = getUsageData()

  // Reset if new day
  if (usage.date !== today) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 1 }))
    return true
  }

  // Check limit
  if (usage.count >= DAILY_LIMIT) {
    return false
  }

  // Increment
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: usage.count + 1 }))
  return true
}

function getRemainingUsage(): number {
  const today = new Date().toDateString()
  const usage = getUsageData()

  if (usage.date !== today) {
    return DAILY_LIMIT
  }

  return Math.max(0, DAILY_LIMIT - usage.count)
}

export default function YouTubeSummaryClient() {
  const [step, setStep] = useState<Step>('input')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateSummary = useAction(api.tools.generateYouTubeSummary)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic YouTube URL validation
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL')
      return
    }

    // Check usage limit
    const remaining = getRemainingUsage()
    if (remaining <= 0) {
      setError(`You've reached your daily limit of ${DAILY_LIMIT} summaries. Sign up for unlimited access!`)
      return
    }

    setStep('processing')
    setIsGenerating(true)

    try {
      const result = await generateSummary({
        youtubeUrl,
      })

      setSummary(result.summary)
      setVideoTitle(result.videoTitle)
      setStep('result')

      // Increment usage after successful generation
      incrementUsage()
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate summary. Please try again.')
      setStep('input')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetTool = () => {
    setStep('input')
    setYoutubeUrl('')
    setSummary('')
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
            &larr; All Free Tools
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Free YouTube Video Summarizer
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get AI-powered summaries of any YouTube video in seconds. No signup required.
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
                {isGenerating ? 'Generating...' : 'Summarize Video - Free'}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              No signup required. {getRemainingUsage()} free summaries remaining today.
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
              <p className="text-white font-medium">Summarizing video...</p>
              <div className="text-muted-foreground space-y-1">
                <p className="animate-pulse">Fetching video information...</p>
                <p className="animate-pulse" style={{ animationDelay: '0.5s' }}>Analyzing content...</p>
                <p className="animate-pulse" style={{ animationDelay: '1s' }}>Generating summary...</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Result (Full Summary - No Email Gate) */}
        {step === 'result' && (
          <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Video Summary</h2>
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

            {videoTitle && (
              <p className="text-sm text-muted-foreground mb-4">
                From: {videoTitle}
              </p>
            )}

            {/* Full Summary */}
            <div className="bg-secondary/50 rounded-lg p-4 mb-6">
              <div className="whitespace-pre-wrap text-sm leading-relaxed prose prose-invert max-w-none">
                {summary}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={resetTool}
                className="flex-1 bg-secondary hover:bg-secondary/80 py-2.5 rounded-lg font-medium transition-colors"
              >
                Summarize Another Video
              </button>
            </div>

            {/* Upsell */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Turn This Into Social Media Posts</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Convert YouTube videos into ready-to-post content for LinkedIn, Twitter, Instagram, TikTok, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/sign-up"
                  className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-black px-6 py-2.5 rounded-lg font-bold hover:from-amber-400 hover:to-orange-400 transition-all"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/tools"
                  className="inline-block bg-secondary hover:bg-secondary/80 px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Try Free Tools
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border text-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Paste URL</h3>
              <p className="text-sm text-muted-foreground">
                Copy any YouTube video URL and paste it into the input field above.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border text-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes the video content and extracts the key information.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border text-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get Summary</h3>
              <p className="text-sm text-muted-foreground">
                Receive a comprehensive summary with key takeaways in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Features</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Instant AI-powered summaries',
              'Key takeaways extraction',
              'Works with any YouTube video',
              'No account required',
              'Copy to clipboard with one click',
              'Works with long-form content',
            ].map((feature, i) => (
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
            {[
              {
                question: 'Is this YouTube summarizer really free?',
                answer: 'Yes! You can summarize up to 3 videos per day completely free, with no signup required. For unlimited summaries and additional features, check out our paid plans.',
              },
              {
                question: 'How accurate are the summaries?',
                answer: 'Our AI uses advanced language models to analyze video transcripts and generate accurate, comprehensive summaries. The quality depends on the availability of video transcripts.',
              },
              {
                question: 'What types of YouTube videos work best?',
                answer: 'The summarizer works with any YouTube video that has closed captions or transcripts. Educational content, tutorials, podcasts, and informational videos typically produce the best results.',
              },
              {
                question: 'Can I use this for long videos?',
                answer: 'Yes! Our AI can handle videos of any length and will extract the most important points regardless of video duration.',
              },
            ].map((faq, i) => (
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

        {/* Cross-sell Footer */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">More Free Tools</h2>
          <p className="text-muted-foreground mb-6">
            Convert YouTube videos to platform-specific social media posts
          </p>
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
