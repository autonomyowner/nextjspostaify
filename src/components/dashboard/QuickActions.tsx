'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface QuickActionsProps {
  onGenerateContent: () => void
  onAddBrand: () => void
  onRepurpose?: () => void
  onVoiceover?: () => void
  onGenerateImage?: () => void
  onBrandKit?: () => void
}

export function QuickActions({ onGenerateContent, onAddBrand, onRepurpose, onVoiceover, onGenerateImage, onBrandKit }: QuickActionsProps) {
  const actions = [
    {
      id: 'generate',
      title: 'Generate Content',
      description: "Create new posts with AI",
      buttonText: "Start Creating",
      primary: true,
      gradient: "from-primary/20 to-yellow-500/20"
    },
    {
      id: 'brand-kit',
      title: 'Brand Kit',
      description: 'AI brand identity in 60s',
      buttonText: 'Generate Kit',
      primary: false,
      gradient: "from-violet-500/10 to-fuchsia-500/10"
    },
    {
      id: 'image',
      title: "Generate Image",
      description: "Create AI images with Flux & SDXL",
      buttonText: "Create Image",
      primary: false,
      gradient: "from-orange-500/10 to-amber-500/10"
    },
    {
      id: 'voiceover',
      title: 'AI Voiceover',
      description: 'Generate professional voiceovers',
      buttonText: 'Create Voiceover',
      primary: false,
      gradient: "from-yellow-500/10 to-amber-500/10"
    },
    {
      id: 'repurpose',
      title: 'Repurpose Video',
      description: 'Turn videos into multiple posts',
      buttonText: 'Upload Video',
      primary: false,
      gradient: "from-red-500/10 to-orange-500/10"
    },
    {
      id: 'brand',
      title: 'Create Brand',
      description: "Add a new brand profile",
      buttonText: "Add Brand",
      primary: false,
      gradient: "from-blue-500/10 to-cyan-500/10"
    }
  ]

  const handleClick = (actionId: string) => {
    switch (actionId) {
      case 'generate':
        onGenerateContent()
        break
      case 'brand':
        onAddBrand()
        break
      case 'voiceover':
        onVoiceover?.()
        break
      case 'repurpose':
        onRepurpose?.()
        break
      case 'image':
        onGenerateImage?.()
        break
      case 'brand-kit':
        onBrandKit?.()
        break
    }
  }

  return (
    <div className="overflow-hidden">
      <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Actions</h2>
      <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-6 sm:overflow-visible">
        {actions.map((action) => (
          <Card
            key={action.id}
            className={`p-2.5 sm:p-5 bg-gradient-to-br ${action.gradient} border-white/10 hover:border-white/20 transition-all cursor-pointer group min-w-[120px] sm:min-w-0 flex-shrink-0 sm:flex-shrink`}
            onClick={() => handleClick(action.id)}
          >
            <h3 className="font-medium text-xs sm:text-base mb-0.5 sm:mb-1 group-hover:text-primary transition-colors truncate">
              {action.title}
            </h3>
            <p className="text-[10px] sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-2">
              {action.description}
            </p>
            <Button
              variant={action.primary ? "default" : "outline"}
              size="sm"
              className="w-full text-[10px] sm:text-sm h-6 sm:h-8"
              onClick={(e) => {
                e.stopPropagation()
                handleClick(action.id)
              }}
            >
              {action.buttonText}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
