'use client'

import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { LogoBar } from './LogoBar'
import { ShowcaseCarousel } from './ShowcaseCarousel'
import { ProblemSolution } from './ProblemSolution'
import { AgentFeatures } from './AgentFeatures'
import { MotionClipShowcase } from './MotionClipShowcase'
import { HowItWorks } from './HowItWorks'
import { WhatIsPostaify } from './WhatIsPostaify'
import { Pricing } from './Pricing'
import { FAQ } from './FAQ'
import { BlogPreview } from './BlogPreview'
import { Footer } from './Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <LogoBar />
      <ShowcaseCarousel />
      <ProblemSolution />
      <AgentFeatures />
      <MotionClipShowcase />
      <HowItWorks />
      <WhatIsPostaify />
      <Pricing />
      <FAQ />
      <BlogPreview />
      <Footer />
    </div>
  )
}
