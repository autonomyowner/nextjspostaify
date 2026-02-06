'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useConvexAuth } from "@/hooks/useCurrentUser"
import { authClient } from "@/lib/auth-client"
import { useData, type Post, type Platform } from "@/context/DataContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/Logo"
import { MobileNav } from "@/components/dashboard/MobileNav"

const platformColors: Record<Platform, { bg: string; text: string; border: string; dot: string }> = {
  Instagram: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20", dot: "bg-pink-500" },
  Twitter: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20", dot: "bg-sky-500" },
  LinkedIn: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", dot: "bg-blue-500" },
  TikTok: { bg: "bg-white/10", text: "text-white", border: "border-white/20", dot: "bg-white" },
  Facebook: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20", dot: "bg-indigo-500" }
}

interface DayData {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  posts: Post[]
}

export default function CalendarPage() {
  const { t } = useTranslation()
  const { posts, brands, deletePost, user } = useData()
  const { isAuthenticated } = useConvexAuth()
  const signOut = () => authClient.signOut().then(() => window.location.href = '/')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date())
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all')
  const [direction, setDirection] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: DayData[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const dayPosts = posts.filter(p => {
        if (p.status !== 'scheduled' || !p.scheduledFor) return false
        if (selectedPlatform !== 'all' && p.platform !== selectedPlatform) return false
        const postDate = new Date(p.scheduledFor)
        return postDate >= dayStart && postDate <= dayEnd
      })

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        posts: dayPosts
      })
    }

    return days
  }, [currentDate, posts, selectedPlatform])

  // Get posts for selected day
  const selectedDayPosts = useMemo(() => {
    if (!selectedDay) return []
    const dayStart = new Date(selectedDay)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(selectedDay)
    dayEnd.setHours(23, 59, 59, 999)

    return posts.filter(p => {
      if (p.status !== 'scheduled' || !p.scheduledFor) return false
      if (selectedPlatform !== 'all' && p.platform !== selectedPlatform) return false
      const postDate = new Date(p.scheduledFor)
      return postDate >= dayStart && postDate <= dayEnd
    }).sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime())
  }, [selectedDay, posts, selectedPlatform])

  // Monthly stats
  const monthStats = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)

    const scheduled = posts.filter(p => {
      if (p.status !== 'scheduled' || !p.scheduledFor) return false
      const postDate = new Date(p.scheduledFor)
      return postDate >= monthStart && postDate <= monthEnd
    })

    const platformCounts: Partial<Record<Platform, number>> = {}
    scheduled.forEach(p => {
      platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1
    })

    return { total: scheduled.length, platformCounts }
  }, [posts, currentDate])

  const getBrandName = (brandId: string) => {
    return brands.find(b => b.id === brandId)?.name || 'Unknown'
  }

  const handleCopy = async (post: Post) => {
    await navigator.clipboard.writeText(post.content)
    setCopiedId(post.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const navigateMonth = (delta: number) => {
    setDirection(delta)
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + delta)
      return newDate
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const platforms: Platform[] = ['Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Facebook']

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.dashboard')}</Link>
              <Link href="/posts" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.posts')}</Link>
              <Link href="/calendar" className="text-sm text-white font-medium">{t('nav.calendar')}</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-sm font-medium">
                  {user?.name?.slice(0, 1) || user?.email?.slice(0, 1)?.toUpperCase() || 'U'}
                </div>
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-xs hidden sm:inline-flex">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/sign-in">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-32 md:pb-8">
        {/* Page Title & Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1">Content Calendar</h1>
              <p className="text-sm text-muted-foreground">Plan and manage your scheduled posts</p>
            </div>

            {/* Stats Pills - matches dashboard style */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/40">This Month</span>
                <span className="font-mono text-xs sm:text-sm font-semibold text-white/90">{monthStats.total}</span>
                {monthStats.total > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(-1)}
                className="h-8 w-8 p-0 bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={currentDate.toISOString()}
                  initial={{ opacity: 0, x: direction * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-base sm:text-lg font-semibold min-w-[140px] sm:min-w-[180px] text-center"
                >
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </motion.h2>
              </AnimatePresence>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(1)}
                className="h-8 w-8 p-0 bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDirection(0)
                setCurrentDate(new Date())
                setSelectedDay(new Date())
              }}
              className="h-8 px-3 text-xs bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
            >
              Today
            </Button>
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground shrink-0">Platform:</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1 -mb-1">
              <button
                onClick={() => setSelectedPlatform('all')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  selectedPlatform === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {platforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                    selectedPlatform === platform
                      ? `${platformColors[platform].bg} ${platformColors[platform].text}`
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calendar Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="p-2 sm:p-4 overflow-hidden">
              {/* Desktop Calendar */}
              <div className="hidden sm:block">
                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDate.toISOString()}
                    initial={{ opacity: 0, x: direction * 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -15 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-7 gap-1"
                  >
                    {calendarDays.map((day, index) => {
                      const isSelected = selectedDay?.getTime() === day.date.getTime()

                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedDay(day.date)}
                          className={`
                            relative aspect-square p-1.5 rounded-lg transition-all text-left flex flex-col
                            ${day.isCurrentMonth ? '' : 'opacity-30'}
                            ${day.isToday ? 'bg-amber-500/10 border border-amber-500/30' : 'hover:bg-white/5'}
                            ${isSelected && !day.isToday ? 'bg-white/10 border border-white/20' : ''}
                          `}
                        >
                          <span className={`
                            text-xs font-medium mb-1
                            ${day.isToday ? 'text-amber-400' : day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                          `}>
                            {day.date.getDate()}
                          </span>

                          {/* Post indicators */}
                          {day.posts.length > 0 && (
                            <div className="flex flex-wrap gap-0.5 mt-auto">
                              {day.posts.slice(0, 4).map((post, i) => (
                                <span
                                  key={post.id || i}
                                  className={`w-1.5 h-1.5 rounded-full ${platformColors[post.platform].dot}`}
                                />
                              ))}
                              {day.posts.length > 4 && (
                                <span className="text-[8px] text-muted-foreground ml-0.5">+{day.posts.length - 4}</span>
                              )}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Mobile Calendar - Compact List */}
              <div className="sm:hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDate.toISOString()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1 max-h-[50vh] overflow-y-auto custom-scrollbar"
                  >
                    {calendarDays
                      .filter(day => day.isCurrentMonth)
                      .map((day, index) => {
                        const isSelected = selectedDay?.getTime() === day.date.getTime()
                        const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' })

                        return (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.01 }}
                            onClick={() => setSelectedDay(day.date)}
                            className={`
                              w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left
                              ${day.isToday ? 'bg-amber-500/10 border border-amber-500/30' : 'hover:bg-white/5'}
                              ${isSelected && !day.isToday ? 'bg-white/10 border border-white/20' : 'border border-transparent'}
                            `}
                          >
                            <div className={`
                              w-10 h-10 flex flex-col items-center justify-center rounded-lg shrink-0
                              ${day.isToday ? 'bg-amber-500 text-black' : 'bg-white/5'}
                            `}>
                              <span className="text-[8px] font-medium opacity-70">{dayName}</span>
                              <span className="text-sm font-bold leading-none">{day.date.getDate()}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                              {day.posts.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {day.posts.slice(0, 3).map((post) => (
                                    <span
                                      key={post.id}
                                      className={`text-[10px] px-1.5 py-0.5 rounded ${platformColors[post.platform].bg} ${platformColors[post.platform].text}`}
                                    >
                                      {post.platform}
                                    </span>
                                  ))}
                                  {day.posts.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground">+{day.posts.length - 3}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">No posts</span>
                              )}
                            </div>
                          </motion.button>
                        )
                      })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Card>

            {/* Platform Summary - Desktop only */}
            <Card className="hidden lg:block p-4 mt-4">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Posts by Platform</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(monthStats.platformCounts).map(([platform, count]) => (
                  <div
                    key={platform}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${platformColors[platform as Platform].bg} ${platformColors[platform as Platform].border} border`}
                  >
                    <span className={`w-2 h-2 rounded-full ${platformColors[platform as Platform].dot}`} />
                    <span className={`text-xs font-medium ${platformColors[platform as Platform].text}`}>
                      {platform}: {count}
                    </span>
                  </div>
                ))}
                {Object.keys(monthStats.platformCounts).length === 0 && (
                  <span className="text-xs text-muted-foreground">No scheduled posts this month</span>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Selected Day Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-3 sm:p-5 h-full flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDay?.toISOString() || 'none'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col"
                >
                  {selectedDay ? (
                    <>
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-lg sm:text-xl font-semibold">
                          {selectedDay.toLocaleDateString('en-US', { weekday: 'long' })}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>

                      {selectedDayPosts.length > 0 ? (
                        <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] sm:max-h-[400px] custom-scrollbar">
                          {selectedDayPosts.map((post, i) => (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className={`rounded-lg border overflow-hidden ${platformColors[post.platform].bg} ${platformColors[post.platform].border}`}
                            >
                              <div className="px-3 py-2 flex items-center justify-between border-b border-border/50">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${platformColors[post.platform].bg} ${platformColors[post.platform].text} ${platformColors[post.platform].border}`}>
                                    {post.platform}
                                  </Badge>
                                  <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                                    {formatTime(post.scheduledFor!)}
                                  </span>
                                </div>
                                <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate max-w-[60px] sm:max-w-[80px]">
                                  {getBrandName(post.brandId)}
                                </span>
                              </div>
                              <div className="px-3 py-2">
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                  {post.content}
                                </p>
                              </div>
                              <div className="px-3 py-2 flex gap-1.5 border-t border-border/50">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-1 bg-white/5 hover:bg-white/10 text-foreground text-[10px] sm:text-xs h-7"
                                  onClick={() => handleCopy(post)}
                                >
                                  {copiedId === post.id ? 'Copied!' : 'Copy'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 text-[10px] sm:text-xs h-7 px-2"
                                  onClick={() => deletePost(post.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-border flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-muted-foreground text-sm mb-1">No posts scheduled</p>
                          <p className="text-muted-foreground/60 text-xs">Create a post to schedule it here</p>
                        </div>
                      )}

                      <Link
                        href="/dashboard"
                        className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold shadow-lg shadow-amber-500/20 text-xs sm:text-sm h-9 sm:h-10 rounded-lg flex items-center justify-center transition-all"
                      >
                        Schedule Post
                      </Link>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">Select a day to view details</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
