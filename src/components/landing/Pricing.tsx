'use client'

import { useRef, useState, useEffect, type MouseEvent } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StripeCheckout } from './StripeCheckout'
import { EmailCaptureModal } from './EmailCaptureModal'
import { cn } from '@/lib/utils'

// Hook to detect touch/mobile devices
const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768)
  }, [])

  return isTouch
}

interface Plan {
  name: string
  description: string
  price: string
  priceYearly?: string
  saveAmount?: string
  features: string[]
  cta: string
  popular: boolean
}

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  popular?: boolean
}

function TiltCard({ children, className, popular }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isTouch = useIsTouchDevice()

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], isTouch ? ["0deg", "0deg"] : ["12deg", "-12deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], isTouch ? ["0deg", "0deg"] : ["-12deg", "12deg"])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isTouch) return

    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={isTouch ? undefined : handleMouseMove}
      onMouseLeave={isTouch ? undefined : handleMouseLeave}
      style={{
        rotateX: isTouch ? 0 : rotateX,
        rotateY: isTouch ? 0 : rotateY,
        transformStyle: isTouch ? undefined : "preserve-3d",
      }}
      className="relative"
    >
      {/* Glow effect that follows cursor - hidden on touch */}
      {!isTouch && (
        <motion.div
          className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: popular
              ? "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(234, 179, 8, 0.15), transparent 40%)"
              : "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.06), transparent 40%)",
          }}
        />
      )}
      <Card
        className={cn(
          "h-full p-6 relative transition-all duration-200",
          !isTouch && "hover:border-white/20",
          isTouch && "active:scale-[0.98]",
          popular && "border-primary glow-yellow",
          className
        )}
        style={isTouch ? undefined : {
          transform: "translateZ(50px)",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </Card>
    </motion.div>
  )
}

export function Pricing() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [emailCaptureOpen, setEmailCaptureOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string; isYearly: boolean } | null>(null)
  const [isYearly, setIsYearly] = useState(true)

  const handleSelectPlan = (plan: Plan) => {
    // Don't show email capture for free plan
    if (plan.price === '£0' || plan.price === '$0') {
      window.location.href = '/dashboard'
      return
    }

    const price = isYearly && plan.priceYearly ? plan.priceYearly : plan.price
    setSelectedPlan({ name: plan.name, price, isYearly: isYearly && !!plan.priceYearly })
    setEmailCaptureOpen(true)
  }

  const handleEmailCaptured = () => {
    setEmailCaptureOpen(false)
    // Only proceed to checkout if not a beta waitlist (free plan checkout, if ever needed)
    // For paid plans in beta, the modal handles the success state
    // setCheckoutOpen(true)
  }

  const plans: Plan[] = [
    {
      name: t('pricing.starter.name'),
      description: t('pricing.starter.description'),
      price: t('pricing.starter.price'),
      features: [
        t('pricing.starter.feature1'),
        t('pricing.starter.feature2'),
        t('pricing.starter.feature3'),
        t('pricing.starter.feature4')
      ],
      cta: t('pricing.starter.cta'),
      popular: false
    },
    {
      name: t('pricing.pro.name'),
      description: t('pricing.pro.description'),
      price: t('pricing.pro.price'),
      priceYearly: t('pricing.pro.priceYearly'),
      saveAmount: t('pricing.pro.saveAmount'),
      features: [
        t('pricing.pro.feature1'),
        t('pricing.pro.feature2'),
        t('pricing.pro.feature3'),
        t('pricing.pro.feature4'),
        t('pricing.pro.feature5')
      ],
      cta: t('pricing.pro.cta'),
      popular: true
    },
    {
      name: t('pricing.enterprise.name'),
      description: t('pricing.enterprise.description'),
      price: t('pricing.enterprise.price'),
      priceYearly: t('pricing.enterprise.priceYearly'),
      saveAmount: t('pricing.enterprise.saveAmount'),
      features: [
        t('pricing.enterprise.feature1'),
        t('pricing.enterprise.feature2'),
        t('pricing.enterprise.feature3'),
        t('pricing.enterprise.feature4'),
        t('pricing.enterprise.feature5'),
        t('pricing.enterprise.feature6')
      ],
      cta: t('pricing.enterprise.cta'),
      popular: false
    }
  ]

  return (
    <section id="pricing" ref={ref} className="py-24 relative" style={{ perspective: "1000px" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            {t('nav.pricing')}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('pricing.title')}, <span className="text-primary">{t('pricing.titleHighlight')}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-4">
            {t('pricing.subtitle')}
          </p>

          {/* Value Guarantee */}
          <div className="flex items-center justify-center gap-2 mb-8 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 w-fit mx-auto">
            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm text-green-400 font-medium">
              See results in 5 minutes or it&apos;s free
            </span>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={cn(
              "text-sm font-medium transition-colors",
              !isYearly ? "text-white" : "text-muted-foreground"
            )}>
              {t('pricing.monthlyLabel')}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors duration-200",
                isYearly ? "bg-primary" : "bg-white/20"
              )}
            >
              <motion.div
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ left: isYearly ? "calc(100% - 24px)" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={cn(
              "text-sm font-medium transition-colors",
              isYearly ? "text-white" : "text-muted-foreground"
            )}>
              {t('pricing.yearlyLabel')}
            </span>
            {isYearly && (
              <Badge variant="secondary" className="ms-2 bg-green-500/20 text-green-400 border-green-500/30">
                {t('pricing.savePercentage')}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Competitor Comparison - Value Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <Card className="max-w-2xl mx-auto p-6 sm:p-8 bg-gradient-to-br from-muted/50 to-muted/20 border-border/50">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">{t('pricing.valueStack.headline')}</p>
              <div className="text-2xl sm:text-3xl font-bold">
                {t('pricing.valueStack.totalValue')}: <span className="text-muted-foreground line-through">$151/{t('pricing.monthly')}</span>
                <span className="text-primary ml-2">→ $19/{t('pricing.monthly')}</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Competitor Stack */}
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Jasper AI <span className="text-xs">({t('pricing.valueStack.content')})</span></span>
                <span className="font-medium">$39/{t('pricing.monthly')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Midjourney <span className="text-xs">({t('pricing.valueStack.images')})</span></span>
                <span className="font-medium">$30/{t('pricing.monthly')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">ElevenLabs <span className="text-xs">({t('pricing.valueStack.voiceover')})</span></span>
                <span className="font-medium">$22/{t('pricing.monthly')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Buffer Team <span className="text-xs">({t('pricing.valueStack.channels')})</span></span>
                <span className="font-medium">$60/{t('pricing.monthly')}</span>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-3">
                <span className="text-muted-foreground font-medium">{t('pricing.valueStack.ifBoughtSeparately')}</span>
                <span className="font-bold text-lg line-through text-muted-foreground">$151/{t('pricing.monthly')}</span>
              </div>

              {/* POSTAIFY Value */}
              <div className="flex items-center justify-between py-4 px-4 -mx-4 bg-primary/10 rounded-lg border border-primary/20">
                <span className="font-bold text-foreground">POSTAIFY Pro</span>
                <div className="text-right">
                  <span className="font-bold text-2xl text-primary">$19/{t('pricing.monthly')}</span>
                  <span className="block text-xs text-green-400">{t('pricing.valueStack.save87')}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Pricing Cards with 3D Tilt */}
        <div className="grid md:grid-cols-3 gap-6" style={{ perspective: "1000px" }}>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="group"
            >
              <TiltCard popular={plan.popular}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    Most Popular
                  </Badge>
                )}

                <div className="mb-6" style={{ transform: "translateZ(30px)" }}>
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6" style={{ transform: "translateZ(40px)" }}>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {isYearly && plan.priceYearly ? plan.priceYearly : plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      /{isYearly && plan.priceYearly ? t('pricing.year') : t('pricing.monthly')}
                    </span>
                  </div>
                  {isYearly && plan.saveAmount && (
                    <p className="text-sm text-green-400 mt-1">{plan.saveAmount}</p>
                  )}
                </div>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full mb-6"
                  style={{ transform: "translateZ(50px)" }}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.cta}
                </Button>

                <ul className="space-y-3" style={{ transform: "translateZ(20px)" }}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span className="text-primary mt-0.5">✓</span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 pt-16 border-t border-border/30"
        >
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <span className="text-primary font-medium">Pricing</span>
              <span className="text-border">/</span>
              <span>Compare</span>
            </div>
            <p className="text-muted-foreground mt-1">
              See exactly what you get with each plan
            </p>
          </div>

          {/* Table Container */}
          <Card className="overflow-hidden border-border/50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Features</th>
                    <th className="text-center py-4 px-6 font-semibold w-[120px]">Free</th>
                    <th className="text-center py-4 px-6 font-semibold w-[120px] bg-primary/10 border-x border-primary/20">
                      <div className="flex flex-col items-center gap-1">
                        <span>Pro</span>
                        <span className="text-[10px] font-normal text-primary">Popular</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-6 font-semibold w-[120px]">Business</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 text-muted-foreground">Brands</td>
                    <td className="py-4 px-6 text-center font-medium">2</td>
                    <td className="py-4 px-6 text-center font-medium bg-primary/5 border-x border-primary/10">5</td>
                    <td className="py-4 px-6 text-center font-medium">Unlimited</td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 text-muted-foreground">Posts per month</td>
                    <td className="py-4 px-6 text-center font-medium">20</td>
                    <td className="py-4 px-6 text-center font-medium bg-primary/5 border-x border-primary/10">1,000</td>
                    <td className="py-4 px-6 text-center font-medium">90,000</td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 text-muted-foreground">AI Image Generation</td>
                    <td className="py-4 px-6 text-center text-muted-foreground/50">—</td>
                    <td className="py-4 px-6 text-center bg-primary/5 border-x border-primary/10 text-primary font-medium">✓</td>
                    <td className="py-4 px-6 text-center text-primary font-medium">✓</td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 text-muted-foreground">AI Voiceover</td>
                    <td className="py-4 px-6 text-center text-muted-foreground/50">—</td>
                    <td className="py-4 px-6 text-center bg-primary/5 border-x border-primary/10 text-primary font-medium">✓</td>
                    <td className="py-4 px-6 text-center text-primary font-medium">✓</td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 text-muted-foreground">YouTube Repurposing</td>
                    <td className="py-4 px-6 text-center text-muted-foreground/50">—</td>
                    <td className="py-4 px-6 text-center bg-primary/5 border-x border-primary/10 text-primary font-medium">✓</td>
                    <td className="py-4 px-6 text-center text-primary font-medium">✓</td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 text-muted-foreground">Team Collaboration</td>
                    <td className="py-4 px-6 text-center text-muted-foreground/50">—</td>
                    <td className="py-4 px-6 text-center bg-primary/5 border-x border-primary/10 text-muted-foreground/50">—</td>
                    <td className="py-4 px-6 text-center text-primary font-medium">✓</td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 text-muted-foreground">API Access</td>
                    <td className="py-4 px-6 text-center text-muted-foreground/50">—</td>
                    <td className="py-4 px-6 text-center bg-primary/5 border-x border-primary/10 text-muted-foreground/50">—</td>
                    <td className="py-4 px-6 text-center text-primary font-medium">✓</td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 text-muted-foreground">Support</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Community</td>
                    <td className="py-4 px-6 text-center bg-primary/5 border-x border-primary/10 text-foreground">Priority</td>
                    <td className="py-4 px-6 text-center text-foreground">Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

      </div>

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={emailCaptureOpen}
        onClose={() => setEmailCaptureOpen(false)}
        onContinue={handleEmailCaptured}
        planName={selectedPlan?.name || ""}
        planPrice={selectedPlan?.price || ""}
        isBetaWaitlist={true}
      />

      {/* Stripe Checkout Modal */}
      <StripeCheckout
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        planName={selectedPlan?.name || ""}
        planPrice={selectedPlan?.price || ""}
        isYearly={selectedPlan?.isYearly || false}
      />
    </section>
  )
}
