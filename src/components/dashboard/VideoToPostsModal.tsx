'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useData, type Platform } from '@/context/DataContext'
import { useSubscription } from '@/context/SubscriptionContext'
import { useAction } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api as convexApi } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DateTimePicker } from '@/components/ui/calendar'
import { VoiceoverModal } from './VoiceoverModal'

interface VideoToPostsModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'input' | 'configure' | 'generating' | 'results'

interface PostSelection {
  selected: boolean
  scheduledFor: Date | null
  status: 'draft' | 'scheduled'
  saved: boolean
}

const POST_COUNT_OPTIONS = [5, 10, 15]
const SUPPORTED_PLATFORMS: Platform[] = ['Facebook', 'Instagram', 'Twitter']
const CONTENT_STYLES = ['viral', 'storytelling', 'educational', 'controversial', 'inspirational']

export function VideoToPostsModal({ isOpen, onClose }: VideoToPostsModalProps) {
  const { t } = useTranslation()
  const { brands, selectedBrandId, addPost } = useData()
  const { canUseFeature, openUpgradeModal } = useSubscription()
  const { user: clerkUser } = useUser()
  const videoToPostsAction = useAction(convexApi.ai.videoToPosts)

  // State
  const [step, setStep] = useState<Step>('input')
  const [videoUrl, setVideoUrl] = useState('')
  const [transcript, setTranscript] = useState('')

  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('Instagram')
  const [selectedStyle, setSelectedStyle] = useState('viral')
  const [numberOfPosts, setNumberOfPosts] = useState(10)

  const [generatedPosts, setGeneratedPosts] = useState<string[]>([])
  const [postSelections, setPostSelections] = useState<PostSelection[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [schedulingIndex, setSchedulingIndex] = useState<number | null>(null)

  const [, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Voiceover modal state
  const [isVoiceoverOpen, setIsVoiceoverOpen] = useState(false)
  const [voiceoverText, setVoiceoverText] = useState('')

  const selectedBrand = brands.find(b => b.id === selectedBrandId) || brands[0]
  const hasAccess = canUseFeature('video_repurpose')

  // Handle transcript submission
  const handleContinue = () => {
    if (transcript.trim().length < 100) {
      setError(t('videoToPosts.transcriptTooShort'))
      return
    }
    setError('')
    setStep('configure')
  }

  // Platform conversion helper
  const platformToBackend = (p: Platform): 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN' | 'TIKTOK' | 'FACEBOOK' => {
    const map: Record<Platform, 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN' | 'TIKTOK' | 'FACEBOOK'> = {
      'Instagram': 'INSTAGRAM',
      'Twitter': 'TWITTER',
      'LinkedIn': 'LINKEDIN',
      'TikTok': 'TIKTOK',
      'Facebook': 'FACEBOOK'
    }
    return map[p]
  }

  // Generate posts
  const handleGenerate = async () => {
    if (!hasAccess) {
      handleClose()
      openUpgradeModal('video_repurpose')
      return
    }

    if (!selectedBrand) {
      setError(t('generateModal.selectBrand'))
      return
    }

    setStep('generating')
    setIsLoading(true)
    setError('')

    try {
      const result = await videoToPostsAction({
        brandId: selectedBrand.id as Id<"brands">,
        platform: platformToBackend(selectedPlatform),
        transcript,
        videoTitle: videoUrl || 'Video content',
        numberOfPosts,
        style: selectedStyle as 'viral' | 'storytelling' | 'educational' | 'controversial' | 'inspirational',
        clerkId: clerkUser?.id,
      })

      setGeneratedPosts(result.posts)
      setPostSelections(result.posts.map(() => ({
        selected: true,
        scheduledFor: null,
        status: 'draft' as const,
        saved: false
      })))
      setStep('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('videoToPosts.generateError'))
      setStep('configure')
    } finally {
      setIsLoading(false)
    }
  }

  // Edit functions
  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setEditedContent(generatedPosts[index])
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const newPosts = [...generatedPosts]
      newPosts[editingIndex] = editedContent
      setGeneratedPosts(newPosts)
      setEditingIndex(null)
      setEditedContent('')
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditedContent('')
  }

  // Selection functions
  const handleToggleSelection = (index: number) => {
    setPostSelections(prev => prev.map((sel, i) =>
      i === index ? { ...sel, selected: !sel.selected } : sel
    ))
  }

  const handleToggleAllSelections = () => {
    const allSelected = postSelections.every(sel => sel.selected)
    setPostSelections(prev => prev.map(sel => ({ ...sel, selected: !allSelected })))
  }

  // Scheduling functions
  const handleOpenScheduling = (index: number) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)

    setPostSelections(prev => prev.map((sel, i) =>
      i === index ? { ...sel, scheduledFor: sel.scheduledFor || tomorrow, status: 'scheduled' } : sel
    ))
    setSchedulingIndex(index)
  }

  const handleUpdateScheduleDateTime = (date: Date) => {
    if (schedulingIndex === null) return
    setPostSelections(prev => prev.map((sel, i) =>
      i === schedulingIndex ? { ...sel, scheduledFor: date, status: 'scheduled' } : sel
    ))
  }

  const handleConfirmScheduling = () => {
    setSchedulingIndex(null)
  }

  const handleCancelScheduling = () => {
    if (schedulingIndex !== null) {
      setPostSelections(prev => prev.map((sel, i) =>
        i === schedulingIndex ? { ...sel, scheduledFor: null, status: 'draft' } : sel
      ))
    }
    setSchedulingIndex(null)
  }

  const handleSetAsDraft = (index: number) => {
    setPostSelections(prev => prev.map((sel, i) =>
      i === index ? { ...sel, scheduledFor: null, status: 'draft' } : sel
    ))
  }

  // Save functions
  const handleSavePost = async (index: number) => {
    if (!selectedBrand) return
    const selection = postSelections[index]
    if (selection.saved) return

    try {
      await addPost({
        brandId: selectedBrand.id,
        platform: selectedPlatform,
        content: generatedPosts[index],
        status: selection.status,
        scheduledFor: selection.scheduledFor?.toISOString()
      })

      setPostSelections(prev => prev.map((sel, i) =>
        i === index ? { ...sel, saved: true } : sel
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
    }
  }

  const handleSaveSelected = async () => {
    if (!selectedBrand) return

    for (let index = 0; index < generatedPosts.length; index++) {
      const selection = postSelections[index]
      if (!selection.selected || selection.saved) continue

      try {
        await addPost({
          brandId: selectedBrand.id,
          platform: selectedPlatform,
          content: generatedPosts[index],
          status: selection.status,
          scheduledFor: selection.scheduledFor?.toISOString()
        })
      } catch {
        // Continue with other posts
      }
    }
    handleClose()
  }

  const handleRemovePost = (index: number) => {
    setGeneratedPosts(posts => posts.filter((_, i) => i !== index))
    setPostSelections(prev => prev.filter((_, i) => i !== index))
  }

  const handleOpenVoiceover = (postContent: string) => {
    setVoiceoverText(postContent)
    setIsVoiceoverOpen(true)
  }

  const handleClose = () => {
    setStep('input')
    setVideoUrl('')
    setTranscript('')
    setGeneratedPosts([])
    setPostSelections([])
    setEditingIndex(null)
    setSchedulingIndex(null)
    setError('')
    onClose()
  }

  const handleBack = () => {
    if (step === 'configure') setStep('input')
    else if (step === 'results') setStep('configure')
  }

  if (!isOpen) return null

  // Show upgrade prompt if no access
  if (!hasAccess) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full mx-4 max-w-md"
          >
            <Card className="p-6 text-center">
              <h2 className="text-xl font-bold mb-4">Upgrade Required</h2>
              <p className="text-muted-foreground mb-6">
                Video to posts repurposing is available on Pro and Business plans.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => { handleClose(); openUpgradeModal('video_repurpose'); }} className="flex-1">
                  Upgrade Now
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full mx-4 ${step === 'results' ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] overflow-hidden`}
        >
          <Card className="p-6 bg-card border-border flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {step !== 'input' && step !== 'generating' && (
                  <button onClick={handleBack} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h2 className="text-xl font-bold">{t('videoToPosts.title')}</h2>
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Step 1: Input */}
            {step === 'input' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Video URL (optional)</label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('videoToPosts.transcriptLabel')}</label>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder={t('videoToPosts.pasteTranscript')}
                    rows={10}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {transcript.length} characters (minimum 100)
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button onClick={handleContinue} disabled={transcript.trim().length < 100} className="w-full">
                  Continue
                </Button>
              </div>
            )}

            {/* Step 2: Configure */}
            {step === 'configure' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('generateModal.selectBrand')}</label>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: selectedBrand?.color || '#EAB308' }}>
                      {selectedBrand?.initials || '?'}
                    </div>
                    <span>{selectedBrand?.name || t('generateModal.selectBrand')}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('generateModal.platform')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SUPPORTED_PLATFORMS.map((platform) => (
                      <button
                        key={platform}
                        onClick={() => setSelectedPlatform(platform)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedPlatform === platform
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:border-white/20'
                        }`}
                      >
                        {platform === 'Twitter' ? 'X' : platform}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('generateModal.style')}</label>
                  <div className="grid grid-cols-5 gap-2">
                    {CONTENT_STYLES.map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                          selectedStyle === style
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:border-white/20'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('videoToPosts.numberOfPosts')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {POST_COUNT_OPTIONS.map((count) => (
                      <button
                        key={count}
                        onClick={() => setNumberOfPosts(count)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          numberOfPosts === count
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:border-white/20'
                        }`}
                      >
                        {count} {t('videoToPosts.posts')}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button onClick={handleGenerate} className="w-full">
                  {t('videoToPosts.generateButton', { count: numberOfPosts })}
                </Button>
              </div>
            )}

            {/* Step 3: Generating */}
            {step === 'generating' && (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('videoToPosts.generating')}</h3>
                <p className="text-sm text-muted-foreground">{t('videoToPosts.generatingHint')}</p>
              </div>
            )}

            {/* Step 4: Results */}
            {step === 'results' && (
              <div className="flex flex-col min-h-0 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button onClick={handleToggleAllSelections} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        postSelections.every(sel => sel.selected) ? 'bg-primary border-primary' : 'border-border'
                      }`}>
                        {postSelections.every(sel => sel.selected) && (
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {t('videoToPosts.selectAll')}
                    </button>
                    <span className="text-sm text-muted-foreground">
                      ({postSelections.filter(s => s.selected).length}/{generatedPosts.length})
                    </span>
                  </div>
                  <Button onClick={handleSaveSelected} size="sm" disabled={!postSelections.some(s => s.selected && !s.saved)}>
                    {t('videoToPosts.saveSelected')}
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pe-2">
                  {generatedPosts.map((post, index) => {
                    const selection = postSelections[index]
                    if (!selection) return null

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border transition-colors ${
                          selection.selected ? 'bg-background border-primary/30' : 'bg-background/50 border-border opacity-60'
                        }`}
                      >
                        {editingIndex === index ? (
                          <div className="space-y-3">
                            <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                            </div>
                          </div>
                        ) : schedulingIndex === index ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Schedule Post</span>
                              <button onClick={handleCancelScheduling} className="text-muted-foreground hover:text-white">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <DateTimePicker selectedDateTime={selection.scheduledFor} onDateTimeSelect={handleUpdateScheduleDateTime} minDate={new Date()} />
                            <div className="flex gap-2 pt-2 border-t border-border">
                              <Button variant="outline" size="sm" onClick={handleCancelScheduling} className="flex-1">Cancel</Button>
                              <Button size="sm" onClick={handleConfirmScheduling} disabled={!selection.scheduledFor} className="flex-1">Confirm</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <button onClick={() => handleToggleSelection(index)} className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${
                              selection.selected ? 'bg-primary border-primary' : 'border-border hover:border-white/30'
                            }`}>
                              {selection.selected && (
                                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Post {index + 1}</span>
                                  {selection.status === 'scheduled' && selection.scheduledFor && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                      {selection.scheduledFor.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                  {selection.status === 'draft' && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-border">Draft</span>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => handleStartEdit(index)} className="p-1 text-muted-foreground hover:text-white">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button onClick={() => handleRemovePost(index)} className="p-1 text-muted-foreground hover:text-red-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{post}</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {selection.saved ? (
                                  <span className="text-xs px-3 py-1.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20">Saved</span>
                                ) : (
                                  <>
                                    {selection.status === 'draft' ? (
                                      <Button size="sm" variant="outline" onClick={() => handleOpenScheduling(index)}>Schedule</Button>
                                    ) : (
                                      <Button size="sm" variant="outline" onClick={() => handleSetAsDraft(index)}>Remove Schedule</Button>
                                    )}
                                    <Button size="sm" variant="outline" onClick={() => handleSavePost(index)}>Save Now</Button>
                                  </>
                                )}
                                <Button size="sm" variant="outline" onClick={() => handleOpenVoiceover(post)} className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10">
                                  Voiceover
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <VoiceoverModal isOpen={isVoiceoverOpen} onClose={() => setIsVoiceoverOpen(false)} initialText={voiceoverText} />
    </AnimatePresence>
  )
}
