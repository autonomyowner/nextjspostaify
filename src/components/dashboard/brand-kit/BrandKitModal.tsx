'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAction } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
// generate action is in brandKitActions (separate "use node" file)
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BrandKitReveal } from './BrandKitReveal'

const VIBES = [
  { id: 'bold', label: 'Bold', color: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/30' },
  { id: 'minimal', label: 'Minimal', color: 'from-gray-400/10 to-gray-300/10', border: 'border-gray-400/30' },
  { id: 'playful', label: 'Playful', color: 'from-pink-500/20 to-purple-500/20', border: 'border-pink-500/30' },
  { id: 'luxury', label: 'Luxury', color: 'from-amber-500/20 to-yellow-600/20', border: 'border-amber-500/30' },
  { id: 'tech', label: 'Tech', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
  { id: 'organic', label: 'Organic', color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
  { id: 'retro', label: 'Retro', color: 'from-orange-500/20 to-yellow-500/20', border: 'border-orange-500/30' },
  { id: 'corporate', label: 'Corporate', color: 'from-slate-500/20 to-blue-500/20', border: 'border-slate-500/30' },
  { id: 'creative', label: 'Creative', color: 'from-violet-500/20 to-fuchsia-500/20', border: 'border-violet-500/30' },
  { id: 'edgy', label: 'Edgy', color: 'from-zinc-500/20 to-red-500/20', border: 'border-zinc-500/30' },
]

interface BrandKitModalProps {
  isOpen: boolean
  onClose: () => void
  brandId?: string
}

export function BrandKitModal({ isOpen, onClose, brandId }: BrandKitModalProps) {
  const [step, setStep] = useState<'input' | 'generating' | 'reveal'>('input')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [kitId, setKitId] = useState<string | null>(null)

  const generateKit = useAction(api.brandKitActions.generate)

  const toggleVibe = (vibeId: string) => {
    setSelectedVibes(prev => {
      if (prev.includes(vibeId)) return prev.filter(v => v !== vibeId)
      if (prev.length >= 3) return prev // Max 3
      return [...prev, vibeId]
    })
  }

  const canGenerate = name.trim().length > 0 && description.trim().length > 0 && selectedVibes.length >= 1

  const handleGenerate = async () => {
    if (!canGenerate) return
    setIsLoading(true)
    setError('')
    setStep('generating')

    try {
      const result = await generateKit({
        name: name.trim(),
        description: description.trim(),
        vibes: selectedVibes,
        brandId: brandId as any,
      })
      setKitId(result.kitId)
      setStep('reveal')
    } catch (e: any) {
      setError(e.message || 'Failed to generate brand kit')
      setStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (step === 'generating') return // Don't close during generation
    setStep('input')
    setName('')
    setDescription('')
    setSelectedVibes([])
    setError('')
    setKitId(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={step !== 'generating' ? handleClose : undefined}
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full ${step === 'reveal' ? 'max-w-5xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl transition-all duration-300`}
        >
          {/* Close button */}
          {step !== 'generating' && (
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 text-muted-foreground hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {step === 'input' && (
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-1">Brand Kit Generator</h2>
                <p className="text-sm text-muted-foreground">
                  Generate a complete brand identity in 60 seconds
                </p>
              </div>

              {/* Brand Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Postaify"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/50"
                  maxLength={50}
                />
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-1.5">One-line Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. AI-powered social media content automation for creators"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/50 resize-none"
                  rows={2}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">{description.length}/200</p>
              </div>

              {/* Vibe Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1.5">
                  Brand Vibes <span className="text-muted-foreground font-normal">(pick 1-3)</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {VIBES.map((vibe) => {
                    const isSelected = selectedVibes.includes(vibe.id)
                    return (
                      <button
                        key={vibe.id}
                        onClick={() => toggleVibe(vibe.id)}
                        className={`relative rounded-xl p-2.5 sm:p-3 bg-gradient-to-br ${vibe.color} border transition-all text-center ${
                          isSelected
                            ? `${vibe.border} ring-2 ring-primary/40 scale-[1.02]`
                            : 'border-white/5 hover:border-white/15 hover:scale-[1.02]'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-medium">{vibe.label}</span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || isLoading}
                className="w-full h-12 text-base font-semibold"
              >
                Generate Brand Kit
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-3">
                Generates: color palette, typography, logos, mood board, templates, mockups
              </p>
            </div>
          )}

          {step === 'generating' && (
            <BrandKitGenerating name={name} />
          )}

          {step === 'reveal' && kitId && (
            <BrandKitReveal kitId={kitId} onClose={handleClose} />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Generation Progress Component ──────────────────────────────
function BrandKitGenerating({ name }: { name: string }) {
  const steps = [
    { label: 'Color Palette', description: 'Analyzing brand personality' },
    { label: 'Typography', description: 'Selecting font pairings' },
    { label: 'Logo Design', description: 'Generating logo variations' },
    { label: 'Mood Board', description: 'Creating brand visuals' },
    { label: 'Templates', description: 'Designing post backgrounds' },
    { label: 'Mockups', description: 'Rendering brand previews' },
    { label: 'Social Kit', description: 'Building platform profiles' },
    { label: 'Finalizing', description: 'Calculating brand score' },
  ]

  return (
    <div className="p-8 sm:p-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-2">
          Creating <span className="text-primary">{name}</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Your brand identity is being generated...
        </p>

        {/* Animated progress steps */}
        <div className="max-w-sm mx-auto space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 2.5, duration: 0.5 }}
              className="flex items-center gap-3 text-left"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 2.5 + 0.3 }}
                className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: i * 2.5 + 1.5, duration: 0.4 }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
              </motion.div>
              <div>
                <p className="text-sm font-medium">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pulsing loader */}
        <motion.div
          className="mt-8 flex justify-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
