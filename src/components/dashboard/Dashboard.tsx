'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { useConvexAuth } from "@/hooks/useCurrentUser"
import { StatsCards } from "./StatsCards"
import { RecentPosts } from "./RecentPosts"
import { QuickActions } from "./QuickActions"
import { BrandSelector } from "./BrandSelector"
import { ContentCalendarPreview } from "./ContentCalendarPreview"
import { GenerateModal } from "./GenerateModal"
import { VideoToPostsModal } from "./VideoToPostsModal"
import { VoiceoverModal } from "./VoiceoverModal"
import { ImageGeneratorModal } from "./ImageGeneratorModal"
import { BrandModal } from "./BrandModal"
import { SettingsModal } from "./SettingsModal"
import { MobileNav } from "./MobileNav"
import { useData } from "@/context/DataContext"
import { Logo } from "@/components/ui/Logo"
import { Button } from "@/components/ui/button"

export function Dashboard() {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isVoiceoverModalOpen, setIsVoiceoverModalOpen] = useState(false)
  const [isImageGeneratorModalOpen, setIsImageGeneratorModalOpen] = useState(false)
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const [editBrandId, setEditBrandId] = useState<string | null>(null)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [pendingImageUrl, setPendingImageUrl] = useState<string | undefined>(undefined)
  const { user } = useData()
  const { isAuthenticated } = useConvexAuth()

  // Handler for creating a post with a generated image
  const handleCreatePostWithImage = (imageUrl: string) => {
    setIsImageGeneratorModalOpen(false)
    setPendingImageUrl(imageUrl)
    setIsGenerateModalOpen(true)
  }

  // Clear pending image when generate modal closes
  const handleGenerateModalClose = () => {
    setIsGenerateModalOpen(false)
    setPendingImageUrl(undefined)
  }

  const userName = user?.name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-white font-medium">Dashboard</Link>
              <Link href="/posts" className="text-sm text-muted-foreground hover:text-white transition-colors">Posts</Link>
              <Link href="/calendar" className="text-sm text-muted-foreground hover:text-white transition-colors">Calendar</Link>
              <button
                onClick={() => setIsGenerateModalOpen(true)}
                className="text-sm text-muted-foreground hover:text-white transition-colors"
              >
                Generate
              </button>
              <button
                onClick={() => setIsBrandModalOpen(true)}
                className="text-sm text-muted-foreground hover:text-white transition-colors"
              >
                Brands
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <BrandSelector
                onAddBrand={() => { setEditBrandId(null); setIsBrandModalOpen(true); }}
                onEditBrand={(id) => { setEditBrandId(id); setIsBrandModalOpen(true); }}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsModalOpen(true)}
              className="text-muted-foreground hover:text-white h-8 w-8 sm:h-9 sm:w-9 p-0"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-sm font-medium">
                  {user?.name?.slice(0, 1) || user?.email?.slice(0, 1)?.toUpperCase() || 'U'}
                </div>
                <Button variant="ghost" size="sm" onClick={() => authClient.signOut().then(() => window.location.href = '/')} className="text-xs hidden sm:inline-flex">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 overflow-x-hidden">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Welcome back, {userName}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Here&apos;s an overview of your content</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatsCards />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 sm:mt-8 mb-4 md:mb-0"
        >
          <QuickActions
            onGenerateContent={() => setIsGenerateModalOpen(true)}
            onAddBrand={() => setIsBrandModalOpen(true)}
            onRepurpose={() => setIsVideoModalOpen(true)}
            onVoiceover={() => setIsVoiceoverModalOpen(true)}
            onGenerateImage={() => setIsImageGeneratorModalOpen(true)}
          />
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8 mt-6 sm:mt-8">
          {/* Recent Posts - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <RecentPosts />
          </motion.div>

          {/* Calendar Preview - Takes 1 column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ContentCalendarPreview onSchedulePost={() => setIsGenerateModalOpen(true)} />
          </motion.div>
        </div>

        {/* Spacer for mobile bottom navigation */}
        <div className="h-40 md:hidden" />
      </main>

      {/* Modals */}
      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={handleGenerateModalClose}
        initialImageUrl={pendingImageUrl}
      />
      <VideoToPostsModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
      <VoiceoverModal
        isOpen={isVoiceoverModalOpen}
        onClose={() => setIsVoiceoverModalOpen(false)}
      />
      <ImageGeneratorModal
        isOpen={isImageGeneratorModalOpen}
        onClose={() => setIsImageGeneratorModalOpen(false)}
        onCreatePost={handleCreatePostWithImage}
      />
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => { setIsBrandModalOpen(false); setEditBrandId(null); }}
        editBrandId={editBrandId}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Mobile Navigation - hide when any modal is open */}
      <MobileNav
        hideNav={
          isGenerateModalOpen ||
          isVideoModalOpen ||
          isVoiceoverModalOpen ||
          isImageGeneratorModalOpen ||
          isBrandModalOpen ||
          isSettingsModalOpen
        }
      />
    </div>
  )
}
