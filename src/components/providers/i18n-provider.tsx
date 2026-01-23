'use client'

import { useEffect, useState } from 'react'
import '@/i18n/config'

interface I18nProviderProps {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by waiting for client-side mount
  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}
