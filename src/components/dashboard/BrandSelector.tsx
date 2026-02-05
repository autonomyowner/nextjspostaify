'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useData } from "@/context/DataContext"

interface BrandSelectorProps {
  onAddBrand?: () => void
  onEditBrand?: (brandId: string) => void
}

export function BrandSelector({ onAddBrand, onEditBrand }: BrandSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { brands, selectedBrandId, selectBrand } = useData()

  const selectedBrand = brands.find(b => b.id === selectedBrandId) || brands[0]

  if (!selectedBrand) {
    return (
      <button
        onClick={onAddBrand}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-dashed border-primary/50 hover:border-primary transition-colors text-primary"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-sm font-medium">Create Brand</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:border-white/20 transition-colors"
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: selectedBrand.color }}
        >
          {selectedBrand.initials}
        </div>
        <span className="text-sm font-medium">{selectedBrand.name}</span>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute end-0 mt-2 w-48 sm:w-56 max-w-[calc(100vw-2rem)] rounded-lg bg-card border border-border shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-2 py-1 mb-1">Select brand</p>
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className={`group flex items-center gap-1 rounded-md transition-colors ${
                      selectedBrandId === brand.id
                        ? 'bg-white/10'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <button
                      onClick={() => {
                        selectBrand(brand.id)
                        setIsOpen(false)
                      }}
                      className="flex-1 flex items-center gap-3 px-2 py-2"
                    >
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: brand.color }}
                      >
                        {brand.initials}
                      </div>
                      <span className="text-sm">{brand.name}</span>
                      {selectedBrandId === brand.id && (
                        <svg className="w-4 h-4 ms-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    {onEditBrand && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsOpen(false)
                          onEditBrand(brand.id)
                        }}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-md transition-all"
                        title="Edit brand"
                      >
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-2">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    onAddBrand?.()
                  }}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/5 transition-colors text-primary"
                >
                  <div className="w-8 h-8 rounded-md border-2 border-dashed border-primary/50 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-sm">Create Brand</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
