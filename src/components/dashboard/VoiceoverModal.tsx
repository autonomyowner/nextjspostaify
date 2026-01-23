'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSubscription } from '@/context/SubscriptionContext'
import { useAction } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api as convexApi } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface VoiceoverModalProps {
  isOpen: boolean
  onClose: () => void
  initialText?: string
}

interface Voice {
  id: string
  name: string
  previewUrl: string
  category: string
  labels: {
    accent?: string
    age?: string
    gender?: string
    description?: string
    use_case?: string
  }
}

const VOICEOVER_STYLES = [
  { value: 'conversational', label: 'Conversational', description: 'Natural, casual tone' },
  { value: 'professional', label: 'Professional', description: 'Clear, authoritative' },
  { value: 'energetic', label: 'Energetic', description: 'Upbeat and dynamic' },
  { value: 'calm', label: 'Calm', description: 'Soothing and relaxed' },
] as const

type VoiceoverStyle = typeof VOICEOVER_STYLES[number]['value']

export function VoiceoverModal({ isOpen, onClose, initialText = '' }: VoiceoverModalProps) {
  const { t } = useTranslation()
  const { canUseFeature, openUpgradeModal } = useSubscription()
  const { user: clerkUser } = useUser()

  // Convex actions
  const getVoicesAction = useAction(convexApi.voice.getVoices)
  const generateVoiceAction = useAction(convexApi.voice.generate)

  // Script state
  const [script, setScript] = useState(initialText)
  const [voiceStyle, setVoiceStyle] = useState<VoiceoverStyle>('conversational')

  // Voice state
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState('')
  const [isLoadingVoices, setIsLoadingVoices] = useState(false)

  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Preview voice
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null)

  // Error state
  const [error, setError] = useState('')

  // Check if user can use voiceover
  const hasAccess = canUseFeature('voiceover')

  // Update script when initialText changes
  useEffect(() => {
    if (initialText) {
      setScript(initialText)
    }
  }, [initialText])

  // Load voices when modal opens
  useEffect(() => {
    if (isOpen && hasAccess && voices.length === 0) {
      loadVoices()
    }
  }, [isOpen, hasAccess])

  // Cleanup audio elements on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Stop and clean up preview audio
      if (previewAudio) {
        previewAudio.pause()
        previewAudio.src = ''
      }
      // Stop main audio player
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [previewAudio])

  const loadVoices = async () => {
    setIsLoadingVoices(true)
    setError('')

    try {
      const fetchedVoices = await getVoicesAction({
        clerkId: clerkUser?.id, // Pass clerkId for auth fallback
      })
      setVoices(fetchedVoices)
      if (fetchedVoices.length > 0 && !selectedVoiceId) {
        setSelectedVoiceId(fetchedVoices[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('voiceover.errorLoadingVoices'))
    } finally {
      setIsLoadingVoices(false)
    }
  }

  const handleGenerateVoiceover = async () => {
    if (!hasAccess) {
      handleClose()
      openUpgradeModal('voiceover')
      return
    }

    if (!script.trim()) {
      setError(t('voiceover.scriptRequired'))
      return
    }

    if (!selectedVoiceId) {
      setError(t('voiceover.selectVoice'))
      return
    }

    setAudioUrl(null)
    setIsGenerating(true)
    setError('')

    try {
      const result = await generateVoiceAction({
        text: script,
        voiceId: selectedVoiceId,
        style: voiceStyle,
        clerkId: clerkUser?.id, // Pass clerkId for auth fallback
      })
      setAudioUrl(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('voiceover.errorGenerating'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `voiceover-${Date.now()}.mp3`
    link.click()
  }

  const handlePreviewVoice = (voice: Voice) => {
    // Clean up previous audio to prevent memory leak
    if (previewAudio) {
      previewAudio.pause()
      previewAudio.src = '' // Release the audio resource
    }

    if (voice.previewUrl) {
      const audio = new Audio(voice.previewUrl)
      audio.play()
      setPreviewAudio(audio)
    }
  }

  const handleClose = () => {
    // Stop and clean up any playing audio to prevent memory leaks
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    if (previewAudio) {
      previewAudio.pause()
      previewAudio.src = ''
      setPreviewAudio(null)
    }

    // Reset state
    setScript(initialText)
    setAudioUrl(null)
    setIsPlaying(false)
    setError('')

    onClose()
  }

  const characterCount = script.length
  const maxCharacters = 5000
  const isOverLimit = characterCount > maxCharacters

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
                Voiceover generation is available on Pro and Business plans.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => { handleClose(); openUpgradeModal('voiceover'); }} className="flex-1">
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
          className="relative w-full mx-4 max-w-3xl max-h-[90vh] overflow-hidden"
        >
          <Card className="p-6 bg-card border-border flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t('voiceover.title')}</h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pe-2 -me-2">
              {/* Script Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">{t('voiceover.script')}</label>
                  <span className={`text-xs ${isOverLimit ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {characterCount} / {maxCharacters}
                  </span>
                </div>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder={t('voiceover.scriptPlaceholder')}
                  className={`w-full px-4 py-3 rounded-lg bg-background border text-sm focus:outline-none focus:border-primary min-h-[150px] resize-y ${
                    isOverLimit ? 'border-red-500' : 'border-border'
                  }`}
                />
                {isOverLimit && (
                  <p className="text-xs text-red-400 mt-1">{t('voiceover.characterLimitExceeded')}</p>
                )}
              </div>

              {/* Voice Style */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Voice Style</label>
                <div className="flex gap-2 flex-wrap">
                  {VOICEOVER_STYLES.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setVoiceStyle(style.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        voiceStyle === style.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      title={style.description}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">{t('voiceover.selectVoice')}</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadVoices}
                    disabled={isLoadingVoices}
                  >
                    {isLoadingVoices ? t('voiceover.loading') : t('voiceover.refreshVoices')}
                  </Button>
                </div>

                {isLoadingVoices ? (
                  <div className="flex items-center justify-center py-8">
                    <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : voices.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                    {voices.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => setSelectedVoiceId(voice.id)}
                        className={`p-3 rounded-lg text-left transition-colors ${
                          selectedVoiceId === voice.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:border-white/20'
                        }`}
                      >
                        <div className="font-medium text-sm truncate">{voice.name}</div>
                        {voice.labels?.gender && (
                          <div className="text-xs opacity-70 mt-0.5 capitalize">
                            {voice.labels.gender}
                            {voice.labels.accent && ` - ${voice.labels.accent}`}
                          </div>
                        )}
                        {voice.previewUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePreviewVoice(voice)
                            }}
                            className="mt-2 text-xs underline opacity-70 hover:opacity-100"
                          >
                            {t('voiceover.preview')}
                          </button>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">{t('voiceover.noVoices')}</p>
                    <Button variant="outline" size="sm" onClick={loadVoices} className="mt-2">
                      {t('voiceover.loadVoices')}
                    </Button>
                  </div>
                )}
              </div>

              {/* Audio Player */}
              {audioUrl && (
                <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePlayPause}
                      className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors"
                    >
                      {isPlaying ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white ms-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-400">{t('voiceover.audioReady')}</p>
                      <p className="text-xs text-muted-foreground">{t('voiceover.clickToPlay')}</p>
                    </div>
                    <Button onClick={handleDownload}>
                      {t('voiceover.download')}
                    </Button>
                  </div>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10 mt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleGenerateVoiceover}
                disabled={isGenerating || !script.trim() || !selectedVoiceId || isOverLimit}
                className="flex-1"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('voiceover.generating')}
                  </span>
                ) : (
                  t('voiceover.generate')
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
