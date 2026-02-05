'use client'

import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { ShowcaseCarousel } from './ShowcaseCarousel'
import { ProblemSolution } from './ProblemSolution'
import { AgentFeatures } from './AgentFeatures'
import { HowItWorks } from './HowItWorks'
import { Pricing } from './Pricing'
import { FAQ } from './FAQ'
import { Footer } from './Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <ShowcaseCarousel />
      <ProblemSolution />
      <AgentFeatures />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  )
}
