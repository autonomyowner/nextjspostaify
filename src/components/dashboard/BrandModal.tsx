'use client'

import { useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useData, VOICE_OPTIONS } from '@/context/DataContext'
import { useSubscription } from '@/context/SubscriptionContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface BrandModalProps {
  isOpen: boolean
  onClose: () => void
  editBrandId?: string | null
}

const COLORS = ['#EAB308', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'] as const

function BrandModalComponent({ isOpen, onClose, editBrandId }: BrandModalProps) {
  const { t } = useTranslation()
  const { brands, addBrand, updateBrand, selectBrand } = useData()
  const { canAddBrand, openUpgradeModal } = useSubscription()

  const editBrand = editBrandId ? brands.find(b => b.id === editBrandId) : null

  const [name, setName] = useState(editBrand?.name || '')
  const [color, setColor] = useState(editBrand?.color || COLORS[0])
  const [voice, setVoice] = useState(editBrand?.voice || 'professional')
  const [description, setDescription] = useState(editBrand?.description || '')
  const [topicsInput, setTopicsInput] = useState(editBrand?.topics.join(', ') || '')
  const [error, setError] = useState('')

  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'BR'

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Brand name is required')
      return
    }

    const topics = topicsInput.split(',').map(t => t.trim()).filter(Boolean)
    if (topics.length === 0) {
      setError('At least one topic is required')
      return
    }

    // Check brand limit for new brands (not edits)
    if (!editBrandId && !canAddBrand(brands.length)) {
      handleClose()
      openUpgradeModal('brand')
      return
    }

    const brandData = {
      name: name.trim(),
      color,
      initials,
      voice,
      description: description.trim() || `${name} brand profile`,
      topics
    }

    try {
      if (editBrandId) {
        await updateBrand(editBrandId, brandData)
      } else {
        const newBrand = await addBrand(brandData)
        selectBrand(newBrand.id)
      }
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save brand')
    }
  }

  const handleClose = useCallback(() => {
    setName('')
    setColor(COLORS[0])
    setVoice('professional')
    setDescription('')
    setTopicsInput('')
    setError('')
    onClose()
  }, [onClose])

  if (!isOpen) return null

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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg mx-4"
        >
          <Card className="p-2 sm:p-6 bg-card border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl font-bold">
                {editBrandId ? t('brandModal.edit') : t('brandModal.create')}
              </h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Brand Preview */}
            <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg bg-background border border-border mb-4 sm:mb-6">
              <div
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-sm sm:text-lg font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {initials}
              </div>
              <div>
                <p className="font-medium text-xs sm:text-base">{name || t('brandModal.name')}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">Preview</p>
              </div>
            </div>

            {/* Name */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">{t('brandModal.name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('brandModal.namePlaceholder')}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {/* Color */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">{t('brandModal.color')}</label>
              <div className="flex gap-1.5 sm:gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg transition-transform ${
                      color === c ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Voice */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">{t('brandModal.voice')}</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-primary"
              >
                {VOICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(`brandModal.voiceOptions.${opt.value}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Topics */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">{t('brandModal.topics')}</label>
              <input
                type="text"
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                placeholder={t('brandModal.topicsPlaceholder')}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-primary"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Separate topics with commas</p>
            </div>

            {/* Description */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">{t('brandModal.description')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('brandModal.descriptionPlaceholder')}
                rows={2}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] sm:text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-1.5 sm:gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm">
                {t('brandModal.cancel')}
              </Button>
              <Button onClick={handleSave} className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm">
                {editBrandId ? t('brandModal.save') : t('brandModal.create')}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export const BrandModal = memo(BrandModalComponent)
