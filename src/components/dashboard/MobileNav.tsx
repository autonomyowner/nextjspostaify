'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const [isPostsMenuOpen, setIsPostsMenuOpen] = useState(false)
  const postsMenuRef = useRef<HTMLDivElement>(null)

  // Close posts menu when tapping outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (postsMenuRef.current && !postsMenuRef.current.contains(e.target as Node)) {
        setIsPostsMenuOpen(false)
      }
    }
    if (isPostsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPostsMenuOpen])

  // Hide nav when any modal is open (internal or external)
  const shouldHideNav = hideNav || isGenerateModalOpen || isBrandModalOpen

  const isActive = (path: string) => pathname === path
  const isPostsRelated = pathname === '/posts' || pathname === '/clips' || pathname === '/brand-kit'

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
            {/* Posts popup menu */}
            <AnimatePresence>
              {isPostsMenuOpen && (
                <motion.div
                  ref={postsMenuRef}
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-2 left-[10%] right-[40%]"
                >
                  <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl shadow-black/30 p-1.5 flex flex-col gap-1">
                    <Link
                      href="/posts"
                      onClick={() => setIsPostsMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${
                        isActive('/posts') ? 'bg-primary/10 text-primary' : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-xs font-medium">{t('nav.posts')}</span>
                    </Link>
                    <Link
                      href="/clips"
                      onClick={() => setIsPostsMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${
                        isActive('/clips') ? 'bg-primary/10 text-primary' : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth={2} />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9l5 3-5 3V9z" />
                      </svg>
                      <span className="text-xs font-medium">Clips</span>
                    </Link>
                    <Link
                      href="/brand-kit"
                      onClick={() => setIsPostsMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${
                        isActive('/brand-kit') ? 'bg-primary/10 text-primary' : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      <span className="text-xs font-medium">Brand Kit</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/20 px-1.5 py-1.5">
              <div className="flex items-center justify-between">
                {/* Dashboard */}
                <Link
                  href="/dashboard"
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all flex-1 min-w-0 ${
                    isActive('/dashboard')
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  }`}
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-[9px] font-medium truncate max-w-full">{t('nav.dashboard')}</span>
                </Link>

                {/* Posts (with popup for Clips & Brand Kit) */}
                <button
                  onClick={() => setIsPostsMenuOpen(!isPostsMenuOpen)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all flex-1 min-w-0 ${
                    isPostsRelated
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  }`}
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-[9px] font-medium truncate max-w-full">{t('nav.posts')}</span>
                </button>

                {/* Calendar */}
                <Link
                  href="/calendar"
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all flex-1 min-w-0 ${
                    isActive('/calendar')
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  }`}
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[9px] font-medium truncate max-w-full">{t('nav.calendar')}</span>
                </Link>

                {/* Generate */}
                <button
                  onClick={() => setIsGenerateModalOpen(true)}
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all flex-1 min-w-0 text-primary hover:bg-primary/10"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-[9px] font-medium truncate max-w-full">{t('dashboard.generate')}</span>
                </button>

                {/* Brands */}
                <button
                  onClick={() => setIsBrandModalOpen(true)}
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all flex-1 min-w-0 text-muted-foreground hover:text-white hover:bg-white/5"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-[9px] font-medium truncate max-w-full">{t('dashboard.brands')}</span>
                </button>
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
