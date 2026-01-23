'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubscription } from '@/context/SubscriptionContext'
import { useQuery, useAction } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api as convexApi } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ImageGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onCreatePost?: (imageUrl: string) => void
}

const IMAGE_STYLES = [
  { value: 'none', label: 'No style' },
  { value: 'photographic', label: 'Photographic' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'anime', label: 'Anime' },
  { value: '3d-model', label: '3D Model' },
] as const

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1', description: 'Square - Instagram posts' },
  { value: '16:9', label: '16:9', description: 'Landscape - YouTube thumbnails' },
  { value: '9:16', label: '9:16', description: 'Portrait - Stories/Reels' },
  { value: '4:3', label: '4:3', description: 'Classic landscape' },
  { value: '3:4', label: '3:4', description: 'Classic portrait' },
] as const

function ImageGeneratorModalComponent({ isOpen, onClose, onCreatePost }: ImageGeneratorModalProps) {
  const { canUseFeature, openUpgradeModal } = useSubscription()
  const { user: clerkUser } = useUser()

  // Convex hooks
  const availableModels = useQuery(convexApi.images.getModels) || []
  const generateImageAction = useAction(convexApi.imagesAction.generate)

  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('fal-ai/flux/schnell')
  const [selectedStyle, setSelectedStyle] = useState('none')
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1')
  const [generatedImageUrl, setGeneratedImageUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'configure' | 'result'>('configure')

  const hasAccess = canUseFeature('image')

  // Set default model when models are loaded
  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.find(m => m.id === selectedModel)) {
      setSelectedModel(availableModels[0].id)
    }
  }, [availableModels, selectedModel])

  const handleGenerate = async () => {
    if (!hasAccess) {
      handleClose()
      openUpgradeModal('image')
      return
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt describing the image you want to generate.')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const result = await generateImageAction({
        prompt,
        model: selectedModel,
        aspectRatio: selectedAspectRatio,
        style: selectedStyle !== 'none' ? selectedStyle : undefined,
        clerkId: clerkUser?.id, // Pass clerkId for auth fallback
      })
      setGeneratedImageUrl(result.url)
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = useCallback(async () => {
    if (!generatedImageUrl) return

    const link = document.createElement('a')
    link.href = generatedImageUrl
    link.download = `image-${Date.now()}.png`
    link.target = '_blank'
    link.click()
  }, [generatedImageUrl])

  const handleClose = useCallback(() => {
    setStep('configure')
    setPrompt('')
    setGeneratedImageUrl('')
    setError('')
    onClose()
  }, [onClose])

  const handleRegenerate = useCallback(() => {
    setStep('configure')
    setGeneratedImageUrl('')
  }, [])

  const currentModel = useMemo(() => availableModels.find(m => m.id === selectedModel), [availableModels, selectedModel])

  const currentAspectRatioDescription = useMemo(() =>
    ASPECT_RATIOS.find(r => r.value === selectedAspectRatio)?.description,
    [selectedAspectRatio]
  )

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
                Image generation is available on Pro and Business plans.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => { handleClose(); openUpgradeModal('image'); }} className="flex-1">
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
          className="relative w-full mx-4 max-w-2xl"
        >
          <Card className="p-6 bg-card border-border">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {step === 'result' ? 'Generated Image' : 'Generate Image'}
              </h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {step === 'configure' && (
              <>
                {/* Prompt Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Be specific about subjects, style, lighting, and composition.
                  </p>
                </div>

                {/* Model Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-3 rounded-lg text-left transition-colors ${
                          selectedModel === model.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:border-white/20'
                        }`}
                      >
                        <span className="block text-sm font-medium">{model.name}</span>
                        <span className={`block text-xs mt-1 ${
                          selectedModel === model.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {model.speed}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Style Enhancement</label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                  >
                    {IMAGE_STYLES.map((style) => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Aspect Ratio Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                  <div className="grid grid-cols-5 gap-2">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => setSelectedAspectRatio(ratio.value as '1:1' | '16:9' | '9:16' | '4:3' | '3:4')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedAspectRatio === ratio.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:border-white/20'
                        }`}
                        title={ratio.description}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentAspectRatioDescription}
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating... (this may take up to 30 seconds)
                    </span>
                  ) : (
                    'Generate Image'
                  )}
                </Button>
              </>
            )}

            {step === 'result' && generatedImageUrl && (
              <>
                {/* Generated Image Display */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">{currentModel?.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                      {selectedAspectRatio}
                    </span>
                    {selectedStyle !== 'none' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                        {IMAGE_STYLES.find(s => s.value === selectedStyle)?.label}
                      </span>
                    )}
                  </div>
                  <div className="rounded-lg overflow-hidden bg-background border border-border">
                    <img
                      src={generatedImageUrl}
                      alt="Generated image"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    Prompt: {prompt}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleRegenerate} className="flex-1">
                    New Image
                  </Button>
                  <Button variant="outline" onClick={handleDownload} className="flex-1">
                    Download
                  </Button>
                  {onCreatePost && (
                    <Button onClick={() => onCreatePost(generatedImageUrl)} className="flex-1">
                      Create Post
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export const ImageGeneratorModal = memo(ImageGeneratorModalComponent)
