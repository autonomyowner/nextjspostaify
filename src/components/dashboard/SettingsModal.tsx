'use client'

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { authClient } from "@/lib/auth-client"
import { useQuery, useMutation, useAction } from "convex/react"
import { api as convexApi } from "../../../convex/_generated/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/context/SubscriptionContext"
import { useData } from "@/context/DataContext"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface TelegramStatus {
  configured: boolean
  connected: boolean
  enabled: boolean
  linkedAt: string | null
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation()
  const { user } = useData()
  const { subscription, currentLimits, openBillingPortal } = useSubscription()
  const { brands, deleteBrand } = useData()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Convex hooks for Telegram
  const telegramStatus = useQuery(convexApi.telegram.getStatus)
  const connectTelegramAction = useAction(convexApi.telegramAction.connect)
  const disconnectTelegramMutation = useMutation(convexApi.telegram.disconnect)
  const toggleTelegramMutation = useMutation(convexApi.telegram.toggle)

  // Local loading/error state for telegram operations
  const [telegramLoading, setTelegramLoading] = useState(false)
  const [telegramError, setTelegramError] = useState<string | null>(null)

  const handleConnectTelegram = async () => {
    setTelegramLoading(true)
    setTelegramError(null)
    try {
      const result = await connectTelegramAction({})
      // Open the Telegram connect link in a new window
      window.open(result.connectUrl, '_blank')
      // Polling not needed - Convex query is reactive
      // Just wait a bit then stop loading
      setTimeout(() => {
        setTelegramLoading(false)
      }, 5000)
    } catch (err) {
      setTelegramError('Failed to generate connect link')
      setTelegramLoading(false)
    }
  }

  const handleDisconnectTelegram = async () => {
    setTelegramLoading(true)
    try {
      await disconnectTelegramMutation({})
      setTelegramError(null)
    } catch (err) {
      setTelegramError('Failed to disconnect')
    } finally {
      setTelegramLoading(false)
    }
  }

  const handleToggleTelegram = async () => {
    if (!telegramStatus) return
    setTelegramLoading(true)
    try {
      await toggleTelegramMutation({ enabled: !telegramStatus.enabled })
      setTelegramError(null)
    } catch (err) {
      setTelegramError('Failed to toggle notifications')
    } finally {
      setTelegramLoading(false)
    }
  }

  if (!isOpen) return null

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await authClient.signOut()
      window.location.href = '/'
    } catch (err) {
      console.error('Sign out error:', err)
      setIsSigningOut(false)
    }
  }

  // Get user display info
  const userInitial = user?.name?.slice(0, 1) || user?.email?.slice(0, 1)?.toUpperCase() || 'U'
  const userName = user?.name || 'User'
  const userEmail = user?.email || ''

  const handleManageBilling = async () => {
    try {
      await openBillingPortal()
    } catch {
      // Stripe not configured - show message
      alert('Billing management is not available yet.')
    }
  }

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return
    setIsDeleting(true)
    try {
      await deleteBrand(brandToDelete)
      setBrandToDelete(null)
    } catch (err) {
      console.error('Failed to delete brand:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const getBrandToDeleteName = () => {
    const brand = brands.find(b => b.id === brandToDelete)
    return brand?.name || 'this brand'
  }

  const planLabel = {
    free: 'Free',
    pro: 'Pro',
    business: 'Business'
  }[subscription.plan]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-2 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-2xl font-bold">{t('settings.title')}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors text-sm sm:text-base"
          >
            X
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Account Info */}
          <div>
            <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">Account</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-card/50 rounded-lg border border-white/10">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-sm sm:text-lg font-medium">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-base truncate">
                    {userName}
                  </p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground truncate">
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div>
            <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">Subscription</h3>
            <div className="p-2 sm:p-4 bg-card/50 rounded-lg border border-white/10 space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-sm text-muted-foreground">Current Plan</span>
                <span className="font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/20 text-primary text-[10px] sm:text-sm">
                  {planLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-sm text-muted-foreground">Posts this month</span>
                <span className="font-medium text-xs sm:text-sm">
                  {subscription.postsThisMonth} / {subscription.postsLimit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-sm text-muted-foreground">Brands</span>
                <span className="font-medium text-xs sm:text-sm">
                  {subscription.brandsCount} / {subscription.brandsLimit}
                </span>
              </div>

              {/* Features */}
              <div className="pt-2 sm:pt-3 border-t border-white/10">
                <p className="text-[10px] sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">Features</p>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-sm">
                  <div className={currentLimits.hasImageGeneration ? 'text-green-400' : 'text-muted-foreground'}>
                    {currentLimits.hasImageGeneration ? 'Y' : 'X'} Image Gen
                  </div>
                  <div className={currentLimits.hasVoiceover ? 'text-green-400' : 'text-muted-foreground'}>
                    {currentLimits.hasVoiceover ? 'Y' : 'X'} Voiceover
                  </div>
                  <div className={currentLimits.hasVideoRepurpose ? 'text-green-400' : 'text-muted-foreground'}>
                    {currentLimits.hasVideoRepurpose ? 'Y' : 'X'} Video Repurpose
                  </div>
                </div>
              </div>

              {subscription.plan !== 'business' && (
                <Button
                  onClick={handleManageBilling}
                  className="w-full mt-2 sm:mt-3 h-8 sm:h-10 text-[10px] sm:text-sm"
                  variant="outline"
                >
                  Upgrade Plan
                </Button>
              )}

              {subscription.plan !== 'free' && (
                <Button
                  onClick={handleManageBilling}
                  variant="ghost"
                  className="w-full text-[10px] sm:text-sm h-7 sm:h-9"
                >
                  Manage Billing
                </Button>
              )}
            </div>
          </div>

          {/* Manage Brands */}
          <div>
            <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">Manage Brands</h3>
            <div className="p-2 sm:p-4 bg-card/50 rounded-lg border border-white/10 space-y-2">
              {brands.length === 0 ? (
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  No brands created yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div
                      key={brand.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-black/20 rounded-lg border border-white/5"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold shrink-0"
                          style={{ backgroundColor: brand.color + '30', color: brand.color }}
                        >
                          {brand.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[10px] sm:text-sm truncate">{brand.name}</p>
                          <p className="text-[9px] sm:text-xs text-muted-foreground">
                            {brand.postCount || 0} posts
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setBrandToDelete(brand.id)}
                        variant="ghost"
                        className="text-[10px] sm:text-xs text-red-400 hover:bg-red-400/10 h-6 sm:h-8 px-2 sm:px-3 shrink-0"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-2">
                Deleting a brand will also delete all its posts.
              </p>
            </div>
          </div>

          {/* Telegram Integration */}
          {telegramStatus?.configured && (
            <div>
              <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">Telegram Delivery</h3>
              <div className="p-2 sm:p-4 bg-card/50 rounded-lg border border-white/10 space-y-2 sm:space-y-3">
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  Receive your scheduled posts directly on Telegram when they're ready to publish.
                </p>

                {telegramError && (
                  <p className="text-[10px] sm:text-sm text-red-400">{telegramError}</p>
                )}

                {!telegramStatus.connected ? (
                  <Button
                    onClick={handleConnectTelegram}
                    disabled={telegramLoading}
                    className="w-full h-8 sm:h-10 text-[10px] sm:text-sm"
                    variant="outline"
                  >
                    {telegramLoading ? 'Connecting...' : 'Connect Telegram'}
                  </Button>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-sm text-muted-foreground">Status</span>
                      <span className="text-green-400 text-[10px] sm:text-sm">Connected</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-sm text-muted-foreground">Notifications</span>
                      <button
                        onClick={handleToggleTelegram}
                        disabled={telegramLoading}
                        className={`relative w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors ${
                          telegramStatus.enabled ? 'bg-primary' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 sm:top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            telegramStatus.enabled ? 'start-5 sm:start-7' : 'start-0.5 sm:start-1'
                          }`}
                        />
                      </button>
                    </div>

                    {telegramStatus.linkedAt && (
                      <p className="text-[9px] sm:text-xs text-muted-foreground">
                        Connected {new Date(telegramStatus.linkedAt).toLocaleDateString()}
                      </p>
                    )}

                    <Button
                      onClick={handleDisconnectTelegram}
                      disabled={telegramLoading}
                      variant="ghost"
                      className="w-full text-[10px] sm:text-sm text-red-400 hover:bg-red-400/10 h-7 sm:h-9"
                    >
                      Disconnect Telegram
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Sign Out */}
          <div className="pt-3 sm:pt-4 border-t border-white/10">
            <Button
              onClick={handleSignOut}
              disabled={isSigningOut}
              variant="outline"
              className="w-full text-red-400 border-red-400/50 hover:bg-red-400/10 h-8 sm:h-10 text-[10px] sm:text-sm"
            >
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Brand Confirmation Dialog */}
      {brandToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <Card className="w-full max-w-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Delete Brand?</h3>
            <p className="text-[10px] sm:text-sm text-muted-foreground mb-4">
              Are you sure you want to delete <span className="text-white font-medium">{getBrandToDeleteName()}</span>?
              This will permanently delete the brand and all its posts. This action cannot be undone.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={() => setBrandToDelete(null)}
                variant="outline"
                disabled={isDeleting}
                className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteBrand}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white h-8 sm:h-10 text-[10px] sm:text-sm"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
