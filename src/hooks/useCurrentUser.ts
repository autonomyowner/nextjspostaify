'use client'

import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { authClient } from '@/lib/auth-client'

export function useCurrentUser() {
  const { data: session, isPending } = authClient.useSession()
  const user = useQuery(api.users.viewer)

  return {
    user,
    isLoading: isPending || (session && user === undefined),
    isAuthenticated: !!session,
  }
}

// Re-export a compatible hook for components that used useConvexAuth
export function useConvexAuth() {
  const { data: session, isPending } = authClient.useSession()
  const user = useQuery(api.users.viewer)

  return {
    isAuthenticated: !!session,
    isLoading: isPending || (session && user === undefined),
  }
}
