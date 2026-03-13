'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { SCENE_TYPE_INFO } from './SceneFieldConfigs'

interface SceneTypePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: string) => void
  excludeMontage?: boolean
}

const SCENE_TYPES = Object.entries(SCENE_TYPE_INFO).filter(([key]) => key !== 'montage')

export function SceneTypePicker({ isOpen, onClose, onSelect, excludeMontage = true }: SceneTypePickerProps) {
  const types = excludeMontage ? SCENE_TYPES : Object.entries(SCENE_TYPE_INFO)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Choose Scene Type</h3>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {types.map(([key, info]) => (
              <button
                key={key}
                onClick={() => { onSelect(key); onClose(); }}
                className="flex flex-col items-start p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/15 hover:bg-white/6 transition-all text-left group"
              >
                <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
                  {info.label}
                </span>
                <span className="text-[10px] text-white/30 mt-0.5 leading-tight">
                  {info.description}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
