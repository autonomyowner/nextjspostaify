import type { Metadata } from 'next'
import { Pricing } from '@/components/landing/Pricing'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose the perfect POSTAIFY plan for your social media needs. Free tier available with Pro and Business options for power users.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Pricing />
    </div>
  )
}
