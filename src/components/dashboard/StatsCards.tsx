'use client'

import { motion } from "framer-motion"
import { useData } from "@/context/DataContext"
import { useSubscription } from "@/context/SubscriptionContext"

export function StatsCards() {
  const { getStats, brands } = useData()
  const { subscription, currentLimits, getUsagePercentage, openUpgradeModal } = useSubscription()
  const stats = getStats()

  const postsPercentage = getUsagePercentage('posts', 0)
  const brandsPercentage = getUsagePercentage('brands', brands.length)

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return { bar: 'bg-red-500', text: 'text-red-400', glow: 'shadow-red-500/20' }
    if (percentage >= 80) return { bar: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/20' }
    return { bar: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' }
  }

  const postsColor = getStatusColor(postsPercentage)
  const brandsColor = getStatusColor(brandsPercentage)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Posts */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        onClick={() => postsPercentage >= 80 && openUpgradeModal('post')}
        className={`group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.05] transition-all ${postsPercentage >= 80 ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/40">
          Posts
        </span>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <span className="font-mono text-xs sm:text-sm font-semibold text-white/90">{subscription.postsThisMonth}</span>
          <span className="font-mono text-[9px] sm:text-[10px] text-white/30">/{currentLimits.maxPostsPerMonth}</span>
        </div>
        <div className="w-6 sm:w-8 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(postsPercentage, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full rounded-full ${postsColor.bar}`}
          />
        </div>
      </motion.button>

      {/* Brands */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onClick={() => brandsPercentage >= 80 && openUpgradeModal('brand')}
        className={`group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.05] transition-all ${brandsPercentage >= 80 ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/40">Brands</span>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <span className="font-mono text-xs sm:text-sm font-semibold text-white/90">{brands.length}</span>
          <span className="font-mono text-[9px] sm:text-[10px] text-white/30">/{currentLimits.maxBrands}</span>
        </div>
        <div className="w-6 sm:w-8 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(brandsPercentage, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className={`h-full rounded-full ${brandsColor.bar}`}
          />
        </div>
      </motion.button>

      {/* Scheduled */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]"
      >
        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/40">
          Queued
        </span>
        <span className="font-mono text-xs sm:text-sm font-semibold text-white/90">{stats.postsScheduled}</span>
        {stats.postsScheduled > 0 && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        )}
      </motion.div>

      {/* Plan */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={() => subscription.plan === 'free' && openUpgradeModal('post')}
        className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full transition-all ${
          subscription.plan === 'free'
            ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 cursor-pointer'
            : 'bg-emerald-500/10 border border-emerald-500/20 cursor-default'
        }`}
      >
        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/40">Plan</span>
        <span className={`font-mono text-xs sm:text-sm font-semibold ${
          subscription.plan === 'free' ? 'text-amber-400' : 'text-emerald-400'
        }`}>
          {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
        </span>
        {subscription.plan === 'free' && (
          <span className="text-[9px] text-amber-400/70 hidden sm:inline">Upgrade</span>
        )}
      </motion.button>
    </div>
  )
}
