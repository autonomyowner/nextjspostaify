'use client'

import { useQuery } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'
import { Id } from '../../../../../../convex/_generated/dataModel'
import { ClipEditor } from '@/components/dashboard/clips/ClipEditor'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ClipEditorPage() {
  const params = useParams()
  const clipId = params.id as string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clip = (useQuery as any)((api as any).clips?.getById, clipId ? { id: clipId as Id<"clips"> } : "skip")

  if (clip === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
          <span className="text-sm text-white/40">Loading clip...</span>
        </div>
      </div>
    )
  }

  if (clip === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 text-sm mb-4">Clip not found or unauthorized.</p>
          <Link
            href="/clips"
            className="text-xs text-yellow-400/70 hover:text-yellow-400 transition-colors"
          >
            Back to Clips
          </Link>
        </div>
      </div>
    )
  }

  return <ClipEditor clip={clip} />
}
