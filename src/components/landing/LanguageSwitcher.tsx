'use client'

import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

const languages = [
  { code: 'en', label: 'ENG' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="text-xs px-2 py-1 h-7 text-muted-foreground hover:text-white min-w-[40px]"
      >
        {currentLang.label}
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-1 end-0 bg-card border border-border rounded-md shadow-lg py-1 min-w-[120px] z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full px-3 py-2 text-start text-sm hover:bg-muted transition-colors ${
                lang.code === i18n.language
                  ? 'text-primary bg-muted/50'
                  : 'text-foreground'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
