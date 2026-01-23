'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useMetaPixel } from '@/hooks/useMetaPixel'
import { useGA4 } from '@/hooks/useGA4'

interface StripeCheckoutProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  planPrice: string
  isYearly?: boolean
}

export function StripeCheckout({ isOpen, onClose, planName, planPrice, isYearly = false }: StripeCheckoutProps) {
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [name, setName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const { trackEvent: trackMetaEvent } = useMetaPixel()
  const { trackEvent: trackGA4Event } = useGA4()

  // Track InitiateCheckout when modal opens
  useEffect(() => {
    if (isOpen) {
      // Parse price value from string (e.g., "$9" -> 9)
      const priceValue = parseFloat(planPrice.replace(/[^0-9.]/g, '')) || 0

      // Track with Meta Pixel
      trackMetaEvent('InitiateCheckout', {
        content_name: planName,
        content_category: isYearly ? 'Yearly Subscription' : 'Monthly Subscription',
        currency: 'USD',
        value: priceValue,
      })

      // Track with GA4
      trackGA4Event('begin_checkout', {
        currency: 'USD',
        value: priceValue,
        items: [{
          item_id: isYearly ? 'subscription_yearly' : 'subscription_monthly',
          item_name: planName,
          item_category: 'Subscription',
          price: priceValue,
          quantity: 1,
        }],
      })
    }
  }, [isOpen, planName, planPrice, isYearly, trackMetaEvent, trackGA4Event])

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsProcessing(false)
    setIsComplete(true)

    // Parse price value from string (e.g., "$9" -> 9)
    const priceValue = parseFloat(planPrice.replace(/[^0-9.]/g, '')) || 0
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Track successful purchase with Meta Pixel
    trackMetaEvent('Purchase', {
      content_name: planName,
      content_type: isYearly ? 'Yearly Subscription' : 'Monthly Subscription',
      currency: 'USD',
      value: priceValue,
      num_items: 1,
    })

    // Also track Subscribe event for subscription-specific tracking (Meta)
    trackMetaEvent('Subscribe', {
      currency: 'USD',
      value: priceValue,
      predicted_ltv: isYearly ? priceValue : priceValue * 12, // Yearly LTV estimate
    })

    // Track successful purchase with GA4
    trackGA4Event('purchase', {
      transaction_id: transactionId,
      value: priceValue,
      currency: 'USD',
      items: [{
        item_id: isYearly ? 'subscription_yearly' : 'subscription_monthly',
        item_name: planName,
        item_category: 'Subscription',
        price: priceValue,
        quantity: 1,
      }],
    })

    // Auto close after success
    setTimeout(() => {
      setIsComplete(false)
      onClose()
    }, 2000)
  }

  const resetForm = () => {
    setCardNumber("")
    setExpiry("")
    setCvc("")
    setName("")
    setIsComplete(false)
    setIsProcessing(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md p-0 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-b border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Stripe Logo Mockup */}
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-5 bg-yellow-500 rounded-sm" />
                      <div className="w-2 h-5 bg-yellow-400 rounded-sm" />
                      <div className="w-2 h-5 bg-yellow-300 rounded-sm" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Secure Checkout</span>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{planName}</h3>
                  <p className="text-2xl font-bold text-primary">{planPrice}<span className="text-sm text-muted-foreground font-normal">/{isYearly ? 'year' : 'mo'}</span></p>
                </div>
              </div>

              {/* Form */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-500">
                          <motion.path
                            d="M5 13l4 4L19 7"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          />
                        </svg>
                      </motion.div>
                      <h4 className="text-lg font-semibold mb-1">Payment Successful!</h4>
                      <p className="text-sm text-muted-foreground">Welcome to {planName}</p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      {/* Card Number */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Card number</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="1234 1234 1234 1234"
                            maxLength={19}
                            className="w-full h-11 px-4 pe-12 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                          />
                          <div className="absolute end-3 top-1/2 -translate-y-1/2 flex gap-1">
                            <div className="w-8 h-5 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
                          </div>
                        </div>
                      </div>

                      {/* Expiry and CVC */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Expiry</label>
                          <input
                            type="text"
                            value={expiry}
                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">CVC</label>
                          <input
                            type="text"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="123"
                            maxLength={4}
                            className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                      </div>

                      {/* Cardholder Name */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Cardholder name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full name on card"
                          className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full h-12 text-base relative overflow-hidden"
                        disabled={isProcessing}
                      >
                        <AnimatePresence mode="wait">
                          {isProcessing ? (
                            <motion.div
                              key="processing"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              />
                              Processing...
                            </motion.div>
                          ) : (
                            <motion.span
                              key="pay"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              Pay {planPrice}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>

                      {/* Security Note */}
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                        </svg>
                        <span>Secured by Stripe (Demo)</span>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
