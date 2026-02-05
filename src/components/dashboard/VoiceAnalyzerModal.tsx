'use client'

import { useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAction, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { useData, type Brand, type VoiceProfile } from '@/context/DataContext'
import { useSubscription } from '@/context/SubscriptionContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface VoiceAnalyzerModalProps {
  isOpen: boolean
  onClose: () => void
  brand: Brand
}

type Step = 'source' | 'input' | 'analyzing' | 'results'

function VoiceAnalyzerModalComponent({ isOpen, onClose, brand }: VoiceAnalyzerModalProps) {
  const { t } = useTranslation()
  const { posts } = useData()
  const { openUpgradeModal } = useSubscription()

  const [step, setStep] = useState<Step>('source')
  const [sourceType, setSourceType] = useState<'existing' | 'external'>('external')
  const [pastedContent, setPastedContent] = useState('')
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([])
  const [error, setError] = useState('')
  const [analyzedProfile, setAnalyzedProfile] = useState<VoiceProfile | null>(null)
  const [samplePosts, setSamplePosts] = useState<{ content: string; platform?: string; addedAt: number }[]>([])

  // Convex
  const analyzeVoice = useAction(api.voiceAnalysis.analyzeVoice)
  const saveVoiceProfile = useMutation(api.voiceAnalysis.saveVoiceProfile)
  const clearVoiceProfile = useMutation(api.voiceAnalysis.clearVoiceProfile)

  // Get brand's posts
  const brandPosts = posts.filter(p => p.brandId === brand.id)

  const handleClose = useCallback(() => {
    setStep('source')
    setSourceType('external')
    setPastedContent('')
    setSelectedPostIds([])
    setError('')
    setAnalyzedProfile(null)
    setSamplePosts([])
    onClose()
  }, [onClose])

  const handleSourceSelect = (type: 'existing' | 'external') => {
    setSourceType(type)
    setStep('input')
  }

  const handleAnalyze = async () => {
    setError('')

    let postsToAnalyze: string[] = []

    if (sourceType === 'existing') {
      postsToAnalyze = brandPosts
        .filter(p => selectedPostIds.includes(p.id))
        .map(p => p.content)
    } else {
      // Parse pasted content - split by double newlines or numbered items
      const lines = pastedContent
        .split(/\n\n+|\n(?=\d+\.\s)/)
        .map(l => l.trim())
        .filter(l => l.length > 20) // Filter out very short lines

      postsToAnalyze = lines
    }

    if (postsToAnalyze.length < 3) {
      setError(t('voiceAnalyzer.minPostsError'))
      return
    }

    if (postsToAnalyze.length > 20) {
      postsToAnalyze = postsToAnalyze.slice(0, 20)
    }

    setStep('analyzing')

    try {
      const result = await analyzeVoice({
        posts: postsToAnalyze,
        brandId: brand.id as Id<'brands'>,
      })

      setAnalyzedProfile(result.voiceProfile as VoiceProfile)
      setSamplePosts(result.samplePosts)
      setStep('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('voiceAnalyzer.analyzeError'))
      setStep('input')
    }
  }

  const handleSave = async () => {
    if (!analyzedProfile) return

    try {
      await saveVoiceProfile({
        brandId: brand.id as Id<'brands'>,
        voiceProfile: analyzedProfile,
        samplePosts: samplePosts,
      })
      handleClose()
    } catch (err) {
      if (err instanceof Error && err.message.includes('limit reached')) {
        handleClose()
        openUpgradeModal('voice_profile')
      } else {
        setError(err instanceof Error ? err.message : t('voiceAnalyzer.saveError'))
      }
    }
  }

  const handleClearProfile = async () => {
    try {
      await clearVoiceProfile({ brandId: brand.id as Id<'brands'> })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('voiceAnalyzer.clearError'))
    }
  }

  const togglePostSelection = (postId: string) => {
    setSelectedPostIds(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  if (!isOpen) return null

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
          className="relative w-full max-w-2xl mx-4"
        >
          <Card className="p-4 sm:p-6 bg-card border-border max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  {t('voiceAnalyzer.title')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {brand.name}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Existing Profile Notice */}
            {brand.voiceProfile && step === 'source' && (
              <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium mb-2">{t('voiceAnalyzer.existingProfile')}</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {brand.voiceProfile.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearProfile}
                    className="text-xs"
                  >
                    {t('voiceAnalyzer.clearProfile')}
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Source Selection */}
            {step === 'source' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {t('voiceAnalyzer.sourceDescription')}
                </p>

                <button
                  onClick={() => handleSourceSelect('external')}
                  className="w-full p-4 rounded-lg border border-border hover:border-primary transition-colors text-left"
                >
                  <p className="font-medium">{t('voiceAnalyzer.pasteExternal')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('voiceAnalyzer.pasteExternalDesc')}
                  </p>
                </button>

                {brandPosts.length >= 3 && (
                  <button
                    onClick={() => handleSourceSelect('existing')}
                    className="w-full p-4 rounded-lg border border-border hover:border-primary transition-colors text-left"
                  >
                    <p className="font-medium">{t('voiceAnalyzer.useExisting')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('voiceAnalyzer.useExistingDesc', { count: brandPosts.length })}
                    </p>
                  </button>
                )}
              </div>
            )}

            {/* Step: Input */}
            {step === 'input' && (
              <div className="space-y-4">
                {sourceType === 'external' ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {t('voiceAnalyzer.pasteInstructions')}
                    </p>
                    <textarea
                      value={pastedContent}
                      onChange={(e) => setPastedContent(e.target.value)}
                      placeholder={t('voiceAnalyzer.pastePlaceholder')}
                      rows={10}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('voiceAnalyzer.postsDetected', {
                        count: pastedContent.split(/\n\n+|\n(?=\d+\.\s)/).filter(l => l.trim().length > 20).length
                      })}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('voiceAnalyzer.selectPosts')} ({selectedPostIds.length}/20)
                    </p>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {brandPosts.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => togglePostSelection(post.id)}
                          className={`w-full p-3 rounded-lg border text-left transition-colors ${
                            selectedPostIds.includes(post.id)
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-border/80'
                          }`}
                        >
                          <p className="text-sm line-clamp-2">{post.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {post.platform}
                          </p>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('source')}
                    className="flex-1"
                  >
                    {t('common.back')}
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    className="flex-1"
                    disabled={
                      sourceType === 'external'
                        ? pastedContent.split(/\n\n+/).filter(l => l.trim().length > 20).length < 3
                        : selectedPostIds.length < 3
                    }
                  >
                    {t('voiceAnalyzer.analyze')}
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Analyzing */}
            {step === 'analyzing' && (
              <div className="py-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="font-medium">{t('voiceAnalyzer.analyzing')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('voiceAnalyzer.analyzingDesc')}
                </p>
              </div>
            )}

            {/* Step: Results */}
            {step === 'results' && analyzedProfile && (
              <div className="space-y-6">
                {/* Voice Description */}
                <div className="p-4 rounded-lg bg-background border border-border">
                  <p className="text-sm">{analyzedProfile.description}</p>
                </div>

                {/* Key Traits */}
                <div>
                  <p className="text-sm font-medium mb-2">{t('voiceAnalyzer.keyTraits')}</p>
                  <div className="flex flex-wrap gap-2">
                    {analyzedProfile.keyTraits.map((trait, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <MetricBar label={t('voiceAnalyzer.formality')} value={analyzedProfile.formality} />
                  <MetricBar label={t('voiceAnalyzer.energy')} value={analyzedProfile.energy} />
                  <MetricBar label={t('voiceAnalyzer.humor')} value={analyzedProfile.humor} />
                  <MetricBar label={t('voiceAnalyzer.directness')} value={analyzedProfile.directness} />
                </div>

                {/* Style Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('voiceAnalyzer.sentenceStyle')}</p>
                    <p className="font-medium capitalize">{analyzedProfile.sentenceStyle.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('voiceAnalyzer.vocabulary')}</p>
                    <p className="font-medium capitalize">{analyzedProfile.vocabularyLevel}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('voiceAnalyzer.emojiUsage')}</p>
                    <p className="font-medium capitalize">{analyzedProfile.emojiUsage}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('voiceAnalyzer.hashtagStyle')}</p>
                    <p className="font-medium capitalize">{analyzedProfile.hashtagStyle}</p>
                  </div>
                </div>

                {/* Topics */}
                {analyzedProfile.topicPreferences.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">{t('voiceAnalyzer.topics')}</p>
                    <div className="flex flex-wrap gap-2">
                      {analyzedProfile.topicPreferences.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded bg-muted text-xs"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Patterns */}
                {analyzedProfile.ctaPatterns.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">{t('voiceAnalyzer.ctaPatterns')}</p>
                    <div className="space-y-1">
                      {analyzedProfile.ctaPatterns.map((cta, i) => (
                        <p key={i} className="text-sm text-muted-foreground">&quot;{cta}&quot;</p>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('input')}
                    className="flex-1"
                  >
                    {t('voiceAnalyzer.reanalyze')}
                  </Button>
                  <Button onClick={handleSave} className="flex-1">
                    {t('voiceAnalyzer.saveProfile')}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Metric bar component
function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/10</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  )
}

export const VoiceAnalyzerModal = memo(VoiceAnalyzerModalComponent)
