'use client'

import { ReactNode } from 'react'
import { ConvexClientProvider } from '@/components/providers/convex-provider'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { DataProvider } from '@/context/DataContext'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { useConvexAuth } from '@/hooks/useCurrentUser'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useEffect, useState } from 'react'

// Dashboard pages need all providers:
// - ConvexClientProvider: Convex database connection
// - I18nProvider: Translations
// - DataProvider: User, brands, posts CRUD
// - SubscriptionProvider: Plan limits and feature gating

// Inner component that uses hooks (must be inside ConvexClientProvider)
function DashboardAuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const ensureUserExists = useMutation(api.users.ensureUserExists)
  const [userEnsured, setUserEnsured] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/sign-in'
    }
  }, [isLoading, isAuthenticated])

  // Ensure user exists in app database when authenticated
  useEffect(() => {
    if (isAuthenticated && !userEnsured) {
      ensureUserExists()
        .then(() => setUserEnsured(true))
        .catch(() => setUserEnsured(true)) // Ignore errors, user might already exist
    }
  }, [isAuthenticated, userEnsured, ensureUserExists])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render children if not signed in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DataProvider>
      <SubscriptionProvider>
        {children}
      </SubscriptionProvider>
    </DataProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ConvexClientProvider>
      <I18nProvider>
        <DashboardAuthGuard>
          {children}
        </DashboardAuthGuard>
      </I18nProvider>
    </ConvexClientProvider>
  )
}
