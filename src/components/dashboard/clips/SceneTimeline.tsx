'use client'

import { Reorder } from 'framer-motion'
import { SCENE_TYPE_INFO, getScenePreview } from './SceneFieldConfigs'

interface SceneTimelineProps {
  scenes: Record<string, unknown>[]
  selectedIndex: number
  onSelect: (index: number) => void
  onReorder: (scenes: Record<string, unknown>[]) => void
  onAddScene: () => void
  maxScenes: number
}

export function SceneTimeline({ scenes, selectedIndex, onSelect, onReorder, onAddScene, maxScenes }: SceneTimelineProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-white/5">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Scenes</h3>
      </div>

      {/* Scene list - scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
        <Reorder.Group axis="y" values={scenes} onReorder={onReorder} className="space-y-1">
          {scenes.map((scene, index) => {
            const type = scene.type as string
            const info = SCENE_TYPE_INFO[type]
            const preview = getScenePreview(scene)
            const isSelected = index === selectedIndex

            return (
              <Reorder.Item
                key={`scene-${index}-${type}`}
                value={scene}
                className={`
                  flex items-center gap-2 px-2.5 py-2.5 rounded-xl cursor-pointer transition-all
                  ${isSelected
                    ? 'bg-yellow-500/10 border border-yellow-500/25'
                    : 'bg-white/2 border border-transparent hover:bg-white/5 hover:border-white/8'
                  }
                `}
                onClick={() => onSelect(index)}
                whileDrag={{ scale: 1.02, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              >
                {/* Drag handle */}
                <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <circle cx="3" cy="2" r="1" />
                    <circle cx="3" cy="6" r="1" />
                    <circle cx="3" cy="10" r="1" />
                    <circle cx="8" cy="2" r="1" />
                    <circle cx="8" cy="6" r="1" />
                    <circle cx="8" cy="10" r="1" />
                  </svg>
                </div>

                {/* Number badge */}
                <span className={`
                  flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold
                  ${isSelected
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-white/5 text-white/30'
                  }
                `}>
                  {index + 1}
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] uppercase tracking-wider font-medium ${isSelected ? 'text-yellow-400/70' : 'text-white/30'}`}>
                      {info?.label || type}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 truncate mt-0.5">
                    {preview}
                  </p>
                </div>
              </Reorder.Item>
            )
          })}
        </Reorder.Group>
      </div>

      {/* Add scene button */}
      {scenes.length < maxScenes && (
        <div className="p-2 border-t border-white/5">
          <button
            onClick={onAddScene}
            className="w-full py-2 rounded-xl border border-dashed border-white/10 text-white/30 text-xs font-medium hover:border-white/20 hover:text-white/50 hover:bg-white/3 transition-all flex items-center justify-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="6" y1="1" x2="6" y2="11" />
              <line x1="1" y1="6" x2="11" y2="6" />
            </svg>
            Add Scene
          </button>
        </div>
      )}
    </div>
  )
}
