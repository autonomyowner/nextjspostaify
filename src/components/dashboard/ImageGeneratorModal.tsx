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

const LOGO_STYLES = [
  {
    value: 'minimal',
    label: 'Minimal',
    template: 'Professional minimal logo design for "{brand}". Simple bold geometric icon, {color} color, pure white background, high contrast, sharp clean edges, flat vector style, centered composition, no text'
  },
  {
    value: 'modern-tech',
    label: 'Modern Tech',
    template: 'Modern tech company logo for "{brand}". Bold geometric symbol, vibrant {color} with subtle gradient, pure white background, high contrast, clean sharp lines, professional startup style, no text'
  },
  {
    value: 'lettermark',
    label: 'Lettermark',
    template: 'Bold lettermark logo using letter "{brand}" first letter. Strong {color} typography, pure white background, high contrast, modern sans-serif, thick bold strokes, centered, professional'
  },
  {
    value: 'abstract',
    label: 'Abstract',
    template: 'Abstract logo mark for "{brand}". Bold geometric shapes, solid {color}, pure white background, high contrast, striking modern design, clean composition, professional brand identity, no text'
  },
  {
    value: 'bold-startup',
    label: 'Bold Startup',
    template: 'Bold startup logo icon for "{brand}". Simple memorable geometric shape, solid {color}, pure white background, maximum contrast, thick lines, modern tech aesthetic, centered, no text'
  },
  {
    value: 'elegant',
    label: 'Elegant',
    template: 'Elegant premium logo for "{brand}". Refined geometric symbol, {color} with subtle gold accent, pure white background, high contrast, sophisticated minimal design, luxury brand style, no text'
  },
] as const

const PRESET_COLORS = [
  { value: 'blue', label: 'Blue', hex: '#3B82F6' },
  { value: 'purple', label: 'Purple', hex: '#8B5CF6' },
  { value: 'green', label: 'Green', hex: '#10B981' },
  { value: 'red', label: 'Red', hex: '#EF4444' },
  { value: 'orange', label: 'Orange', hex: '#F97316' },
  { value: 'yellow', label: 'Yellow', hex: '#FACC15' },
  { value: 'pink', label: 'Pink', hex: '#EC4899' },
  { value: 'teal', label: 'Teal', hex: '#14B8A6' },
  { value: 'black', label: 'Black', hex: '#000000' },
] as const

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1', description: 'Square - Instagram posts' },
  { value: '16:9', label: '16:9', description: 'Landscape - YouTube thumbnails' },
  { value: '9:16', label: '9:16', description: 'Portrait - Stories/Reels' },
  { value: '4:3', label: '4:3', description: 'Classic landscape' },
  { value: '3:4', label: '3:4', description: 'Classic portrait' },
] as const

const PRODUCT_SCENES = [
  { value: 'studio-white', label: 'Studio White', description: 'Clean professional white background' },
  { value: 'marble-surface', label: 'Marble Surface', description: 'Elegant marble counter' },
  { value: 'wooden-table', label: 'Wooden Table', description: 'Rustic wood surface' },
  { value: 'kitchen-counter', label: 'Kitchen', description: 'Modern kitchen lifestyle' },
  { value: 'living-room', label: 'Living Room', description: 'Home interior setting' },
  { value: 'nature-outdoor', label: 'Nature', description: 'Outdoor greenery' },
  { value: 'gradient-modern', label: 'Gradient', description: 'Modern color gradient' },
  { value: 'beach-seaside', label: 'Beach', description: 'Sandy beach setting' },
  { value: 'concrete-urban', label: 'Urban', description: 'Industrial concrete' },
  { value: 'fabric-textile', label: 'Fabric', description: 'Soft textile backdrop' },
] as const

const PRODUCT_ASPECT_RATIOS = [
  { value: '1:1', label: '1:1', description: 'Square - Best for most e-commerce' },
  { value: '16:9', label: '16:9', description: 'Landscape - Banner ads' },
  { value: '9:16', label: '9:16', description: 'Portrait - Mobile/Stories' },
] as const

function ImageGeneratorModalComponent({ isOpen, onClose, onCreatePost }: ImageGeneratorModalProps) {
  const { canUseFeature, openUpgradeModal } = useSubscription()
  const { user: clerkUser } = useUser()

  // Convex hooks
  const availableModels = useQuery(convexApi.images.getModels) || []
  const logoModels = useQuery(convexApi.images.getLogoModels) || []
  const generateImageAction = useAction(convexApi.imagesAction.generate)
  const generateProductShotAction = useAction(convexApi.imagesAction.generateProductShot)

  // Mode: 'image' for general, 'logo' for logos, 'product' for product photography
  const [mode, setMode] = useState<'image' | 'logo' | 'product'>('image')

  // General image state
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('fal-ai/flux/schnell')
  const [selectedStyle, setSelectedStyle] = useState('none')
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1')

  // Logo-specific state
  const [brandName, setBrandName] = useState('')
  const [brandColor, setBrandColor] = useState('blue')
  const [logoStyle, setLogoStyle] = useState('minimal')
  const [selectedLogoModel, setSelectedLogoModel] = useState('fal-ai/ideogram/v2/turbo')

  // Product photography state
  const [productImageUrl, setProductImageUrl] = useState('')
  const [productImagePreview, setProductImagePreview] = useState('')
  const [selectedScene, setSelectedScene] = useState('studio-white')
  const [customScenePrompt, setCustomScenePrompt] = useState('')
  const [productAspectRatio, setProductAspectRatio] = useState('1:1')
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Shared state
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

  // Build logo prompt from template
  const buildLogoPrompt = useCallback(() => {
    const style = LOGO_STYLES.find(s => s.value === logoStyle)
    if (!style) return ''
    return style.template
      .replace('{brand}', brandName)
      .replace('{color}', brandColor)
  }, [brandName, brandColor, logoStyle])

  // Handle image file upload for product photography
  const handleProductImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return
    }

    // Validate file size (max 12MB for Bria API)
    if (file.size > 12 * 1024 * 1024) {
      setError('Image must be smaller than 12MB.')
      return
    }

    setIsUploadingImage(true)
    setError('')

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setProductImagePreview(previewUrl)

      // Convert to base64 data URL for now (in production, upload to storage)
      const reader = new FileReader()
      reader.onloadend = () => {
        // For Fal.ai, we need a public URL. Using base64 data URL as fallback
        // In production, you'd upload to Convex storage or a CDN
        setProductImageUrl(reader.result as string)
        setIsUploadingImage(false)
      }
      reader.onerror = () => {
        setError('Failed to read image file.')
        setIsUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setError('Failed to process image.')
      setIsUploadingImage(false)
    }
  }, [])

  const handleGenerate = async () => {
    if (!hasAccess) {
      handleClose()
      openUpgradeModal('image')
      return
    }

    // Validation based on mode
    if (mode === 'image' && !prompt.trim()) {
      setError('Please enter a prompt describing the image you want to generate.')
      return
    }
    if (mode === 'logo' && !brandName.trim()) {
      setError('Please enter your brand name.')
      return
    }
    if (mode === 'product' && !productImageUrl) {
      setError('Please upload a product image.')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      if (mode === 'product') {
        // Product photography mode
        const result = await generateProductShotAction({
          imageUrl: productImageUrl,
          scenePreset: selectedScene,
          customScene: customScenePrompt || undefined,
          aspectRatio: productAspectRatio,
          clerkId: clerkUser?.id,
        })
        setGeneratedImageUrl(result.url)
      } else {
        // Image or Logo mode
        const finalPrompt = mode === 'logo' ? buildLogoPrompt() : prompt

        const result = await generateImageAction({
          prompt: finalPrompt,
          model: mode === 'logo' ? selectedLogoModel : selectedModel,
          aspectRatio: mode === 'logo' ? '1:1' : selectedAspectRatio,
          style: mode === 'image' && selectedStyle !== 'none' ? selectedStyle : undefined,
          clerkId: clerkUser?.id,
        })
        setGeneratedImageUrl(result.url)
      }
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate. Please try again.')
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
    // Reset logo state
    setBrandName('')
    setBrandColor('blue')
    setLogoStyle('minimal')
    setSelectedLogoModel('fal-ai/ideogram/v2/turbo')
    // Reset product state
    setProductImageUrl('')
    setProductImagePreview('')
    setSelectedScene('studio-white')
    setCustomScenePrompt('')
    setProductAspectRatio('1:1')
    onClose()
  }, [onClose])

  const handleRegenerate = useCallback(() => {
    setStep('configure')
    setGeneratedImageUrl('')
  }, [])

  const currentModel = useMemo(() => availableModels.find(m => m.id === selectedModel), [availableModels, selectedModel])
  const currentLogoModel = useMemo(() => logoModels.find(m => m.id === selectedLogoModel), [logoModels, selectedLogoModel])

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {step === 'result'
                  ? (mode === 'logo' ? 'Generated Logo' : mode === 'product' ? 'Product Shot' : 'Generated Image')
                  : (mode === 'logo' ? 'Generate Logo' : mode === 'product' ? 'Product Photography' : 'Generate Image')
                }
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

            {/* Mode Tabs */}
            {step === 'configure' && (
              <div className="flex gap-2 mb-6 p-1 bg-background rounded-lg">
                <button
                  onClick={() => setMode('image')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    mode === 'image'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  Image
                </button>
                <button
                  onClick={() => setMode('logo')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    mode === 'logo'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  Logo
                </button>
                <button
                  onClick={() => setMode('product')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    mode === 'product'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  Product
                </button>
              </div>
            )}

            {step === 'configure' && (
              <>
                {/* IMAGE MODE */}
                {mode === 'image' && (
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
                  </>
                )}

                {/* LOGO MODE */}
                {mode === 'logo' && (
                  <>
                    {/* Brand Name Input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Brand Name</label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="Enter your brand name..."
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Color Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Brand Color</label>
                      <div className="grid grid-cols-3 gap-2">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setBrandColor(color.value)}
                            className={`p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                              brandColor === color.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background border border-border hover:border-white/20'
                            }`}
                          >
                            <span
                              className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-sm font-medium">{color.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logo Style Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Logo Style</label>
                      <div className="grid grid-cols-2 gap-2">
                        {LOGO_STYLES.map((style) => (
                          <button
                            key={style.value}
                            onClick={() => setLogoStyle(style.value)}
                            className={`p-3 rounded-lg text-left transition-colors ${
                              logoStyle === style.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background border border-border hover:border-white/20'
                            }`}
                          >
                            <span className="block text-sm font-medium">{style.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Model Selection for Logo */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Model</label>
                      <div className="grid grid-cols-3 gap-2">
                        {logoModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => setSelectedLogoModel(model.id)}
                            className={`p-3 rounded-lg text-left transition-colors ${
                              selectedLogoModel === model.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background border border-border hover:border-white/20'
                            }`}
                          >
                            <span className="block text-sm font-medium">{model.name}</span>
                            <span className={`block text-xs mt-1 ${
                              selectedLogoModel === model.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {model.description || model.speed}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* PRODUCT MODE */}
                {mode === 'product' && (
                  <>
                    {/* Product Image Upload */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Product Image</label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-white/30 transition-colors">
                        {productImagePreview ? (
                          <div className="relative">
                            <img
                              src={productImagePreview}
                              alt="Product preview"
                              className="max-h-40 mx-auto rounded-lg object-contain"
                            />
                            <button
                              onClick={() => {
                                setProductImageUrl('')
                                setProductImagePreview('')
                              }}
                              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleProductImageUpload}
                              className="hidden"
                              disabled={isUploadingImage}
                            />
                            {isUploadingImage ? (
                              <div className="py-4">
                                <svg className="animate-spin h-8 w-8 mx-auto text-muted-foreground" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <p className="text-sm text-muted-foreground mt-2">Processing...</p>
                              </div>
                            ) : (
                              <div className="py-4">
                                <svg className="w-10 h-10 mx-auto text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-muted-foreground">Click to upload product image</p>
                                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP (max 12MB)</p>
                              </div>
                            )}
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Scene Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Background Scene</label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {PRODUCT_SCENES.map((scene) => (
                          <button
                            key={scene.value}
                            onClick={() => setSelectedScene(scene.value)}
                            className={`p-3 rounded-lg text-left transition-colors ${
                              selectedScene === scene.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background border border-border hover:border-white/20'
                            }`}
                          >
                            <span className="block text-sm font-medium">{scene.label}</span>
                            <span className={`block text-xs mt-0.5 ${
                              selectedScene === scene.value ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {scene.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Scene Prompt (Optional) */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Custom Details <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={customScenePrompt}
                        onChange={(e) => setCustomScenePrompt(e.target.value)}
                        placeholder="Add specific details... e.g., 'with coffee beans', 'morning light'"
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Aspect Ratio for Product */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Output Size</label>
                      <div className="grid grid-cols-3 gap-2">
                        {PRODUCT_ASPECT_RATIOS.map((ratio) => (
                          <button
                            key={ratio.value}
                            onClick={() => setProductAspectRatio(ratio.value)}
                            className={`p-3 rounded-lg text-left transition-colors ${
                              productAspectRatio === ratio.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background border border-border hover:border-white/20'
                            }`}
                          >
                            <span className="block text-sm font-medium">{ratio.label}</span>
                            <span className={`block text-xs mt-0.5 ${
                              productAspectRatio === ratio.value ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {ratio.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Error */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || isUploadingImage || (mode === 'image' ? !prompt.trim() : mode === 'logo' ? !brandName.trim() : !productImageUrl)}
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
                    mode === 'logo' ? 'Generate Logo' : mode === 'product' ? 'Generate Product Shot' : 'Generate Image'
                  )}
                </Button>
              </>
            )}

            {step === 'result' && generatedImageUrl && (
              <>
                {/* Generated Image Display */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-sm text-muted-foreground">
                      {mode === 'product' ? 'Bria Product Shot' : mode === 'logo' ? currentLogoModel?.name : currentModel?.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                      {mode === 'logo' ? '1:1' : mode === 'product' ? productAspectRatio : selectedAspectRatio}
                    </span>
                    {mode === 'image' && selectedStyle !== 'none' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                        {IMAGE_STYLES.find(s => s.value === selectedStyle)?.label}
                      </span>
                    )}
                    {mode === 'logo' && (
                      <>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                          {LOGO_STYLES.find(s => s.value === logoStyle)?.label}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 flex items-center gap-1">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PRESET_COLORS.find(c => c.value === brandColor)?.hex }}
                          />
                          {PRESET_COLORS.find(c => c.value === brandColor)?.label}
                        </span>
                      </>
                    )}
                    {mode === 'product' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                        {PRODUCT_SCENES.find(s => s.value === selectedScene)?.label}
                      </span>
                    )}
                  </div>
                  <div className="rounded-lg overflow-hidden bg-background border border-border">
                    <img
                      src={generatedImageUrl}
                      alt={mode === 'logo' ? `Generated logo for ${brandName}` : mode === 'product' ? 'Product shot' : 'Generated image'}
                      className="w-full h-auto"
                    />
                  </div>
                  {mode === 'logo' ? (
                    <p className="text-xs text-muted-foreground mt-2">
                      Logo for: <span className="font-medium text-foreground">{brandName}</span>
                    </p>
                  ) : mode === 'product' ? (
                    <p className="text-xs text-muted-foreground mt-2">
                      Scene: <span className="font-medium text-foreground">{PRODUCT_SCENES.find(s => s.value === selectedScene)?.label}</span>
                      {customScenePrompt && <span> + {customScenePrompt}</span>}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      Prompt: {prompt}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleRegenerate} className="flex-1">
                    {mode === 'logo' ? 'New Logo' : mode === 'product' ? 'New Shot' : 'New Image'}
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
