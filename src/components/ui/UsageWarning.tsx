'use client'

import { useSubscription } from '@/context/SubscriptionContext'
import { cn } from '@/lib/utils'

interface UsageWarningProps {
  type: 'image' | 'voiceover'
  className?: string
}

export function UsageWarning({ type, className }: UsageWarningProps) {
  const { subscription, openUpgradeModal } = useSubscription()

  const current = type === 'image'
    ? subscription.imagesThisMonth
    : subscription.voiceoversThisMonth

  const limit = type === 'image'
    ? subscription.imagesLimit
    : subscription.voiceoversLimit

  const percentage = Math.min(100, (current / limit) * 100)
  const remaining = Math.max(0, limit - current)

  // Only show warning when at 80% or higher
  if (percentage < 80) return null

  const isAtLimit = remaining === 0
  const isWarning = percentage >= 80 && percentage < 100

  const label = type === 'image' ? 'images' : 'voiceovers'

  return (
    <div
      className={cn(
        'rounded-lg px-4 py-3 text-sm',
        isAtLimit
          ? 'bg-red-500/10 border border-red-500/30 text-red-400'
          : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isAtLimit ? (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>
            {isAtLimit
              ? `You've reached your ${label} limit this month`
              : `${remaining} ${label} remaining this month (${current}/${limit})`
            }
          </span>
        </div>

        <button
          onClick={() => openUpgradeModal(type)}
          className={cn(
            'text-xs font-medium px-3 py-1 rounded-md transition-colors whitespace-nowrap',
            isAtLimit
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
              : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300'
          )}
        >
          Upgrade
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isAtLimit ? 'bg-red-500' : 'bg-yellow-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
