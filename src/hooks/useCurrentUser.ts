'use client'

import { useQuery } from 'convex/react'
import { useAuthToken } from '@convex-dev/auth/react'
import { api } from '../../convex/_generated/api'

export function useCurrentUser() {
  const token = useAuthToken()
  const isAuthenticated = token !== null
  const user = useQuery(api.users.viewer)

  return {
    user,
    isLoading: isAuthenticated && user === undefined,
    isAuthenticated,
  }
}

// Re-export a compatible hook for components that used useConvexAuth
export function useConvexAuth() {
  const token = useAuthToken()
  const isAuthenticated = token !== null
  const user = useQuery(api.users.viewer)

  return {
    isAuthenticated,
    isLoading: isAuthenticated && user === undefined,
  }
}
