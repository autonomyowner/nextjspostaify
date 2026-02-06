'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useMetaPixel } from '@/hooks/useMetaPixel'
import { useGA4 } from '@/hooks/useGA4'

interface EmailCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: (email: string) => void
  planName: string
  planPrice: string
  isBetaWaitlist?: boolean
}

export function EmailCaptureModal({
  isOpen,
  onClose,
  onContinue,
  planName,
  planPrice,
  isBetaWaitlist = false
}: EmailCaptureModalProps) {
  const { t } = useTranslation()
  const { trackEvent: trackMetaEvent } = useMetaPixel()
  const { trackEvent: trackGA4Event } = useGA4()
  const captureEmailMutation = useMutation(api.emails.capture)
  const [email, setEmail] = useState('')
  const [acceptMarketing, setAcceptMarketing] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleContinue = async () => {
    if (!email.trim()) {
      setError(t('emailCapture.emailRequired') || 'Email is required')
      return
    }

    if (!validateEmail(email)) {
      setError(t('emailCapture.invalidEmail') || 'Please enter a valid email')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Save email to backend via Convex
      await captureEmailMutation({
        email,
        marketingConsent: acceptMarketing,
        source: 'pricing_modal',
        planInterest: planName,
      })

      // Save to localStorage for checkout pre-fill
      if (typeof window !== 'undefined') {
        localStorage.setItem('t21-captured-email', email)
      }

      // Track email capture with Meta Pixel
      trackMetaEvent('Lead', {
        content_name: 'Email Capture',
        content_category: planName,
        value: parseFloat(planPrice.replace(/[^0-9.]/g, '')) || 0,
        currency: 'USD',
      })

      // Track email capture with GA4
      trackGA4Event('generate_lead', {
        currency: 'USD',
        value: parseFloat(planPrice.replace(/[^0-9.]/g, '')) || 0,
        plan: planName,
        marketing_consent: acceptMarketing,
      })

      // For beta waitlist, show success message instead of checkout
      if (isBetaWaitlist) {
        setShowSuccess(true)
        return
      }

      // Continue to checkout
      onContinue(email)
    } catch (err) {
      console.error('Failed to capture email:', err)
      setError('Failed to save email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError('')
    setShowSuccess(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-md p-6 bg-card border-border">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 end-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {showSuccess && isBetaWaitlist ? (
                // Success message for beta waitlist
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    You're on the list!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Thanks for your interest in <span className="text-primary font-medium">{planName}</span>.
                    We'll notify you as soon as paid plans are available.
                  </p>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                    <p className="text-sm text-foreground">
                      We're currently in <span className="font-semibold text-primary">beta</span> and working hard to bring you the best experience.
                      Paid plans are coming soon!
                    </p>
                  </div>
                  <Button onClick={handleClose} className="w-full">
                    Got it
                  </Button>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">
                      {isBetaWaitlist
                        ? 'Join the Waitlist'
                        : (t('emailCapture.title') || 'Almost there!')}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isBetaWaitlist
                        ? "We're in beta. Get notified when paid plans launch!"
                        : (t('emailCapture.subtitle') || 'Enter your email to continue to checkout')}
                    </p>
                  </div>

                  {/* Plan Summary */}
                  <div className="p-4 rounded-lg bg-background border border-border mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{planName}</p>
                        <p className="text-sm text-muted-foreground">
                          {isBetaWaitlist ? 'Coming soon' : (t('emailCapture.planSelected') || 'Selected plan')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">{planPrice}</p>
                        {isBetaWaitlist && (
                          <span className="text-xs text-primary font-medium">Beta</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      {t('emailCapture.emailLabel') || 'Email address'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError('')
                      }}
                      placeholder={t('emailCapture.emailPlaceholder') || 'you@example.com'}
                      className={`w-full px-3 py-2 rounded-lg bg-background border text-sm focus:outline-none focus:border-primary ${
                        error ? 'border-red-500' : 'border-border'
                      }`}
                      autoFocus
                    />
                    {error && (
                      <p className="text-xs text-red-400 mt-1">{error}</p>
                    )}
                  </div>

                  {/* Marketing Checkbox */}
                  <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptMarketing}
                        onChange={(e) => setAcceptMarketing(e.target.checked)}
                        className="mt-0.5 rounded border-border bg-background text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-muted-foreground">
                        {t('emailCapture.marketingConsent') || 'Send me tips and updates about new features'}
                      </span>
                    </label>
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>{t('emailCapture.securityNote') || "We'll never share your email with anyone"}</span>
                  </div>

                  {/* Continue Button */}
                  <Button onClick={handleContinue} className="w-full" disabled={isSubmitting}>
                    {isSubmitting
                      ? (t('emailCapture.submitting') || 'Saving...')
                      : isBetaWaitlist
                        ? 'Notify Me'
                        : (t('emailCapture.continue') || 'Continue to Checkout')}
                  </Button>

                  {/* Skip Link */}
                  <button
                    onClick={handleClose}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-3 transition-colors"
                  >
                    {t('emailCapture.skip') || 'Skip for now'}
                  </button>
                </>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
