'use client'

import Link from 'next/link'
import { Competitor } from '@/lib/competitors-config'
import { ComparisonTable } from '@/components/seo/ComparisonTable'

interface Props {
  competitor: Competitor
}

export function ComparisonPageClient({ competitor }: Props) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <Link href="/" className="text-xl font-bold text-yellow-400">
            POSTAIFY
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-yellow-400">
            {competitor.category} Comparison
          </p>
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">
            POSTAIFY vs {competitor.name}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Compare features, pricing, and capabilities. See why businesses choose
            POSTAIFY for AI-powered social media automation.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
            <p className="text-3xl font-bold text-yellow-400">$19/mo</p>
            <p className="mt-2 text-sm text-zinc-400">POSTAIFY Pro</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
            <p className="text-3xl font-bold text-zinc-400">
              {competitor.monthlyPrice}/mo
            </p>
            <p className="mt-2 text-sm text-zinc-400">{competitor.name}</p>
          </div>
          <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-6 text-center">
            <p className="text-3xl font-bold text-green-400">
              Save{' '}
              {Math.round(
                ((parseInt(competitor.monthlyPrice.replace('$', '')) - 19) /
                  parseInt(competitor.monthlyPrice.replace('$', ''))) *
                  100
              )}
              %
            </p>
            <p className="mt-2 text-sm text-zinc-400">with POSTAIFY</p>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Feature Comparison
        </h2>
        <ComparisonTable
          competitorName={competitor.name}
          features={competitor.features}
        />
      </section>

      {/* Pros and Cons */}
      <section className="bg-zinc-900/30 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-2xl font-bold">
            {competitor.name} - Pros & Cons
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Pros */}
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-green-400">
                Pros
              </h3>
              <ul className="space-y-3">
                {competitor.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 text-green-400">+</span>
                    <span className="text-zinc-300">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-red-400">Cons</h3>
              <ul className="space-y-3">
                {competitor.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 text-red-400">-</span>
                    <span className="text-zinc-300">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-2 font-semibold text-yellow-400">
              {competitor.name} is best for:
            </h3>
            <p className="text-zinc-300">{competitor.bestFor}</p>
          </div>
        </div>
      </section>

      {/* Why POSTAIFY */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Why Choose POSTAIFY?
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 p-6">
            <h3 className="mb-2 font-semibold text-yellow-400">
              All-in-One Platform
            </h3>
            <p className="text-sm text-zinc-400">
              Content generation, AI images, voiceovers, and scheduling in one
              tool. No need for 5+ subscriptions.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 p-6">
            <h3 className="mb-2 font-semibold text-yellow-400">
              30 Days in 15 Minutes
            </h3>
            <p className="text-sm text-zinc-400">
              Generate a month of content for 5 platforms in under 15 minutes
              with AI assistance.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 p-6">
            <h3 className="mb-2 font-semibold text-yellow-400">
              Pro Quality, Free Start
            </h3>
            <p className="text-sm text-zinc-400">
              Start free with 2 brands and 20 posts. Upgrade to Pro ($19/mo) for
              1,000 posts and 200 AI images.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 p-6">
            <h3 className="mb-2 font-semibold text-yellow-400">
              Flux Pro 1.1 Images
            </h3>
            <p className="text-sm text-zinc-400">
              Generate 1024x1024px photorealistic images in 8 seconds with
              state-of-the-art Flux models.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 p-6">
            <h3 className="mb-2 font-semibold text-yellow-400">
              11 ElevenLabs Voices
            </h3>
            <p className="text-sm text-zinc-400">
              Create professional voiceovers with 11 AI voices (5 male, 6
              female) for video content.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 p-6">
            <h3 className="mb-2 font-semibold text-yellow-400">
              YouTube Repurposing
            </h3>
            <p className="text-sm text-zinc-400">
              Extract 5-10 optimized posts from any YouTube video automatically.
              Turn one video into a week of content.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-zinc-900/30 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {competitor.faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
              >
                <h3 className="mb-3 font-semibold">{faq.question}</h3>
                <p className="text-zinc-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold">Ready to Try POSTAIFY?</h2>
        <p className="mb-8 text-zinc-400">
          Start free with 2 brands and 20 posts. No credit card required.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/sign-up"
            className="rounded-full bg-yellow-400 px-8 py-3 font-semibold text-black transition-colors hover:bg-yellow-300"
          >
            Start Free Today
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-zinc-700 px-8 py-3 font-semibold transition-colors hover:border-zinc-500"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} POSTAIFY. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-zinc-500">
              <Link href="/pricing" className="hover:text-white">
                Pricing
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
