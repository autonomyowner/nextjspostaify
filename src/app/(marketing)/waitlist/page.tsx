'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [spotsLeft, setSpotsLeft] = useState(100)

  const captureEmail = useMutation(api.emails.capture)

  // Simulate decreasing spots (in production, this would come from the database)
  useEffect(() => {
    const storedSpots = localStorage.getItem('postaify-waitlist-spots')
    if (storedSpots) {
      setSpotsLeft(parseInt(storedSpots, 10))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      await captureEmail({
        email,
        marketingConsent: true,
        source: 'waitlist-early-bird',
        planInterest: 'PRO',
      })

      setIsSubmitted(true)

      // Decrease spots
      const newSpots = Math.max(0, spotsLeft - 1)
      setSpotsLeft(newSpots)
      localStorage.setItem('postaify-waitlist-spots', String(newSpots))
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Navigation */}
        <div className="mb-12">
          <Link href="/" className="text-primary hover:underline text-sm">
            &larr; Back to Home
          </Link>
        </div>

        {!isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Urgency Banner */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Only {spotsLeft} early-bird spots left
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Get <span className="text-primary">50% Off</span> for 3 Months
            </h1>

            <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              Be among the first 100 to join POSTAIFY and get exclusive early-bird pricing.
            </p>

            <p className="text-lg text-muted-foreground mb-8">
              <span className="line-through">$19/mo</span>{' '}
              <span className="text-primary font-bold">$9.50/mo</span> for your first 3 months
            </p>

            {/* What You Get */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8 max-w-lg mx-auto text-left">
              <h3 className="text-lg font-semibold mb-4 text-center">What Early Birds Get:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  <span className="text-muted-foreground">
                    <strong className="text-white">50% off</strong> your first 3 months ($9.50/mo instead of $19)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  <span className="text-muted-foreground">
                    <strong className="text-white">Priority access</strong> when we launch
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  <span className="text-muted-foreground">
                    <strong className="text-white">Founder&apos;s badge</strong> on your profile forever
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  <span className="text-muted-foreground">
                    <strong className="text-white">Direct access</strong> to the founding team
                  </span>
                </li>
              </ul>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting ? 'Joining...' : 'Claim My Spot'}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </form>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cancel anytime
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Discount locked forever
              </span>
            </div>

            {/* Countdown urgency */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-medium">{spotsLeft} spots remaining</span> at this price.
                After that, it&apos;s full price.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Success State */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              You&apos;re In!
            </h2>

            <p className="text-xl text-muted-foreground mb-4">
              Welcome to the founding crew.
            </p>

            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              We&apos;ve saved your early-bird spot. You&apos;ll be the first to know when we launch,
              and your <span className="text-primary font-semibold">50% discount</span> is locked in.
            </p>

            <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-auto mb-8">
              <h3 className="font-semibold mb-3">What happens next:</h3>
              <ol className="text-left text-muted-foreground space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">1.</span>
                  Check your inbox for a confirmation email
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">2.</span>
                  We&apos;ll email you when POSTAIFY launches
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">3.</span>
                  Use your exclusive link to claim your 50% discount
                </li>
              </ol>
            </div>

            {/* Share CTA */}
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-primary mb-2">Help a friend save too</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share POSTAIFY with others and help them get the early-bird discount before spots run out.
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Link copied to clipboard!')
                }}
                className="px-4 py-2 bg-primary text-black text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Copy Invite Link
              </button>
            </div>

            <div className="mt-8">
              <Link
                href="/"
                className="text-muted-foreground hover:text-white transition-colors text-sm"
              >
                &larr; Back to homepage
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
