'use client'

import { useMemo } from "react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useData } from "@/context/DataContext"

interface ContentCalendarPreviewProps {
  onSchedulePost?: () => void
}

export function ContentCalendarPreview({ onSchedulePost }: ContentCalendarPreviewProps) {
  const { t } = useTranslation()
  const { posts } = useData()

  // Get the next 7 days and count scheduled posts for each day
  const weekDays = useMemo(() => {
    const days: { day: string; date: Date; count: number; posts: string[] }[] = []
    const now = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() + i)
      date.setHours(0, 0, 0, 0)

      const nextDay = new Date(date)
      nextDay.setDate(date.getDate() + 1)

      // Find scheduled posts for this day
      const dayPosts = posts.filter(p => {
        if (p.status !== 'scheduled' || !p.scheduledFor) return false
        const postDate = new Date(p.scheduledFor)
        return postDate >= date && postDate < nextDay
      })

      const dayName = i === 0 ? 'Today' :
        i === 1 ? 'Tomorrow' :
        date.toLocaleDateString('en-US', { weekday: 'short' })

      days.push({
        day: dayName,
        date,
        count: dayPosts.length,
        posts: dayPosts.map(p => {
          const time = new Date(p.scheduledFor!).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
          })
          return `${p.platform} ${time}`
        })
      })
    }

    return days
  }, [posts])

  return (
    <Card className="p-2 sm:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-3 sm:mb-6 px-1 sm:px-0">
        <h2 className="text-sm sm:text-lg font-semibold">{t('dashboard.calendarPreview')}</h2>
        <Button variant="ghost" size="sm" asChild className="text-[10px] sm:text-sm h-6 sm:h-8 px-1.5 sm:px-3">
          <Link href="/calendar">{t('dashboard.viewCalendar')}</Link>
        </Button>
      </div>

      <div className="space-y-1 sm:space-y-3">
        {weekDays.map((day, index) => (
          <div
            key={day.day}
            className={`flex items-center gap-2 p-1.5 sm:p-3 rounded-lg transition-colors ${
              index === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5'
            }`}
          >
            {/* Day */}
            <div className="w-12 sm:w-14 flex-shrink-0">
              <span className={`text-[10px] sm:text-sm font-medium ${index === 0 ? 'text-primary' : 'text-foreground'}`}>
                {day.day}
              </span>
            </div>

            {/* Posts indicator */}
            <div className="flex-1 min-w-0">
              {day.count > 0 ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1">
                    {Array.from({ length: Math.min(day.count, 3) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-primary to-yellow-500 border border-card"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-sm text-muted-foreground">
                    {day.count}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] sm:text-sm text-muted-foreground">-</span>
              )}
            </div>

            {/* Status */}
            {day.count > 0 && (
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Quick Add */}
      <div className="mt-3 sm:mt-6 pt-2 sm:pt-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full text-[10px] sm:text-sm h-7 sm:h-9"
          size="sm"
          onClick={onSchedulePost}
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4 me-1 sm:me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('quickActions.generate')}
        </Button>
      </div>
    </Card>
  )
}
