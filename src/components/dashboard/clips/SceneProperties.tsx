'use client'

import { useState } from 'react'
import { SCENE_FIELD_CONFIGS, TRANSITION_OPTIONS, SCENE_TYPE_INFO } from './SceneFieldConfigs'

interface ScenePropertiesProps {
  scene: Record<string, unknown>
  sceneIndex: number
  totalScenes: number
  onUpdateField: (key: string, value: unknown) => void
  onChangeType: (newType: string) => void
  onDelete: () => void
}

export function SceneProperties({ scene, sceneIndex, totalScenes, onUpdateField, onChangeType, onDelete }: ScenePropertiesProps) {
  const type = scene.type as string
  const fields = SCENE_FIELD_CONFIGS[type] || []
  const transition = (scene.transition as string) || 'fade'
  const [showTypePicker, setShowTypePicker] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-white/5">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          Scene {sceneIndex + 1} Properties
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Scene type selector */}
        <div>
          <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5 font-medium">Type</label>
          <div className="relative">
            <button
              onClick={() => setShowTypePicker(!showTypePicker)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 text-left hover:border-white/20 transition-colors flex items-center justify-between"
            >
              <span>{SCENE_TYPE_INFO[type]?.label || type}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                <path d="M2 4l3 3 3-3" />
              </svg>
            </button>
            {showTypePicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1e] border border-white/10 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto">
                {Object.entries(SCENE_TYPE_INFO)
                  .filter(([key]) => key !== 'montage')
                  .map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => { onChangeType(key); setShowTypePicker(false); }}
                      className={`w-full px-3 py-2 text-left hover:bg-white/5 transition-colors flex items-center justify-between ${
                        key === type ? 'bg-yellow-500/10 text-yellow-400' : 'text-white/60'
                      }`}
                    >
                      <span className="text-xs font-medium">{info.label}</span>
                      <span className="text-[10px] text-white/20">{info.description}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Transition picker */}
        <div>
          <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5 font-medium">Transition</label>
          <div className="grid grid-cols-4 gap-1">
            {TRANSITION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onUpdateField('transition', opt.value === 'fade' ? undefined : opt.value)}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                  transition === opt.value || (opt.value === 'fade' && !scene.transition)
                    ? 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-400'
                    : 'bg-white/3 border border-white/5 text-white/40 hover:bg-white/6 hover:text-white/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic fields */}
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5 font-medium">
              {field.label}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={(scene[field.key] as string) || ''}
                onChange={(e) => onUpdateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={(scene[field.key] as string) || ''}
                onChange={(e) => onUpdateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none"
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={(scene[field.key] as number) ?? ''}
                onChange={(e) => onUpdateField(field.key, parseInt(e.target.value) || 0)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              />
            )}

            {field.type === 'list' && (
              <ListEditor
                items={(scene[field.key] as string[]) || []}
                onChange={(items) => onUpdateField(field.key, items)}
                placeholder={field.placeholder || 'Add item...'}
              />
            )}

            {field.type === 'stats' && (
              <StatsEditor
                stats={(scene[field.key] as Array<{ value: string; label: string }>) || []}
                onChange={(stats) => onUpdateField(field.key, stats)}
              />
            )}
          </div>
        ))}

        {/* Delete button */}
        <div className="pt-4 border-t border-white/5">
          <button
            onClick={onDelete}
            disabled={totalScenes <= 1}
            className="w-full py-2 rounded-xl bg-red-500/5 border border-red-500/15 text-red-400/60 text-xs font-medium hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Delete Scene
          </button>
        </div>
      </div>
    </div>
  )
}

// --- List Editor ---
function ListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  const [newItem, setNewItem] = useState('')

  const addItem = () => {
    if (!newItem.trim()) return
    onChange([...items, newItem.trim()])
    setNewItem('')
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, value: string) => {
    const updated = [...items]
    updated[index] = value
    onChange(updated)
  }

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
          />
          <button
            onClick={() => removeItem(i)}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-white/3 hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l6 6M1 7l6-6" />
            </svg>
          </button>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 bg-white/3 border border-dashed border-white/8 rounded-lg text-xs text-white placeholder:text-white/15 focus:outline-none focus:border-white/15 transition-colors"
        />
        <button
          onClick={addItem}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="5" y1="1" x2="5" y2="9" />
            <line x1="1" y1="5" x2="9" y2="5" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// --- Stats Editor ---
function StatsEditor({ stats, onChange }: { stats: Array<{ value: string; label: string }>; onChange: (stats: Array<{ value: string; label: string }>) => void }) {
  const addStat = () => {
    onChange([...stats, { value: '0', label: 'Label' }])
  }

  const removeStat = (index: number) => {
    onChange(stats.filter((_, i) => i !== index))
  }

  const updateStat = (index: number, field: 'value' | 'label', val: string) => {
    const updated = [...stats]
    updated[index] = { ...updated[index], [field]: val }
    onChange(updated)
  }

  return (
    <div className="space-y-1.5">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            type="text"
            value={stat.value}
            onChange={(e) => updateStat(i, 'value', e.target.value)}
            placeholder="Value"
            className="w-20 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors text-center font-semibold"
          />
          <input
            type="text"
            value={stat.label}
            onChange={(e) => updateStat(i, 'label', e.target.value)}
            placeholder="Label"
            className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
          />
          <button
            onClick={() => removeStat(i)}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-white/3 hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l6 6M1 7l6-6" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={addStat}
        className="w-full py-1.5 rounded-lg border border-dashed border-white/8 text-white/25 text-[10px] font-medium hover:border-white/15 hover:text-white/40 transition-all"
      >
        + Add Stat
      </button>
    </div>
  )
}
