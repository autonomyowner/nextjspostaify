'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PROMPT_TEMPLATES,
  PromptTemplate,
  buildPromptFromTemplate,
  getSuggestedAspectRatio,
} from '@/lib/imagePromptTemplates'

interface PromptTemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (prompt: string, aspectRatio: string) => void
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
  general: 'General',
}

export function PromptTemplateSelector({
  isOpen,
  onClose,
  onSelect,
}: PromptTemplateSelectorProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram')
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [variables, setVariables] = useState<Record<string, string>>({})

  const templates = useMemo(
    () => PROMPT_TEMPLATES[selectedPlatform as keyof typeof PROMPT_TEMPLATES] || [],
    [selectedPlatform]
  )

  const handleTemplateSelect = useCallback((template: PromptTemplate) => {
    setSelectedTemplate(template)
    // Initialize variables with empty strings
    const initialVars: Record<string, string> = {}
    template.variables.forEach(v => {
      initialVars[v] = ''
    })
    setVariables(initialVars)
  }, [])

  const handleVariableChange = useCallback((key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleApply = useCallback(() => {
    if (!selectedTemplate) return

    // Check if all variables are filled
    const allFilled = selectedTemplate.variables.every(v => variables[v]?.trim())
    if (!allFilled) return

    const prompt = buildPromptFromTemplate(selectedTemplate, variables)
    const aspectRatio = selectedTemplate.aspectRatio
    onSelect(prompt, aspectRatio)
    onClose()
  }, [selectedTemplate, variables, onSelect, onClose])

  const canApply = useMemo(() => {
    if (!selectedTemplate) return false
    return selectedTemplate.variables.every(v => variables[v]?.trim())
  }, [selectedTemplate, variables])

  const previewPrompt = useMemo(() => {
    if (!selectedTemplate) return ''
    return buildPromptFromTemplate(selectedTemplate, variables)
  }, [selectedTemplate, variables])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full mx-4 max-w-4xl max-h-[85vh] overflow-hidden bg-card border border-border rounded-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-bold">Choose a Template</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex h-[calc(85vh-140px)]">
            {/* Platform Tabs - Left sidebar */}
            <div className="w-40 border-r border-border p-2 flex flex-col gap-1 overflow-y-auto">
              {Object.keys(PROMPT_TEMPLATES).map(platform => (
                <button
                  key={platform}
                  onClick={() => {
                    setSelectedPlatform(platform)
                    setSelectedTemplate(null)
                    setVariables({})
                  }}
                  className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    selectedPlatform === platform
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-white hover:bg-background'
                  }`}
                >
                  {PLATFORM_LABELS[platform]}
                </button>
              ))}
            </div>

            {/* Templates List */}
            <div className="flex-1 flex">
              {/* Template cards */}
              <div className="w-1/2 p-4 overflow-y-auto border-r border-border">
                <div className="grid gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border border-border hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="block text-sm font-medium">{template.name}</span>
                          <span className={`block text-xs mt-0.5 ${
                            selectedTemplate?.id === template.id
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                            {template.description}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          selectedTemplate?.id === template.id
                            ? 'bg-primary-foreground/20'
                            : 'bg-white/10'
                        }`}>
                          {template.aspectRatio}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Variable inputs and preview */}
              <div className="w-1/2 p-4 overflow-y-auto">
                {selectedTemplate ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Fill in the details</h3>
                      <div className="space-y-3">
                        {selectedTemplate.variables.map(varName => (
                          <div key={varName}>
                            <label className="block text-xs text-muted-foreground mb-1 capitalize">
                              {varName.replace(/_/g, ' ')}
                            </label>
                            <input
                              type="text"
                              value={variables[varName] || ''}
                              onChange={e => handleVariableChange(varName, e.target.value)}
                              placeholder={`Enter ${varName.replace(/_/g, ' ')}...`}
                              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedTemplate.tips && (
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-blue-400">
                          <span className="font-medium">Tip:</span> {selectedTemplate.tips}
                        </p>
                      </div>
                    )}

                    {/* Preview */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Preview</h3>
                      <div className="p-3 rounded-lg bg-background border border-border">
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {previewPrompt || selectedTemplate.basePrompt}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Select a template to customize
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!canApply}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                canApply
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Use Template
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
