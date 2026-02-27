'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAction } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useSubscription } from '@/context/SubscriptionContext'

interface ClipGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  initialScript?: string
  initialColors?: { primary: string; secondary: string; accent: string }
  initialCategory?: ClipCategory
  initialTitle?: string
}

interface GeneratedClip {
  clipId: string
  scenesCount: number
  duration: number
  htmlContent: string
  hasVoiceover?: boolean
  voiceoverUrl?: string | null
  scenes: Array<{ type: string; headline: string }>
}

const CLIP_VOICES = [
  { id: "794f9389-aac1-45b6-b726-9d9369183238", name: "Confident Narrator", gender: "male" },
  { id: "a0e99571-b01d-4dab-983d-db22d8e3376b", name: "Energetic Host", gender: "female" },
  { id: "638efaaa-4d0c-442e-b701-3fae16aad012", name: "Calm Explainer", gender: "male" },
  { id: "c2ac25f9-ecc4-4f56-9095-651354df60c0", name: "Upbeat Creator", gender: "female" },
] as const

const VOICE_STYLES = [
  { id: 'conversational', label: 'Conversational', desc: 'Natural & friendly' },
  { id: 'professional', label: 'Professional', desc: 'Clear & polished' },
  { id: 'energetic', label: 'Energetic', desc: 'Upbeat & dynamic' },
  { id: 'calm', label: 'Calm', desc: 'Soothing & measured' },
] as const

type ClipCategory = 'saas' | 'storytelling' | 'educational' | 'ecommerce' | 'personal'

const CLIP_CATEGORIES: Array<{
  id: ClipCategory
  label: string
  desc: string
  placeholder: string
}> = [
  {
    id: 'saas',
    label: 'SaaS Marketing',
    desc: 'Product ads & demos',
    placeholder: `Still spending 8 hours on content?\n---\nPostaify - AI Content Automation\n---\n1. Generate posts instantly\n2. Schedule across platforms\n3. AI voiceovers built-in\n---\nFrom 8 hours to 5 minutes\n---\nStart free at postaify.com`,
  },
  {
    id: 'storytelling',
    label: 'Storytelling',
    desc: 'Narrative & chapters',
    placeholder: `Chapter 1: The Problem\n---\nEvery creator faces the same wall. Hours wasted, content that never ships.\n---\n"The best creators aren't the most talented — they're the most consistent."\n---\nThen everything changed.\n---\nStart your story at postaify.com`,
  },
  {
    id: 'educational',
    label: 'Educational',
    desc: 'Tips & how-tos',
    placeholder: `3 Content Mistakes Killing Your Growth\n---\nTip 1: Posting without a content calendar\n---\nTip 2: Ignoring analytics and engagement data\n---\nTip 3: Not repurposing across platforms\n---\nFix all 3 at postaify.com`,
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce',
    desc: 'Product & sales',
    placeholder: `Your competitors are already using AI\n---\nAutomate your product descriptions\nGenerate social ads in seconds\nSchedule posts across all platforms\n---\nFrom 20 orders to 200 orders\n---\nBoosted sales by 340% in 30 days\n---\nStart free at postaify.com`,
  },
  {
    id: 'personal',
    label: 'Personal Brand',
    desc: 'Quotes & tips',
    placeholder: `What nobody tells you about building in public\n---\n"Consistency beats talent when talent doesn't show up."\n---\nTip: Batch your content on Sunday, schedule for the week\n---\nThe real secret? Start before you're ready.\n---\nFollow for more — postaify.com`,
  },
]

const COLOR_PRESETS = [
  { name: 'Gold', primary: '#FACC15', secondary: '#EAB308', accent: '#F97316' },
  { name: 'Ocean', primary: '#3B82F6', secondary: '#1D4ED8', accent: '#06B6D4' },
  { name: 'Emerald', primary: '#10B981', secondary: '#059669', accent: '#34D399' },
  { name: 'Rose', primary: '#F43F5E', secondary: '#E11D48', accent: '#FB7185' },
  { name: 'Violet', primary: '#8B5CF6', secondary: '#7C3AED', accent: '#A78BFA' },
  { name: 'Sunset', primary: '#F97316', secondary: '#EA580C', accent: '#FBBF24' },
  { name: 'Neon', primary: '#22D3EE', secondary: '#06B6D4', accent: '#A855F7' },
  { name: 'Coral', primary: '#FB923C', secondary: '#F87171', accent: '#FBBF24' },
]

const GENERATION_STEPS = [
  { label: 'Parsing Script', description: 'AI is analyzing your scenes' },
  { label: 'Building Scenes', description: 'Mapping to motion templates' },
  { label: 'Rendering Clip', description: 'Assembling animations' },
  { label: 'Finalizing', description: 'Polishing your clip' },
]

const GENERATION_STEPS_WITH_VO = [
  { label: 'Parsing Script', description: 'AI is analyzing your scenes' },
  { label: 'Building Scenes', description: 'Mapping to motion templates' },
  { label: 'Generating Voiceover', description: 'Cartesia AI is narrating your clip' },
  { label: 'Rendering Clip', description: 'Syncing audio to animations' },
  { label: 'Finalizing', description: 'Polishing your clip' },
]

export function ClipGeneratorModal({ isOpen, onClose, initialScript, initialColors, initialCategory, initialTitle }: ClipGeneratorModalProps) {
  const [step, setStep] = useState<'input' | 'generating' | 'result'>('input')
  const [script, setScript] = useState('')
  const [title, setTitle] = useState('')
  const [colors, setColors] = useState({
    primary: '#FACC15',
    secondary: '#EAB308',
    accent: '#F97316',
  })
  const [autoSplit, setAutoSplit] = useState(false)
  const [category, setCategory] = useState<ClipCategory>('saas')

  // Pre-fill form when opened with initial data (e.g. from "Convert to Clip")
  useEffect(() => {
    if (isOpen) {
      if (initialScript) { setScript(initialScript); setAutoSplit(true) }
      if (initialColors) setColors(initialColors)
      if (initialCategory) setCategory(initialCategory)
      if (initialTitle) setTitle(initialTitle)
    }
  }, [isOpen, initialScript, initialColors, initialCategory, initialTitle])
  const [theme, setTheme] = useState<'classic' | 'cinematic'>('classic')
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<string>(CLIP_VOICES[0].id)
  const [voiceStyle, setVoiceStyle] = useState<'conversational' | 'professional' | 'energetic' | 'calm'>('energetic')
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
        autoSplit,
        theme,
        category,
        voiceover: voiceoverEnabled ? {
          enabled: true,
          voiceId: selectedVoice,
          style: voiceStyle,
        } : undefined,
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
    let html = result.htmlContent
    // Inject voiceover audio into the HTML preview if available
    if (result.voiceoverUrl) {
      const audioTag = `<audio id="clip-voiceover" preload="auto" style="display:none"><source src="${result.voiceoverUrl}" type="audio/mpeg"></audio>`
      const voiceoverScript = `
      <script>
        (function() {
          var vo = document.getElementById('clip-voiceover');
          if (!vo) return;
          var origPlay = window.playVideo;
          if (origPlay) {
            window.playVideo = async function() {
              vo.currentTime = 0;
              vo.play().catch(function(){});
              await origPlay();
            };
          }
          // Also auto-play on first user click
          document.addEventListener('click', function handler() {
            if (vo.paused) { vo.currentTime = 0; vo.play().catch(function(){}); }
            document.removeEventListener('click', handler);
          });
        })();
      </script>`
      html = html.replace('</body>', `${audioTag}${voiceoverScript}</body>`)
    }
    const blob = new Blob([html], { type: 'text/html' })
    window.open(URL.createObjectURL(blob), '_blank')
  }, [result])

  const downloadHtml = useCallback(() => {
    if (!result?.htmlContent) return
    let html = result.htmlContent
    // Inject voiceover audio into the download if available
    if (result.voiceoverUrl) {
      const audioTag = `<audio id="clip-voiceover" preload="auto" style="display:none"><source src="${result.voiceoverUrl}" type="audio/mpeg"></audio>`
      const voiceoverScript = `
      <script>
        (function() {
          var vo = document.getElementById('clip-voiceover');
          if (!vo) return;
          var origPlay = window.playVideo;
          if (origPlay) {
            window.playVideo = async function() {
              vo.currentTime = 0;
              vo.play().catch(function(){});
              await origPlay();
            };
          }
          document.addEventListener('click', function handler() {
            if (vo.paused) { vo.currentTime = 0; vo.play().catch(function(){}); }
            document.removeEventListener('click', handler);
          });
        })();
      </script>`
      html = html.replace('</body>', `${audioTag}${voiceoverScript}</body>`)
    }
    const blob = new Blob([html], { type: 'text/html' })
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
    setAutoSplit(false)
    setCategory('saas')
    setTheme('classic')
    setVoiceoverEnabled(false)
    setSelectedVoice(CLIP_VOICES[0].id)
    setVoiceStyle('energetic')
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

              {/* AI Auto-Split toggle */}
              <div className="mb-4 flex items-center justify-between px-1">
                <div>
                  <p className="text-xs text-white/60 font-medium">AI Auto-Split Scenes</p>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    {autoSplit
                      ? 'AI will split your text into scenes automatically'
                      : 'Separate scenes manually with ---'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSplit(!autoSplit)}
                  className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ${
                    autoSplit ? 'bg-yellow-500' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-all ${
                      autoSplit ? 'left-[22px]' : 'left-[3px]'
                    }`}
                  />
                </button>
              </div>

              {/* Category selector */}
              <div className="mb-4">
                <label className="block text-xs text-white/40 mb-2">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CLIP_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        category === cat.id
                          ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                          : 'border-white/8 bg-white/3 text-white/40 hover:border-white/15 hover:bg-white/5'
                      }`}
                    >
                      <div className="font-semibold">{cat.label}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme selector */}
              <div className="mb-4">
                <label className="block text-xs text-white/40 mb-2">Style</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('classic')}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                      theme === 'classic'
                        ? 'border-white/30 bg-white/10 text-white'
                        : 'border-white/8 bg-white/3 text-white/40 hover:border-white/15 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-semibold mb-0.5">Classic</div>
                    <div className="text-[10px] opacity-60">Clean motion graphics</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('cinematic')}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                      theme === 'cinematic'
                        ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                        : 'border-white/8 bg-white/3 text-white/40 hover:border-white/15 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-semibold mb-0.5">Cinematic</div>
                    <div className="text-[10px] opacity-60">Montage + letterbox + glow</div>
                  </button>
                </div>
                {theme === 'cinematic' && (
                  <p className="text-[10px] text-yellow-400/40 mt-1.5 px-1">
                    Adds a montage intro + letterbox bars + enhanced animations. Uses 1 extra scene slot.
                  </p>
                )}
              </div>

              {/* Voiceover toggle + settings */}
              <div className="mb-4">
                <div className="flex items-center justify-between px-1 mb-2">
                  <div>
                    <p className="text-xs text-white/60 font-medium">AI Voiceover</p>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      {voiceoverEnabled
                        ? 'Cartesia AI narration synced to your clip'
                        : 'Add AI-generated voiceover narration'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVoiceoverEnabled(!voiceoverEnabled)}
                    className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ${
                      voiceoverEnabled ? 'bg-yellow-500' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-all ${
                        voiceoverEnabled ? 'left-[22px]' : 'left-[3px]'
                      }`}
                    />
                  </button>
                </div>

                {voiceoverEnabled && (
                  <div className="space-y-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    {/* Voice selection */}
                    <div>
                      <label className="block text-[11px] text-white/40 mb-1.5">Voice</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {CLIP_VOICES.map((voice) => (
                          <button
                            key={voice.id}
                            type="button"
                            onClick={() => setSelectedVoice(voice.id)}
                            className={`px-3 py-2 rounded-lg border text-left transition-all ${
                              selectedVoice === voice.id
                                ? 'border-yellow-500/40 bg-yellow-500/10'
                                : 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5'
                            }`}
                          >
                            <span className={`text-xs font-medium ${
                              selectedVoice === voice.id ? 'text-yellow-400' : 'text-white/60'
                            }`}>{voice.name}</span>
                            <span className={`block text-[10px] mt-0.5 ${
                              selectedVoice === voice.id ? 'text-yellow-400/50' : 'text-white/25'
                            }`}>{voice.gender}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Voice style */}
                    <div>
                      <label className="block text-[11px] text-white/40 mb-1.5">Style</label>
                      <div className="flex flex-wrap gap-1.5">
                        {VOICE_STYLES.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setVoiceStyle(s.id as typeof voiceStyle)}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                              voiceStyle === s.id
                                ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                                : 'border-white/5 bg-white/2 text-white/40 hover:border-white/10'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {userPlan === 'free' && (
                      <p className="text-[10px] text-yellow-400/40 px-1">
                        Voiceover uses your monthly voiceover credits. PRO plan includes 30/month.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Script input */}
              <div className="mb-4">
                <label className="block text-xs text-white/40 mb-1.5">
                  Script {!autoSplit && <span className="text-white/20">(use --- to separate scenes)</span>}
                </label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder={autoSplit
                    ? `Just paste your full text here and AI will split it into scenes for you.\n\n${CLIP_CATEGORIES.find(c => c.id === category)?.placeholder || ''}`
                    : CLIP_CATEGORIES.find(c => c.id === category)?.placeholder || ''}
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

                {/* Preset palettes */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {COLOR_PRESETS.map((preset) => {
                    const isActive =
                      colors.primary === preset.primary &&
                      colors.secondary === preset.secondary &&
                      colors.accent === preset.accent
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          setColors({
                            primary: preset.primary,
                            secondary: preset.secondary,
                            accent: preset.accent,
                          })
                        }
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                          isActive
                            ? 'border-white/30 bg-white/10 text-white'
                            : 'border-white/8 bg-white/3 text-white/40 hover:border-white/15 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex -space-x-1">
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/30"
                            style={{ background: preset.primary }}
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/30"
                            style={{ background: preset.secondary }}
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/30"
                            style={{ background: preset.accent }}
                          />
                        </div>
                        {preset.name}
                      </button>
                    )
                  })}
                </div>

                {/* Custom color pickers */}
                <div className="flex gap-3">
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
                {voiceoverEnabled ? 'Generate Clip + Voiceover' : 'Generate Clip'}
              </button>
            </div>
          )}

          {/* GENERATING STEP */}
          {step === 'generating' && (
            <div className="p-8 flex flex-col items-center">
              <h2 className="text-xl font-bold text-white mb-2">Creating Your Clip</h2>
              <p className="text-sm text-white/40 mb-8">AI is building your motion graphic...</p>

              <div className="w-full max-w-sm space-y-4">
                {(voiceoverEnabled ? GENERATION_STEPS_WITH_VO : GENERATION_STEPS).map((s, i) => (
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
              <p className="text-sm text-white/40 mb-2">
                {result.scenesCount} scenes, ~{result.duration}s duration
              </p>
              {result.hasVoiceover && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  <span className="text-[11px] font-medium text-yellow-400">AI Voiceover Included</span>
                </div>
              )}

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
                  setCategory('saas')
                  setTheme('classic')
                  setVoiceoverEnabled(false)
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
