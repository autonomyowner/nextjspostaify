'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAction } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useSubscription } from '@/context/SubscriptionContext'

interface ClipGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
}

interface GeneratedClip {
  clipId: string
  scenesCount: number
  duration: number
  htmlContent: string
  scenes: Array<{ type: string; headline: string }>
}

const GENERATION_STEPS = [
  { label: 'Parsing Script', description: 'AI is analyzing your scenes' },
  { label: 'Building Scenes', description: 'Mapping to motion templates' },
  { label: 'Rendering Clip', description: 'Assembling animations' },
  { label: 'Finalizing', description: 'Polishing your clip' },
]

export function ClipGeneratorModal({ isOpen, onClose }: ClipGeneratorModalProps) {
  const [step, setStep] = useState<'input' | 'generating' | 'result'>('input')
  const [script, setScript] = useState('')
  const [title, setTitle] = useState('')
  const [colors, setColors] = useState({
    primary: '#FACC15',
    secondary: '#EAB308',
    accent: '#F97316',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<GeneratedClip | null>(null)

  const { subscription, openUpgradeModal } = useSubscription()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateClip = useAction((api as any).clipActions.generate)

  const userPlan = subscription.plan
  const clipsUsed = (subscription as any).clipsThisMonth ?? 0
  const clipsLimit = (subscription as any).clipsLimit ?? 2
  const maxScenes = userPlan === 'free' ? 4 : 8
  const hasMp4Export = userPlan !== 'free'

  const canGenerate = script.trim().length >= 10 && !isLoading

  const handleGenerate = async () => {
    if (!canGenerate) return

    if (clipsUsed >= clipsLimit) {
      setError(`LIMIT_REACHED: You've used all ${clipsLimit} clips this month.`)
      return
    }

    setIsLoading(true)
    setError('')
    setStep('generating')

    try {
      const res = await generateClip({
        script: script.trim(),
        colors,
        title: title.trim() || undefined,
      })

      setResult(res as unknown as GeneratedClip)
      setStep('result')
    } catch (e: any) {
      setError(e.message || 'Failed to generate clip')
      setStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  const openPreview = useCallback(() => {
    if (!result?.htmlContent) return
    const blob = new Blob([result.htmlContent], { type: 'text/html' })
    window.open(URL.createObjectURL(blob), '_blank')
  }, [result])

  const downloadHtml = useCallback(() => {
    if (!result?.htmlContent) return
    const blob = new Blob([result.htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'clip'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }, [result, title])

  const handleClose = () => {
    if (step === 'generating') return
    setStep('input')
    setScript('')
    setTitle('')
    setError('')
    setResult(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={step !== 'generating' ? handleClose : undefined}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl"
        >
          {/* Close button */}
          {step !== 'generating' && (
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {/* INPUT STEP */}
          {step === 'input' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-1">Create Motion Clip</h2>
              <p className="text-sm text-white/50 mb-6">
                Paste your script, pick colors, get a cinematic clip.
                {userPlan === 'free' && (
                  <span className="text-yellow-400/80"> Free: max {maxScenes} scenes.</span>
                )}
              </p>

              {/* Usage badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/50">
                  {clipsUsed}/{clipsLimit} clips used
                </div>
                {!hasMp4Export && (
                  <div className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400/70">
                    HTML only &middot; PRO for MP4
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm">
                  <p className="text-red-400">
                    {error.includes('LIMIT_REACHED') ? error.replace('LIMIT_REACHED: ', '') : error}
                  </p>
                  {(error.includes('LIMIT_REACHED') || error.includes('Upgrade')) && (
                    <button
                      onClick={() => { handleClose(); openUpgradeModal('post'); }}
                      className="mt-2 w-full py-2 px-4 text-xs rounded-lg border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>
              )}

              {/* Title (optional) */}
              <div className="mb-4">
                <label className="block text-xs text-white/40 mb-1.5">Clip Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My TikTok Ad"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              {/* Script input */}
              <div className="mb-4">
                <label className="block text-xs text-white/40 mb-1.5">
                  Script <span className="text-white/20">(use --- to separate scenes)</span>
                </label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder={`Still spending 8 hours on content?\n---\nPostaify - AI Content Automation\n---\n1. Generate posts instantly\n2. Schedule across platforms\n3. AI voiceovers built-in\n---\nFrom 8 hours to 5 minutes\n---\nStart free at postaify.com`}
                  rows={10}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors resize-none font-mono leading-relaxed"
                  maxLength={5000}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-white/20">
                    {script.length}/5000
                  </span>
                  <span className="text-xs text-white/20">
                    Max {maxScenes} scenes
                  </span>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="mb-6">
                <label className="block text-xs text-white/40 mb-2">Brand Colors</label>
                <div className="flex gap-4">
                  <ColorPicker
                    label="Primary"
                    value={colors.primary}
                    onChange={(v) => setColors((c) => ({ ...c, primary: v }))}
                  />
                  <ColorPicker
                    label="Secondary"
                    value={colors.secondary}
                    onChange={(v) => setColors((c) => ({ ...c, secondary: v }))}
                  />
                  <ColorPicker
                    label="Accent"
                    value={colors.accent}
                    onChange={(v) => setColors((c) => ({ ...c, accent: v }))}
                  />
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  canGenerate
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                Generate Clip
              </button>
            </div>
          )}

          {/* GENERATING STEP */}
          {step === 'generating' && (
            <div className="p-8 flex flex-col items-center">
              <h2 className="text-xl font-bold text-white mb-2">Creating Your Clip</h2>
              <p className="text-sm text-white/40 mb-8">AI is building your motion graphic...</p>

              <div className="w-full max-w-sm space-y-4">
                {GENERATION_STEPS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 1.5, duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: i * 1.5 + 1, duration: 0.4 }}
                      className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-white/80">{s.label}</p>
                      <p className="text-xs text-white/30">{s.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pulsing loader */}
              <motion.div
                className="mt-8 w-12 h-12 rounded-full border-2 border-yellow-400/30"
                animate={{
                  scale: [1, 1.2, 1],
                  borderColor: ['rgba(250,204,21,0.3)', 'rgba(250,204,21,0.6)', 'rgba(250,204,21,0.3)'],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          )}

          {/* RESULT STEP */}
          {step === 'result' && result && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-1">Clip Ready</h2>
              <p className="text-sm text-white/40 mb-6">
                {result.scenesCount} scenes, ~{result.duration}s duration
              </p>

              {/* Scene breakdown */}
              <div className="mb-6 space-y-2">
                {result.scenes.map((scene, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-2.5 bg-white/3 rounded-xl border border-white/5"
                  >
                    <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-xs font-bold text-yellow-400">
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium text-white/50 uppercase tracking-wider w-24">
                      {scene.type}
                    </span>
                    <span className="text-sm text-white/70 truncate">
                      {scene.headline}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={openPreview}
                  disabled={!result?.htmlContent}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold text-sm hover:from-yellow-400 hover:to-orange-400 transition-all disabled:opacity-50"
                >
                  Preview Clip
                </button>
                <button
                  onClick={downloadHtml}
                  disabled={!result?.htmlContent}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors disabled:opacity-30"
                >
                  Download
                </button>
              </div>

              {/* New clip button */}
              <button
                onClick={() => {
                  setStep('input')
                  setScript('')
                  setTitle('')
                  setResult(null)
                  setError('')
                }}
                className="w-full mt-3 py-2.5 rounded-xl bg-white/3 text-white/40 text-xs hover:bg-white/5 transition-colors"
              >
                Create Another Clip
              </button>

              {/* MP4 export info */}
              {!hasMp4Export && (
                <div className="mt-4 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                  <p className="text-xs text-yellow-400/60">
                    Upgrade to PRO for one-click MP4 video export. Free plan includes HTML download for screen recording.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Color picker component
function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex-1">
      <span className="text-xs text-white/30 mb-1 block">{label}</span>
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v)
          }}
          className="w-full bg-transparent text-white/60 text-xs font-mono focus:outline-none uppercase"
          maxLength={7}
        />
      </div>
    </div>
  )
}
