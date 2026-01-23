'use client'

import { createContext, useContext, type ReactNode, useCallback, useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

// Types
export interface Brand {
  id: string
  name: string
  color: string
  initials: string
  voice: string
  topics: string[]
  description: string
  createdAt: number
  postCount?: number
}

export interface Post {
  id: string
  brandId: string
  platform: 'Instagram' | 'Twitter' | 'LinkedIn' | 'TikTok' | 'Facebook'
  content: string
  imageUrl?: string
  voiceUrl?: string
  status: 'draft' | 'scheduled' | 'published'
  scheduledFor?: string
  createdAt: number
  publishedAt?: number
  brand?: {
    id: string
    name: string
    color: string
    initials: string
  }
}

export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  plan: 'FREE' | 'PRO' | 'BUSINESS'
}

export const PLATFORMS = ['Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Facebook'] as const
export type Platform = typeof PLATFORMS[number]

export const VOICE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'witty', label: 'Witty & Humorous' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'educational', label: 'Educational' },
] as const

interface Stats {
  postsScheduled: number
  postsDraft: number
  postsPublished: number
  totalPosts: number
}

interface DataContextType {
  // User
  user: UserProfile | null
  isLoading: boolean
  error: string | null

  // Brands
  brands: Brand[]
  selectedBrandId: string | null
  addBrand: (brand: Omit<Brand, 'id' | 'createdAt'>) => Promise<Brand>
  updateBrand: (id: string, updates: Partial<Brand>) => Promise<void>
  deleteBrand: (id: string) => Promise<void>
  selectBrand: (id: string | null) => void

  // Posts
  posts: Post[]
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => Promise<Post>
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>
  deletePost: (id: string) => Promise<void>

  // Stats
  getStats: () => Stats

  // Refresh data (no-op in Convex - data is real-time)
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | null>(null)

// Helper to convert platform case
const platformToBackend = (p: Platform): 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN' | 'TIKTOK' | 'FACEBOOK' => {
  const map: Record<Platform, 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN' | 'TIKTOK' | 'FACEBOOK'> = {
    'Instagram': 'INSTAGRAM',
    'Twitter': 'TWITTER',
    'LinkedIn': 'LINKEDIN',
    'TikTok': 'TIKTOK',
    'Facebook': 'FACEBOOK'
  }
  return map[p]
}

const platformFromBackend = (p: string): Platform => {
  const map: Record<string, Platform> = {
    'INSTAGRAM': 'Instagram',
    'TWITTER': 'Twitter',
    'LINKEDIN': 'LinkedIn',
    'TIKTOK': 'TikTok',
    'FACEBOOK': 'Facebook'
  }
  return map[p] || p as Platform
}

const statusToBackend = (s: string): 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' => {
  return s.toUpperCase() as 'DRAFT' | 'SCHEDULED' | 'PUBLISHED'
}

const statusFromBackend = (s: string): 'draft' | 'scheduled' | 'published' => {
  return s.toLowerCase() as 'draft' | 'scheduled' | 'published'
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userSynced, setUserSynced] = useState(false)

  // Get Clerk user
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const clerkId = clerkUser?.id

  // Sync user mutation
  const syncUserMutation = useMutation(api.users.syncUser)

  // Sync user on load
  useEffect(() => {
    if (clerkLoaded && clerkUser && !userSynced) {
      syncUserMutation({
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        name: clerkUser.fullName || undefined,
        avatarUrl: clerkUser.imageUrl || undefined,
      }).then(() => {
        setUserSynced(true)
      }).catch(console.error)
    }
  }, [clerkLoaded, clerkUser, userSynced, syncUserMutation])

  // Convex queries - pass clerkId as fallback
  const userData = useQuery(api.users.getByClerkId, clerkId ? { clerkId } : "skip")
  const brandsData = useQuery(api.brands.list, clerkId ? { clerkId } : "skip")
  // Fetch posts filtered by selected brand (if any)
  const postsData = useQuery(
    api.posts.list,
    clerkId
      ? {
          clerkId,
          limit: 1000,
          ...(selectedBrandId ? { brandId: selectedBrandId as Id<"brands"> } : {})
        }
      : "skip"
  )

  // Convex mutations
  const createBrandMutation = useMutation(api.brands.create)
  const updateBrandMutation = useMutation(api.brands.update)
  const deleteBrandMutation = useMutation(api.brands.remove)
  const createPostMutation = useMutation(api.posts.create)
  const updatePostMutation = useMutation(api.posts.update)
  const deletePostMutation = useMutation(api.posts.remove)

  // Determine loading state
  const isLoading = userData === undefined || brandsData === undefined || postsData === undefined

  // Transform user data
  const user: UserProfile | null = useMemo(() => {
    if (!userData) return null
    return {
      id: userData._id,
      email: userData.email,
      name: userData.name ?? null,
      avatarUrl: userData.avatarUrl ?? null,
      plan: userData.plan
    }
  }, [userData])

  // Transform brands data
  const brands: Brand[] = useMemo(() => {
    if (!brandsData) return []
    return brandsData.map(b => ({
      id: b._id,
      name: b.name,
      color: b.color,
      initials: b.initials,
      voice: b.voice,
      topics: b.topics,
      description: b.description || '',
      createdAt: b._creationTime,
      postCount: b.postCount
    }))
  }, [brandsData])

  // Transform posts data
  const posts: Post[] = useMemo(() => {
    if (!postsData?.posts) return []
    return postsData.posts.map(p => ({
      id: p._id,
      brandId: p.brand?._id || '',
      platform: platformFromBackend(p.platform),
      content: p.content,
      imageUrl: p.imageUrl ?? undefined,
      voiceUrl: p.voiceUrl ?? undefined,
      status: statusFromBackend(p.status),
      scheduledFor: p.scheduledFor ? new Date(p.scheduledFor).toISOString() : undefined,
      createdAt: p._creationTime,
      publishedAt: p.publishedAt,
      brand: p.brand ? {
        id: p.brand._id,
        name: p.brand.name,
        color: p.brand.color,
        initials: p.brand.initials
      } : undefined
    }))
  }, [postsData])

  // Auto-select first brand if none selected
  useMemo(() => {
    if (brands.length > 0 && !selectedBrandId) {
      setSelectedBrandId(brands[0].id)
    }
  }, [brands, selectedBrandId])

  // Brand CRUD operations
  const addBrand = useCallback(async (brandData: Omit<Brand, 'id' | 'createdAt'>): Promise<Brand> => {
    try {
      setError(null)
      const brandId = await createBrandMutation({
        name: brandData.name,
        description: brandData.description || undefined,
        color: brandData.color,
        initials: brandData.initials,
        voice: brandData.voice,
        topics: brandData.topics,
        clerkId: clerkId || undefined,
      })

      // Return a temporary brand object - the real one will come from the query
      return {
        ...brandData,
        id: brandId,
        createdAt: Date.now()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create brand'
      setError(message)
      throw err
    }
  }, [createBrandMutation, clerkId])

  const updateBrand = useCallback(async (id: string, updates: Partial<Brand>) => {
    try {
      setError(null)
      await updateBrandMutation({
        id: id as Id<"brands">,
        name: updates.name,
        description: updates.description,
        color: updates.color,
        initials: updates.initials,
        voice: updates.voice,
        topics: updates.topics
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update brand'
      setError(message)
      throw err
    }
  }, [updateBrandMutation])

  const deleteBrand = useCallback(async (id: string) => {
    try {
      setError(null)
      await deleteBrandMutation({
        id: id as Id<"brands">,
        clerkId: clerkId || undefined,
      })

      // If the deleted brand was selected, select another one
      if (selectedBrandId === id) {
        const remaining = brands.filter(b => b.id !== id)
        setSelectedBrandId(remaining.length > 0 ? remaining[0].id : null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete brand'
      setError(message)
      throw err
    }
  }, [deleteBrandMutation, selectedBrandId, brands, clerkId])

  const selectBrand = useCallback((id: string | null) => {
    setSelectedBrandId(id)
  }, [])

  // Post CRUD operations
  const addPost = useCallback(async (postData: Omit<Post, 'id' | 'createdAt'>): Promise<Post> => {
    try {
      setError(null)
      const postId = await createPostMutation({
        content: postData.content,
        platform: platformToBackend(postData.platform),
        brandId: postData.brandId as Id<"brands">,
        imageUrl: postData.imageUrl,
        voiceUrl: postData.voiceUrl,
        status: statusToBackend(postData.status),
        scheduledFor: postData.scheduledFor ? new Date(postData.scheduledFor).getTime() : undefined,
        clerkId: clerkId || undefined, // Pass clerkId for auth fallback
      })

      // Return a temporary post object - the real one will come from the query
      return {
        ...postData,
        id: postId,
        createdAt: Date.now()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create post'
      setError(message)
      throw err
    }
  }, [createPostMutation, clerkId])

  const updatePost = useCallback(async (id: string, updates: Partial<Post>) => {
    try {
      setError(null)
      await updatePostMutation({
        id: id as Id<"posts">,
        content: updates.content,
        platform: updates.platform ? platformToBackend(updates.platform) : undefined,
        imageUrl: updates.imageUrl === undefined ? undefined : (updates.imageUrl || null),
        voiceUrl: updates.voiceUrl === undefined ? undefined : (updates.voiceUrl || null),
        status: updates.status ? statusToBackend(updates.status) : undefined,
        scheduledFor: updates.scheduledFor === undefined
          ? undefined
          : (updates.scheduledFor ? new Date(updates.scheduledFor).getTime() : null),
        clerkId: clerkId || undefined, // Pass clerkId for auth fallback
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update post'
      setError(message)
      throw err
    }
  }, [updatePostMutation, clerkId])

  const deletePost = useCallback(async (id: string) => {
    try {
      setError(null)
      await deletePostMutation({
        id: id as Id<"posts">,
        clerkId: clerkId || undefined, // Pass clerkId for auth fallback
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete post'
      setError(message)
      throw err
    }
  }, [deletePostMutation, clerkId])

  // Stats calculation
  const getStats = useCallback((): Stats => {
    return {
      postsScheduled: posts.filter(p => p.status === 'scheduled').length,
      postsDraft: posts.filter(p => p.status === 'draft').length,
      postsPublished: posts.filter(p => p.status === 'published').length,
      totalPosts: posts.length
    }
  }, [posts])

  // Refresh data - no-op in Convex as data is real-time
  const refreshData = useCallback(async () => {
    // Convex queries are automatically reactive
    // This function exists for API compatibility
  }, [])

  return (
    <DataContext.Provider value={{
      user,
      isLoading,
      error,
      brands,
      selectedBrandId,
      addBrand,
      updateBrand,
      deleteBrand,
      selectBrand,
      posts,
      addPost,
      updatePost,
      deletePost,
      getStats,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
