'use client'

import { ReactNode } from 'react'
import { ConvexClientProvider } from '@/components/providers/convex-provider'
import { I18nProvider } from '@/components/providers/i18n-provider'

// Marketing pages need:
// - ConvexClientProvider: For auth state in Navbar/Hero (shows different buttons for logged in users)
// - I18nProvider: For translations (en, ar, fr)
//
// Marketing pages do NOT need:
// - DataProvider: No user data CRUD on public pages
// - SubscriptionProvider: No plan limits on public pages

export default function MarketingLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ConvexClientProvider>
      <I18nProvider>
        {children}
      </I18nProvider>
    </ConvexClientProvider>
  )
}
