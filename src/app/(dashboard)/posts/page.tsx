'use client'

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { useData, type Post } from "@/context/DataContext"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/Logo"
import { MobileNav } from "@/components/dashboard/MobileNav"
import { DateTimePicker } from "@/components/ui/calendar"

const platformColors: Record<string, string> = {
  Instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Twitter: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  LinkedIn: "bg-blue-600/10 text-blue-300 border-blue-600/20",
  TikTok: "bg-white/10 text-white border-white/20",
  Facebook: "bg-blue-700/10 text-blue-400 border-blue-700/20"
}

const statusColors: Record<string, string> = {
  scheduled: "bg-yellow-500/10 text-yellow-400",
  draft: "bg-white/10 text-muted-foreground",
  published: "bg-green-500/10 text-green-400"
}

type FilterStatus = 'all' | 'draft' | 'scheduled' | 'published'
type FilterPlatform = 'all' | 'Instagram' | 'Twitter' | 'LinkedIn' | 'TikTok' | 'Facebook'

export default function PostsPage() {
  const { t } = useTranslation()
  const { posts, brands, deletePost, updatePost } = useData()
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterPlatform, setFilterPlatform] = useState<FilterPlatform>('all')
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [postToSchedule, setPostToSchedule] = useState<Post | null>(null)
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null)

  const filteredPosts = posts.filter(post => {
    if (filterStatus !== 'all' && post.status !== filterStatus) return false
    if (filterPlatform !== 'all' && post.platform !== filterPlatform) return false
    return true
  })

  const getBrandName = (brandId: string) => {
    return brands.find(b => b.id === brandId)?.name || 'Unknown Brand'
  }

  const getBrandColor = (brandId: string) => {
    return brands.find(b => b.id === brandId)?.color || '#EAB308'
  }

  const handlePublish = (postId: string) => {
    updatePost(postId, {
      status: 'published',
      publishedAt: Date.now()
    })
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleOpenScheduleModal = (post: Post) => {
    setPostToSchedule(post)
    // If post is already scheduled, use that time. Otherwise, default to tomorrow at 9 AM
    if (post.scheduledFor) {
      setScheduledDateTime(new Date(post.scheduledFor))
    } else {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)
      setScheduledDateTime(tomorrow)
    }
    setScheduleModalOpen(true)
  }

  const handleSchedulePost = async () => {
    if (!postToSchedule || !scheduledDateTime) {
      console.log('Cannot schedule: missing post or datetime', { postToSchedule, scheduledDateTime })
      return
    }

    console.log('Scheduling post:', { postId: postToSchedule.id, scheduledFor: scheduledDateTime })

    try {
      await updatePost(postToSchedule.id, {
        status: 'scheduled',
        scheduledFor: scheduledDateTime.toISOString()
      })
      setScheduleModalOpen(false)
      setPostToSchedule(null)
      setScheduledDateTime(null)
    } catch (error) {
      console.error('Failed to schedule post:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to schedule post: ${message}`)
    }
  }

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false)
    setPostToSchedule(null)
    setScheduledDateTime(null)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.dashboard')}</Link>
              <Link href="/posts" className="text-sm text-white font-medium">{t('nav.posts')}</Link>
              <Link href="/calendar" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav.calendar')}</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">Sign In</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-32 md:pb-8 mb-20 md:mb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{t('posts.filter.all')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">View and manage all your generated content.</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4 mb-4 sm:mb-8"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground shrink-0">Status:</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1 -mb-1">
              {(['all', 'draft', 'scheduled', 'published'] as FilterStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                    filterStatus === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {t(`posts.filter.${status}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground shrink-0">Platform:</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1 -mb-1">
              {(['all', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Facebook'] as FilterPlatform[]).map(platform => (
                <button
                  key={platform}
                  onClick={() => setFilterPlatform(platform)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                    filterPlatform === platform
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {platform === 'all' ? t('posts.filter.all').replace(' Posts', '').replace(' المنشورات', '') : platform}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Posts Count */}
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          Showing {filteredPosts.length} of {posts.length} posts
        </p>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Card className="p-4 sm:p-12 text-center">
            <p className="text-muted-foreground mb-2 text-xs sm:text-sm">{t('posts.noPosts')}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">
              {posts.length === 0
                ? t('posts.createPost')
                : "Try adjusting your filters"
              }
            </p>
            {posts.length === 0 && (
              <Link href="/dashboard">
                <Button className="mt-4" size="sm">{t('nav.dashboard')}</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-2 sm:gap-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card className="p-2 sm:p-6 hover:border-white/20 transition-colors">
                  {/* Post Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-0 mb-2 sm:mb-4">
                    <div className="flex items-center gap-1 sm:gap-3 flex-wrap">
                      <div
                        className="w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getBrandColor(post.brandId) }}
                      />
                      <span className="text-[11px] sm:text-sm font-medium">{getBrandName(post.brandId)}</span>
                      <Badge variant="outline" className={`text-[9px] sm:text-xs px-1 sm:px-2 py-0 ${platformColors[post.platform]}`}>
                        {post.platform}
                      </Badge>
                      <Badge variant="secondary" className={`text-[9px] sm:text-xs px-1 sm:px-2 py-0 ${statusColors[post.status]}`}>
                        {t(`posts.status.${post.status}`)}
                      </Badge>
                    </div>
                    <span className="text-[9px] sm:text-xs text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  {/* Post Content */}
                  <div
                    className={`bg-background/50 rounded-lg p-1.5 sm:p-4 mb-2 sm:mb-4 ${
                      expandedPost === post.id ? '' : 'max-h-20 sm:max-h-32 overflow-hidden relative'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-[11px] sm:text-sm">{post.content}</p>
                    {expandedPost !== post.id && post.content.length > 200 && (
                      <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-12 bg-gradient-to-t from-background/50 to-transparent" />
                    )}
                  </div>

                  {/* Expand/Collapse */}
                  {post.content.length > 200 && (
                    <button
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="text-[10px] sm:text-sm text-primary hover:underline mb-2 sm:mb-4"
                    >
                      {expandedPost === post.id ? 'Show less' : 'Show more'}
                    </button>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-1 sm:gap-2 pt-2 sm:pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] sm:text-xs h-6 sm:h-8 px-1.5 sm:px-3"
                      onClick={() => handleCopy(post.content)}
                    >
                      Copy
                    </Button>
                    {(post.status === 'draft' || post.status === 'scheduled') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] sm:text-xs h-6 sm:h-8 px-1.5 sm:px-3 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50"
                        onClick={() => handleOpenScheduleModal(post)}
                      >
                        {post.status === 'scheduled' ? 'Reschedule' : 'Schedule'}
                      </Button>
                    )}
                    {post.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] sm:text-xs h-6 sm:h-8 px-1.5 sm:px-3 hidden sm:inline-flex"
                        onClick={() => handlePublish(post.id)}
                      >
                        Mark Published
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:border-red-400/50 text-[10px] sm:text-xs h-6 sm:h-8 px-1.5 sm:px-3"
                      onClick={() => deletePost(post.id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Schedule Modal */}
      <AnimatePresence>
        {scheduleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={handleCloseScheduleModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card border border-border rounded-2xl w-full max-w-4xl my-8 z-[101] max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border shrink-0">
                <h2 className="text-lg sm:text-2xl font-bold">
                  {postToSchedule?.status === 'scheduled' ? 'Reschedule Post' : 'Schedule Post'}
                </h2>
                <button
                  onClick={handleCloseScheduleModal}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <span className="text-white/60 text-xl">&times;</span>
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-4 sm:p-6">
                {postToSchedule && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-background/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`text-xs ${platformColors[postToSchedule.platform]}`}>
                        {postToSchedule.platform}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getBrandName(postToSchedule.brandId)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-3">{postToSchedule.content}</p>
                  </div>
                )}

                <DateTimePicker
                  selectedDateTime={scheduledDateTime}
                  onDateTimeSelect={setScheduledDateTime}
                  minDate={new Date()}
                />
              </div>

              <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 border-t border-border shrink-0">
                <Button
                  onClick={handleSchedulePost}
                  disabled={!scheduledDateTime}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  type="button"
                >
                  {postToSchedule?.status === 'scheduled' ? 'Update Schedule' : 'Schedule Post'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseScheduleModal}
                  className="px-4 sm:px-6 touch-manipulation"
                  type="button"
                >
                  Cancel
                </Button>
              </div>
              {!scheduledDateTime && (
                <div className="px-4 sm:px-6 pb-4 text-xs text-amber-400 text-center">
                  Please select a date and time to schedule this post
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
