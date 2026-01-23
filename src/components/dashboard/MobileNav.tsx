'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { GenerateModal } from './GenerateModal'
import { BrandModal } from './BrandModal'

interface MobileNavProps {
  hideNav?: boolean
}

export function MobileNav({ hideNav = false }: MobileNavProps) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)

  // Hide nav when any modal is open (internal or external)
  const shouldHideNav = hideNav || isGenerateModalOpen || isBrandModalOpen

  const isActive = (path: string) => pathname === path

  const navItems = [
    {
      type: 'link' as const,
      path: '/dashboard',
      label: t('nav.dashboard'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      type: 'link' as const,
      path: '/posts',
      label: t('nav.posts'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      type: 'link' as const,
      path: '/calendar',
      label: t('nav.calendar'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      type: 'button' as const,
      action: () => setIsGenerateModalOpen(true),
      label: t('dashboard.generate'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      highlight: true,
    },
    {
      type: 'button' as const,
      action: () => setIsBrandModalOpen(true),
      label: t('dashboard.brands'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
  ]

  return (
    <>
      {/* Floating Bottom Navigation - Mobile Only */}
      <AnimatePresence>
        {!shouldHideNav && (
          <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-4 start-4 end-4 md:hidden z-50"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/20 px-1.5 py-1.5">
              <div className="flex items-center justify-between">
                {navItems.map((item, index) => {
                  if (item.type === 'link') {
                    const active = isActive(item.path)
                    return (
                      <Link
                        key={index}
                        href={item.path}
                        className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all flex-1 min-w-0 ${
                          active
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {item.icon}
                        <span className="text-[9px] font-medium truncate max-w-full">{item.label}</span>
                      </Link>
                    )
                  }

                  return (
                    <button
                      key={index}
                      onClick={item.action}
                      className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all flex-1 min-w-0 ${
                        item.highlight
                          ? 'text-primary hover:bg-primary/10'
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.icon}
                      <span className="text-[9px] font-medium truncate max-w-full">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Modals */}
      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
      />
    </>
  )
}
