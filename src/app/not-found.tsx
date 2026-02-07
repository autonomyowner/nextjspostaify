import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found | POSTAIFY',
  description: 'The page you are looking for does not exist. Explore POSTAIFY - AI-powered social media automation.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <p className="text-7xl font-bold text-yellow-400 mb-4">404</p>
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="text-zinc-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-yellow-400 px-8 py-3 font-semibold text-black transition-colors hover:bg-yellow-300"
          >
            Go Home
          </Link>
          <Link
            href="/tools"
            className="rounded-full border border-zinc-700 px-8 py-3 font-semibold transition-colors hover:border-zinc-500"
          >
            Free AI Tools
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-zinc-700 px-8 py-3 font-semibold transition-colors hover:border-zinc-500"
          >
            Pricing
          </Link>
        </div>
      </div>
    </div>
  )
}
