import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'See what features are coming next to POSTAIFY. Our transparent roadmap shows planned improvements and new capabilities.',
}

// Note: This is a placeholder - migrate RoadmapPage from the Vite project

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Product Roadmap
          </h1>
          <p className="text-xl text-muted-foreground">
            What we're building next
          </p>
        </div>

        <div className="space-y-8">
          {/* Completed */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-green-400 mb-4">Completed</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>AI content generation</li>
              <li>Multi-platform support</li>
              <li>Brand management</li>
              <li>Content scheduling</li>
              <li>AI voiceover generation</li>
              <li>AI image generation</li>
            </ul>
          </div>

          {/* In Progress */}
          <div className="bg-card rounded-xl p-6 border border-primary">
            <h2 className="text-lg font-semibold text-primary mb-4">In Progress</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>Telegram bot integration</li>
              <li>Video repurposing tools</li>
              <li>Analytics dashboard</li>
            </ul>
          </div>

          {/* Planned */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-muted-foreground mb-4">Planned</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>Team collaboration</li>
              <li>API access</li>
              <li>Custom AI training</li>
              <li>Direct publishing to platforms</li>
            </ul>
          </div>
        </div>

        <p className="mt-12 text-sm text-muted-foreground text-center">
          Migrate the full RoadmapPage component from src/pages/RoadmapPage.tsx
        </p>
      </div>
    </div>
  )
}
