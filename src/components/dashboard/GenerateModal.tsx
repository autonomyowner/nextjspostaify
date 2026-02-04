'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useData, PLATFORMS, type Platform } from '@/context/DataContext'
import { useSubscription } from '@/context/SubscriptionContext'
import { useAction, useQuery } from 'convex/react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { api as convexApi } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DateTimePicker } from '@/components/ui/calendar'

// Content styles available
const CONTENT_STYLES = [
  { value: 'viral', label: 'Viral', description: 'Optimized for maximum engagement and shares' },
  { value: 'storytelling', label: 'Story', description: 'Narrative-driven content that connects' },
  { value: 'educational', label: 'Educational', description: 'Informative and valuable content' },
  { value: 'controversial', label: 'Controversial', description: 'Bold takes that spark discussion' },
  { value: 'inspirational', label: 'Inspirational', description: 'Motivating and uplifting messages' },
] as const

type ContentStyle = typeof CONTENT_STYLES[number]['value']

interface GenerateModalProps {
  isOpen: boolean
  onClose: () => void
  initialImageUrl?: string
}

function GenerateModalComponent({ isOpen, onClose, initialImageUrl }: GenerateModalProps) {
  const { t } = useTranslation()
  const { brands, selectedBrandId, addPost } = useData()
  const { canCreatePost, incrementPostCount, openUpgradeModal, getUsagePercentage, getRemainingCount } = useSubscription()
  const { user } = useCurrentUser()
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('Instagram')
  const [selectedStyle, setSelectedStyle] = useState<ContentStyle>('viral')
  const [topic, setTopic] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'configure' | 'result' | 'schedule'>('configure')
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null)
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3-haiku')
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | undefined>(undefined)

  // Convex hooks
  const availableModels = useQuery(convexApi.ai.getModels) || []
  const generateContentAction = useAction(convexApi.ai.generateContent)

  // Set attached image from initial prop when modal opens
  useEffect(() => {
    if (isOpen && initialImageUrl) {
      setAttachedImageUrl(initialImageUrl)
    }
  }, [isOpen, initialImageUrl])

  const selectedBrand = brands.find(b => b.id === selectedBrandId) || brands[0]

  // Set default model when models are loaded
  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.find(m => m.value === selectedModel)) {
      setSelectedModel(availableModels[0].value)
    }
  }, [availableModels, selectedModel])

  // Platform mapping for Convex (uppercase)
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

  // Timeout wrapper to prevent infinite loading on API hang
  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), ms)
      )
    ])
  }

  const handleGenerate = async () => {
    // Check post limit before generating
    if (!canCreatePost()) {
      handleClose()
      openUpgradeModal('post')
      return
    }

    if (!selectedBrand) {
      setError(t('generateModal.selectBrand'))
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      // 30 second timeout for AI generation
      const result = await withTimeout(
        generateContentAction({
          brandId: selectedBrand.id as Id<"brands">,
          platform: platformToBackend(selectedPlatform),
          topic: topic || undefined,
          style: selectedStyle,
          model: selectedModel,
        }),
        30000
      )
      setGeneratedContent(result.content)
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('generateModal.error'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveAsDraft = async () => {
    if (!selectedBrand || !generatedContent) return

    try {
      await addPost({
        brandId: selectedBrand.id,
        platform: selectedPlatform,
        content: generatedContent,
        imageUrl: attachedImageUrl,
        status: 'draft'
      })

      // Increment post count for subscription tracking
      incrementPostCount()

      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
    }
  }

  const handleOpenScheduler = () => {
    // Set default to tomorrow at 9am
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    setScheduledDateTime(tomorrow)
    setStep('schedule')
  }

  const handleConfirmSchedule = async () => {
    if (!selectedBrand || !generatedContent || !scheduledDateTime) return

    try {
      await addPost({
        brandId: selectedBrand.id,
        platform: selectedPlatform,
        content: generatedContent,
        imageUrl: attachedImageUrl,
        status: 'scheduled',
        scheduledFor: scheduledDateTime.toISOString()
      })

      // Increment post count for subscription tracking
      incrementPostCount()

      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule post')
    }
  }

  const handleBackToResult = useCallback(() => {
    setStep('result')
  }, [])

  const handleClose = useCallback(() => {
    setStep('configure')
    setGeneratedContent('')
    setTopic('')
    setError('')
    setScheduledDateTime(null)
    setAttachedImageUrl(undefined)
    onClose()
  }, [onClose])

  const handleRegenerate = useCallback(() => {
    setStep('configure')
    setGeneratedContent('')
  }, [])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full mx-4 ${step === 'schedule' ? 'max-w-4xl' : 'max-w-2xl'}`}
        >
          <Card className="p-2 sm:p-6 bg-card border-border max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl font-bold">
                {step === 'schedule' ? t('generateModal.scheduleTitle') : t('generateModal.title')}
              </h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {step === 'configure' && (
              <>
                {/* Brand Selection */}
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">{t('generateModal.selectBrand')}</label>
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-background border border-border">
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-xs sm:text-sm font-bold text-white"
                      style={{ backgroundColor: selectedBrand?.color || '#EAB308' }}
                    >
                      {selectedBrand?.initials || '?'}
                    </div>
                    <span className="text-xs sm:text-sm">{selectedBrand?.name || t('generateModal.selectBrand')}</span>
                  </div>
                </div>

                {/* Platform Selection */}
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">{t('generateModal.platform')}</label>
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2">
                    {PLATFORMS.map((platform) => (
                      <button
                        key={platform}
                        onClick={() => setSelectedPlatform(platform)}
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-colors ${
                          selectedPlatform === platform
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:border-white/20'
                        }`}
                      >
                        {t(`posts.platform.${platform.toLowerCase()}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Style Selection */}
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">{t('generateModal.style')}</label>
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2">
                    {CONTENT_STYLES.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setSelectedStyle(style.value)}
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-colors ${
                          selectedStyle === style.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:border-white/20'
                        }`}
                        title={style.description}
                      >
                        {t(`generateModal.styleOptions.${style.value}`)}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {CONTENT_STYLES.find(s => s.value === selectedStyle)?.description}
                  </p>
                </div>

                {/* Topic Input */}
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">{t('generateModal.topic')}</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t('generateModal.topicPlaceholder')}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-primary"
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    Leave empty to let AI choose from brand topics
                  </p>
                </div>

                {/* Attached Image Preview */}
                {attachedImageUrl && (
                  <div className="mb-3 sm:mb-4">
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Attached Image</label>
                    <div className="relative rounded-lg overflow-hidden bg-background border border-border">
                      <img
                        src={attachedImageUrl}
                        alt="Attached"
                        className="w-full h-24 sm:h-32 object-cover"
                      />
                      <button
                        onClick={() => setAttachedImageUrl(undefined)}
                        className="absolute top-2 end-2 p-1 sm:p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                        title="Remove image"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      This image will be attached to your post
                    </p>
                  </div>
                )}

                {/* Model Selection */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">AI Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-primary"
                  >
                    {availableModels.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Usage Warning */}
                {getUsagePercentage('posts', 0) >= 80 && (
                  <div className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg flex items-center justify-between ${
                    getUsagePercentage('posts', 0) >= 100
                      ? 'bg-red-500/10 border border-red-500/20'
                      : 'bg-yellow-500/10 border border-yellow-500/20'
                  }`}>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${getUsagePercentage('posts', 0) >= 100 ? 'text-red-400' : 'text-yellow-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className={`text-[10px] sm:text-sm ${getUsagePercentage('posts', 0) >= 100 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {getRemainingCount('posts', 0)} posts remaining
                      </span>
                    </div>
                    <button
                      onClick={() => { handleClose(); openUpgradeModal('post'); }}
                      className="text-[10px] sm:text-xs text-primary hover:underline"
                    >
                      Upgrade
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] sm:text-sm">
                    {error}
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedBrand}
                  className="w-full h-8 sm:h-10 text-xs sm:text-sm"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('generateModal.generating')}
                    </span>
                  ) : (
                    t('generateModal.generate')
                  )}
                </Button>
              </>
            )}

            {step === 'result' && (
              <>
                {/* Generated Content Display */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                    <span className="text-[10px] sm:text-sm text-muted-foreground">For {selectedPlatform}</span>
                    <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10">
                      {selectedBrand?.name}
                    </span>
                    {attachedImageUrl && (
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        With Image
                      </span>
                    )}
                  </div>
                  {attachedImageUrl && (
                    <div className="mb-2 sm:mb-3 rounded-lg overflow-hidden border border-border">
                      <img
                        src={attachedImageUrl}
                        alt="Attached"
                        className="w-full h-28 sm:h-40 object-cover"
                      />
                    </div>
                  )}
                  <div className="p-2 sm:p-4 rounded-lg bg-background border border-border min-h-[100px] sm:min-h-[150px] whitespace-pre-wrap text-xs sm:text-sm">
                    {generatedContent}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 sm:gap-3">
                  <Button variant="outline" onClick={handleRegenerate} className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm px-1 sm:px-4">
                    {t('generateModal.generate')}
                  </Button>
                  <Button variant="outline" onClick={handleSaveAsDraft} className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm px-1 sm:px-4">
                    {t('generateModal.saveDraft')}
                  </Button>
                  <Button onClick={handleOpenScheduler} className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm px-1 sm:px-4">
                    {t('generateModal.schedule')}
                  </Button>
                </div>
              </>
            )}

            {step === 'schedule' && (
              <>
                {/* Schedule Step */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <button
                      onClick={handleBackToResult}
                      className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-sm sm:text-lg font-semibold">{t('generateModal.scheduleTitle')}</span>
                  </div>

                  {/* Content Preview */}
                  <div className="mb-4 sm:mb-6 p-2 sm:p-3 rounded-lg bg-background/50 border border-border">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{selectedPlatform}</span>
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10">
                        {selectedBrand?.name}
                      </span>
                      {attachedImageUrl && (
                        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          With Image
                        </span>
                      )}
                    </div>
                    {attachedImageUrl && (
                      <div className="mb-1.5 sm:mb-2 rounded overflow-hidden">
                        <img
                          src={attachedImageUrl}
                          alt="Attached"
                          className="w-full h-16 sm:h-20 object-cover"
                        />
                      </div>
                    )}
                    <p className="text-[10px] sm:text-sm text-muted-foreground line-clamp-2">{generatedContent}</p>
                  </div>

                  {/* Date Time Picker */}
                  <DateTimePicker
                    selectedDateTime={scheduledDateTime}
                    onDateTimeSelect={setScheduledDateTime}
                    minDate={new Date()}
                  />
                </div>

                {/* Confirm Button */}
                <div className="flex gap-1.5 sm:gap-3">
                  <Button variant="outline" onClick={handleBackToResult} className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm">
                    {t('generateModal.back')}
                  </Button>
                  <Button
                    onClick={handleConfirmSchedule}
                    disabled={!scheduledDateTime}
                    className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm"
                  >
                    {t('generateModal.confirmSchedule')}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export const GenerateModal = memo(GenerateModalComponent)
