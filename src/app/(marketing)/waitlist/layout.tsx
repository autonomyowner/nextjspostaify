import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join the Waitlist - Early Bird 50% Off | POSTAIFY',
  description: 'Be among the first 100 to join POSTAIFY and get 50% off for 3 months. AI-powered social media content generation at half the price.',
  alternates: {
    canonical: 'https://postaify.com/waitlist',
  },
}

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
