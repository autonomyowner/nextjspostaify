'use client'

import { useEffect, useRef, useState } from 'react'

interface ScenePreviewProps {
  htmlContent: string | null
}

export function ScenePreview({ htmlContent }: ScenePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!htmlContent) return

    // Revoke old blob URL
    if (blobUrl) URL.revokeObjectURL(blobUrl)

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    setBlobUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlContent])

  if (!htmlContent || !blobUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-black/20 rounded-2xl border border-white/5">
        <p className="text-xs text-white/20">Loading preview...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full p-4">
      {/* 9:16 aspect ratio container */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="relative bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          style={{
            aspectRatio: '9/16',
            maxHeight: '100%',
            maxWidth: '100%',
            width: 'auto',
            height: '100%',
          }}
        >
          <iframe
            ref={iframeRef}
            src={blobUrl}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            title="Clip Preview"
          />
        </div>
      </div>
    </div>
  )
}
