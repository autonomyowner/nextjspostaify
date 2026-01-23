'use client'

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { useQuery, useAction } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '../../convex/_generated/api'

// Plan types
export type PlanType = 'free' | 'pro' | 'business'

// Plan limits type
export interface PlanLimits {
  maxBrands: number
  maxPostsPerMonth: number
  hasImageGeneration: boolean
  hasVoiceover: boolean
  hasVideoRepurpose: boolean
  hasApiAccess: boolean
  supportLevel: string
}

// Plan limits configuration (fallback if backend unavailable)
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxBrands: 2,
    maxPostsPerMonth: 20,
    hasImageGeneration: false,
    hasVoiceover: false,
    hasVideoRepurpose: false,
    hasApiAccess: false,
    supportLevel: 'community'
  },
  pro: {
    maxBrands: 5,
    maxPostsPerMonth: 1000,
    hasImageGeneration: true,
    hasVoiceover: true,
    hasVideoRepurpose: true,
    hasApiAccess: false,
    supportLevel: 'priority'
  },
  business: {
    maxBrands: 999,
    maxPostsPerMonth: 90000,
    hasImageGeneration: true,
    hasVoiceover: true,
    hasVideoRepurpose: true,
    hasApiAccess: true,
    supportLevel: 'dedicated'
  }
}

// Limit types for upgrade modal context
export type LimitType = 'brand' | 'post' | 'image' | 'voiceover' | 'video_repurpose'

interface SubscriptionState {
  plan: PlanType
  postsThisMonth: number
  postsLimit: number
  brandsCount: number
  brandsLimit: number
  hasSeenWelcome: boolean
}

interface SubscriptionContextType {
  // Current subscription state
  subscription: SubscriptionState
  currentLimits: PlanLimits
  isLoading: boolean

  // Limit checking functions
  canAddBrand: (currentBrandCount: number) => boolean
  canCreatePost: () => boolean
  canUseFeature: (feature: 'image' | 'voiceover' | 'video_repurpose') => boolean

  // Usage tracking
  incrementPostCount: () => void
  getUsagePercentage: (type: 'brands' | 'posts', currentCount: number) => number
  getRemainingCount: (type: 'brands' | 'posts', currentCount: number) => number

  // Upgrade modal state
  showUpgradeModal: boolean
  upgradeModalTrigger: LimitType | null
  openUpgradeModal: (trigger: LimitType) => void
  closeUpgradeModal: () => void

  // Welcome modal
  markWelcomeSeen: () => void

  // Email capture (for welcome/checkout flows)
  captureEmail: (email: string) => void

  // Plan management
  upgradePlan: (plan: 'PRO' | 'BUSINESS') => Promise<void>
  openBillingPortal: () => Promise<void>

  // Refresh
  refreshSubscription: () => Promise<void>
  checkAndResetMonthly: () => void
}

const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  plan: 'free',
  postsThisMonth: 0,
  postsLimit: 20,
  brandsCount: 0,
  brandsLimit: 2,
  hasSeenWelcome: false
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  // Get Clerk user for auth fallback
  const { user: clerkUser } = useUser()
  const clerkId = clerkUser?.id

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeModalTrigger, setUpgradeModalTrigger] = useState<LimitType | null>(null)

  // Welcome seen state (local storage) - with SSR safety
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('t21-welcome-seen') === 'true'
  })

  // Convex query for user data - use getByClerkId for auth fallback
  const userData = useQuery(api.users.getByClerkId, clerkId ? { clerkId } : "skip")

  // Convex actions for Stripe
  const createCheckoutAction = useAction(api.subscriptionsAction.createCheckout)
  const createPortalAction = useAction(api.subscriptionsAction.createPortal)

  // Determine loading state
  const isLoading = userData === undefined

  // Build subscription state from user data
  const subscription: SubscriptionState = useMemo(() => {
    if (!userData) {
      return { ...DEFAULT_SUBSCRIPTION, hasSeenWelcome }
    }

    const planKey = userData.plan.toLowerCase() as PlanType

    return {
      plan: planKey,
      postsThisMonth: userData.usage.postsThisMonth,
      postsLimit: userData.usage.postsLimit,
      brandsCount: userData.usage.brands,
      brandsLimit: userData.usage.brandsLimit,
      hasSeenWelcome
    }
  }, [userData, hasSeenWelcome])

  // Get current plan limits
  const currentLimits = PLAN_LIMITS[subscription.plan]

  // Check if user can add a brand
  const canAddBrand = useCallback((currentBrandCount: number): boolean => {
    return currentBrandCount < subscription.brandsLimit
  }, [subscription.brandsLimit])

  // Check if user can create a post
  const canCreatePost = useCallback((): boolean => {
    return subscription.postsThisMonth < subscription.postsLimit
  }, [subscription.postsThisMonth, subscription.postsLimit])

  // Check if user can use a premium feature
  const canUseFeature = useCallback((feature: 'image' | 'voiceover' | 'video_repurpose'): boolean => {
    switch (feature) {
      case 'image':
        return currentLimits.hasImageGeneration
      case 'voiceover':
        return currentLimits.hasVoiceover
      case 'video_repurpose':
        return currentLimits.hasVideoRepurpose
      default:
        return false
    }
  }, [currentLimits])

  // Increment post count - no-op in Convex (handled by mutation)
  const incrementPostCount = useCallback(() => {
    // In Convex, the post count is incremented by the createPost mutation
    // The UI will automatically update when the query refreshes
  }, [])

  // Get usage percentage for progress bars
  const getUsagePercentage = useCallback((type: 'brands' | 'posts', currentCount: number): number => {
    if (type === 'brands') {
      return Math.min(100, (currentCount / subscription.brandsLimit) * 100)
    }
    return Math.min(100, (subscription.postsThisMonth / subscription.postsLimit) * 100)
  }, [subscription])

  // Get remaining count
  const getRemainingCount = useCallback((type: 'brands' | 'posts', currentCount: number): number => {
    if (type === 'brands') {
      return Math.max(0, subscription.brandsLimit - currentCount)
    }
    return Math.max(0, subscription.postsLimit - subscription.postsThisMonth)
  }, [subscription])

  // Upgrade modal controls
  const openUpgradeModal = useCallback((trigger: LimitType) => {
    setUpgradeModalTrigger(trigger)
    setShowUpgradeModal(true)
  }, [])

  const closeUpgradeModal = useCallback(() => {
    setShowUpgradeModal(false)
    setUpgradeModalTrigger(null)
  }, [])

  // Mark welcome as seen
  const markWelcomeSeen = useCallback(() => {
    setHasSeenWelcome(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('t21-welcome-seen', 'true')
    }
  }, [])

  // Capture email (store locally for later use)
  const captureEmail = useCallback((email: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('t21-captured-email', email)
    }
  }, [])

  // Upgrade plan via Stripe checkout
  const upgradePlan = useCallback(async (plan: 'PRO' | 'BUSINESS') => {
    try {
      const result = await createCheckoutAction({
        plan,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/dashboard?cancelled=true`,
        clerkId: clerkId || undefined, // Pass clerkId for auth fallback
      })
      window.location.href = result.url
    } catch (err) {
      console.error('Failed to create checkout:', err)
      throw err
    }
  }, [createCheckoutAction, clerkId])

  // Open billing portal
  const openBillingPortal = useCallback(async () => {
    try {
      const result = await createPortalAction({
        returnUrl: `${window.location.origin}/dashboard`,
        clerkId: clerkId || undefined, // Pass clerkId for auth fallback
      })
      window.location.href = result.url
    } catch (err) {
      console.error('Failed to open billing portal:', err)
      throw err
    }
  }, [createPortalAction, clerkId])

  // Refresh subscription - no-op in Convex (data is real-time)
  const refreshSubscription = useCallback(async () => {
    // Convex queries are automatically reactive
  }, [])

  // Check and reset monthly - no-op (handled by backend)
  const checkAndResetMonthly = useCallback(() => {
    // Monthly reset is handled by the backend
  }, [])

  return (
    <SubscriptionContext.Provider value={{
      subscription: { ...subscription, hasSeenWelcome },
      currentLimits,
      isLoading,
      canAddBrand,
      canCreatePost,
      canUseFeature,
      incrementPostCount,
      getUsagePercentage,
      getRemainingCount,
      showUpgradeModal,
      upgradeModalTrigger,
      openUpgradeModal,
      closeUpgradeModal,
      markWelcomeSeen,
      captureEmail,
      upgradePlan,
      openBillingPortal,
      refreshSubscription,
      checkAndResetMonthly
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
