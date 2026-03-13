'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { useSubscription } from '@/context/SubscriptionContext'
import { SceneTimeline } from './SceneTimeline'
import { ScenePreview } from './ScenePreview'
import { SceneProperties } from './SceneProperties'
import { SceneTypePicker } from './SceneTypePicker'
import { createDefaultScene, SCENE_FIELD_CONFIGS } from './SceneFieldConfigs'
import Link from 'next/link'

interface ClipEditorProps {
  clip: {
    _id: string
    title: string
    scenes: Record<string, unknown>[]
    htmlContent: string
    colors: { primary: string; secondary: string; accent: string; background?: string }
    theme?: string
    voiceoverStorageId?: string
    duration: number
    scenesCount: number
  }
}

export function ClipEditor({ clip }: ClipEditorProps) {
  const { subscription } = useSubscription()
  const maxScenes = subscription.plan === 'free' ? 4 : 8

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateScenes = useMutation((api as any).clips.updateScenes)

  const [scenes, setScenes] = useState<Record<string, unknown>[]>(clip.scenes)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [title, setTitle] = useState(clip.title)
  const [previewHtml, setPreviewHtml] = useState<string>(clip.htmlContent)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [showTypePicker, setShowTypePicker] = useState(false)
  const [addingScene, setAddingScene] = useState(false) // true = adding, false = changing type

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scenesRef = useRef(scenes)
  const titleRef = useRef(title)
  scenesRef.current = scenes
  titleRef.current = title

  // Debounced save
  const scheduleSave = useCallback(() => {
    setIsDirty(true)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    saveTimerRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        const result = await updateScenes({
          clipId: clip._id as Id<"clips">,
          scenes: scenesRef.current,
          title: titleRef.current,
        })
        if (result?.htmlContent) {
          setPreviewHtml(result.htmlContent)
        }
        setIsDirty(false)
      } catch (e) {
        console.error('Failed to save:', e)
      } finally {
        setSaving(false)
      }
    }, 500)
  }, [clip._id, updateScenes])

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty || isSaving) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty, isSaving])

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  // --- Scene operations ---

  const updateField = useCallback((key: string, value: unknown) => {
    setScenes(prev => {
      const updated = [...prev]
      updated[selectedIndex] = { ...updated[selectedIndex], [key]: value }
      return updated
    })
    scheduleSave()
  }, [selectedIndex, scheduleSave])

  const reorderScenes = useCallback((newScenes: Record<string, unknown>[]) => {
    // Find where the previously selected scene ended up
    const prevScene = scenes[selectedIndex]
    const newIndex = newScenes.indexOf(prevScene)
    setScenes(newScenes)
    if (newIndex >= 0) setSelectedIndex(newIndex)
    scheduleSave()
  }, [scenes, selectedIndex, scheduleSave])

  const addScene = useCallback((type: string) => {
    if (scenes.length >= maxScenes) return
    const newScene = createDefaultScene(type)
    setScenes(prev => [...prev, newScene])
    setSelectedIndex(scenes.length)
    scheduleSave()
  }, [scenes.length, maxScenes, scheduleSave])

  const deleteScene = useCallback(() => {
    if (scenes.length <= 1) return
    setScenes(prev => prev.filter((_, i) => i !== selectedIndex))
    setSelectedIndex(prev => Math.min(prev, scenes.length - 2))
    scheduleSave()
  }, [scenes.length, selectedIndex, scheduleSave])

  const changeSceneType = useCallback((newType: string) => {
    setScenes(prev => {
      const updated = [...prev]
      const oldScene = updated[selectedIndex]
      const newFields = SCENE_FIELD_CONFIGS[newType] || []
      const newScene: Record<string, unknown> = { type: newType }

      // Map compatible fields from old scene
      const fieldKeys = new Set(newFields.map(f => f.key))
      for (const [key, value] of Object.entries(oldScene)) {
        if (key === 'type') continue
        if (key === 'transition') { newScene.transition = value; continue }
        if (fieldKeys.has(key)) newScene[key] = value
      }

      // Map headline -> brandName or vice versa
      if (fieldKeys.has('brandName') && !newScene.brandName && oldScene.headline) {
        newScene.brandName = oldScene.headline
      }
      if (fieldKeys.has('headline') && !newScene.headline && oldScene.brandName) {
        newScene.headline = oldScene.brandName
      }
      // Map features <-> items
      if (fieldKeys.has('items') && !newScene.items && oldScene.features) {
        newScene.items = oldScene.features
      }
      if (fieldKeys.has('features') && !newScene.features && oldScene.items) {
        newScene.features = oldScene.items
      }

      // Fill defaults for missing required fields
      const defaults = createDefaultScene(newType)
      for (const field of newFields) {
        if (newScene[field.key] === undefined && defaults[field.key] !== undefined) {
          newScene[field.key] = defaults[field.key]
        }
      }

      updated[selectedIndex] = newScene
      return updated
    })
    scheduleSave()
  }, [selectedIndex, scheduleSave])

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle)
    scheduleSave()
  }, [scheduleSave])

  const selectedScene = scenes[selectedIndex] || scenes[0]

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c]">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#0e0e12]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/clips"
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 1L4 7l6 6" />
            </svg>
          </Link>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="bg-transparent text-sm font-semibold text-white/80 focus:text-white focus:outline-none border-b border-transparent focus:border-white/20 transition-colors px-1 py-0.5 max-w-[200px] sm:max-w-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Save indicator */}
          <div className="flex items-center gap-1.5 text-[11px]">
            {isSaving ? (
              <>
                <div className="w-3 h-3 border border-yellow-400/40 border-t-yellow-400 rounded-full animate-spin" />
                <span className="text-yellow-400/60">Saving...</span>
              </>
            ) : isDirty ? (
              <>
                <div className="w-2 h-2 rounded-full bg-yellow-400/50" />
                <span className="text-white/30">Unsaved</span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400/60">
                  <polyline points="2 6 5 9 10 3" />
                </svg>
                <span className="text-white/30">Saved</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Voiceover warning */}
      {clip.voiceoverStorageId && (
        <div className="flex-shrink-0 px-4 py-2 bg-yellow-500/5 border-b border-yellow-500/10 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400/60 flex-shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[11px] text-yellow-400/60">
            This clip has a voiceover. Editing scenes may cause the audio to go out of sync.
          </p>
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Timeline - left panel (desktop) / top strip (mobile) */}
        <div className="flex-shrink-0 lg:w-[280px] lg:border-r border-b lg:border-b-0 border-white/5 bg-[#0e0e12]">
          {/* Mobile: horizontal scroll */}
          <div className="lg:hidden overflow-x-auto flex gap-2 p-3">
            {scenes.map((scene, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  i === selectedIndex
                    ? 'bg-yellow-500/10 border border-yellow-500/25 text-yellow-400'
                    : 'bg-white/3 border border-white/5 text-white/40'
                }`}
              >
                {i + 1}. {(scene.type as string).charAt(0).toUpperCase() + (scene.type as string).slice(1)}
              </button>
            ))}
            {scenes.length < maxScenes && (
              <button
                onClick={() => { setAddingScene(true); setShowTypePicker(true); }}
                className="flex-shrink-0 px-3 py-2 rounded-xl border border-dashed border-white/10 text-white/20 text-xs hover:border-white/20 hover:text-white/40 transition-all"
              >
                +
              </button>
            )}
          </div>
          {/* Desktop: vertical timeline */}
          <div className="hidden lg:flex flex-col h-full">
            <SceneTimeline
              scenes={scenes}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              onReorder={reorderScenes}
              onAddScene={() => { setAddingScene(true); setShowTypePicker(true); }}
              maxScenes={maxScenes}
            />
          </div>
        </div>

        {/* Preview - center panel */}
        <div className="flex-1 min-h-0 min-w-0">
          <ScenePreview htmlContent={previewHtml} />
        </div>

        {/* Properties - right panel (desktop) / bottom section (mobile) */}
        <div className="flex-shrink-0 lg:w-[340px] lg:border-l border-t lg:border-t-0 border-white/5 bg-[#0e0e12] max-h-[40vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
          {selectedScene && (
            <SceneProperties
              scene={selectedScene}
              sceneIndex={selectedIndex}
              totalScenes={scenes.length}
              onUpdateField={updateField}
              onChangeType={changeSceneType}
              onDelete={deleteScene}
            />
          )}
        </div>
      </div>

      {/* Scene type picker modal */}
      <SceneTypePicker
        isOpen={showTypePicker}
        onClose={() => setShowTypePicker(false)}
        onSelect={(type) => {
          if (addingScene) {
            addScene(type)
            setAddingScene(false)
          } else {
            changeSceneType(type)
          }
        }}
      />
    </div>
  )
}
