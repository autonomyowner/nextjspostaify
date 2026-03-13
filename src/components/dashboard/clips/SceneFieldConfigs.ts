// Field configuration for each scene type in the clip editor

export type FieldType = 'text' | 'textarea' | 'list' | 'stats' | 'number'

export interface FieldConfig {
  key: string
  label: string
  type: FieldType
  placeholder?: string
}

export const SCENE_FIELD_CONFIGS: Record<string, FieldConfig[]> = {
  hook: [
    { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Your hook headline...' },
    { key: 'subheadline', label: 'Subheadline', type: 'text', placeholder: 'Supporting text...' },
  ],
  brand: [
    { key: 'brandName', label: 'Brand Name', type: 'text', placeholder: 'POSTAIFY' },
    { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'AI-Powered Content' },
  ],
  features: [
    { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Key Features' },
    { key: 'features', label: 'Features', type: 'list', placeholder: 'Add a feature...' },
  ],
  demo: [
    { key: 'demoTitle', label: 'Demo Title', type: 'text', placeholder: 'Product Demo' },
    { key: 'headline', label: 'Headline', type: 'text', placeholder: 'See it in action' },
    { key: 'demoSteps', label: 'Steps', type: 'list', placeholder: 'Add a step...' },
  ],
  transformation: [
    { key: 'headline', label: 'Headline', type: 'text', placeholder: 'The Transformation' },
    { key: 'before', label: 'Before', type: 'text', placeholder: '8+ hours of work' },
    { key: 'after', label: 'After', type: 'text', placeholder: '5 minutes' },
    { key: 'beforeLabel', label: 'Before Label', type: 'text', placeholder: 'BEFORE' },
    { key: 'afterLabel', label: 'After Label', type: 'text', placeholder: 'AFTER' },
  ],
  stats: [
    { key: 'headline', label: 'Headline', type: 'text', placeholder: 'By the Numbers' },
    { key: 'stats', label: 'Stats', type: 'stats', placeholder: 'Add a stat...' },
  ],
  comparison: [
    { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Why Switch?' },
    { key: 'problems', label: 'Problems', type: 'list', placeholder: 'Add a problem...' },
    { key: 'solutions', label: 'Solutions', type: 'list', placeholder: 'Add a solution...' },
  ],
  cta: [
    { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Get Started Today' },
    { key: 'subheadline', label: 'Subheadline', type: 'text', placeholder: 'Join thousands...' },
    { key: 'ctaText', label: 'Button Text', type: 'text', placeholder: 'Start Free' },
    { key: 'url', label: 'URL', type: 'text', placeholder: 'https://...' },
  ],
  montage: [
    { key: 'montageItems', label: 'Flash Items', type: 'list', placeholder: 'Add a flash text...' },
  ],
  narrative: [
    { key: 'text', label: 'Narrative Text', type: 'textarea', placeholder: 'Tell your story...' },
    { key: 'mood', label: 'Mood', type: 'text', placeholder: 'reflective, bold, urgent...' },
  ],
  quote: [
    { key: 'quote', label: 'Quote', type: 'textarea', placeholder: '"The best creators..."' },
    { key: 'author', label: 'Author', type: 'text', placeholder: 'John Doe' },
    { key: 'source', label: 'Source', type: 'text', placeholder: 'Forbes, 2024' },
  ],
  chapter: [
    { key: 'chapterNumber', label: 'Chapter #', type: 'number', placeholder: '1' },
    { key: 'chapterTitle', label: 'Chapter Title', type: 'text', placeholder: 'The Problem' },
  ],
  reveal: [
    { key: 'revealText', label: 'Reveal Text', type: 'text', placeholder: 'The big reveal...' },
    { key: 'subtext', label: 'Subtext', type: 'text', placeholder: 'Supporting detail...' },
  ],
  tip: [
    { key: 'tipNumber', label: 'Tip #', type: 'number', placeholder: '1' },
    { key: 'tipTitle', label: 'Tip Title', type: 'text', placeholder: 'Use AI automation' },
    { key: 'tipBody', label: 'Tip Body', type: 'textarea', placeholder: 'Explain the tip...' },
  ],
  listicle: [
    { key: 'headline', label: 'Headline', type: 'text', placeholder: '5 Reasons Why...' },
    { key: 'items', label: 'Items', type: 'list', placeholder: 'Add an item...' },
  ],
}

export const SCENE_TYPE_INFO: Record<string, { label: string; description: string }> = {
  hook: { label: 'Hook', description: 'Attention-grabbing opening' },
  brand: { label: 'Brand', description: 'Logo and tagline reveal' },
  features: { label: 'Features', description: 'Feature list showcase' },
  demo: { label: 'Demo', description: 'Step-by-step product demo' },
  transformation: { label: 'Transform', description: 'Before/after comparison' },
  stats: { label: 'Stats', description: 'Numbers and metrics' },
  comparison: { label: 'Compare', description: 'Problems vs solutions' },
  cta: { label: 'CTA', description: 'Call to action ending' },
  narrative: { label: 'Narrative', description: 'Storytelling text block' },
  quote: { label: 'Quote', description: 'Inspirational quote' },
  chapter: { label: 'Chapter', description: 'Chapter title card' },
  reveal: { label: 'Reveal', description: 'Dramatic text reveal' },
  tip: { label: 'Tip', description: 'Educational tip card' },
  listicle: { label: 'Listicle', description: 'Numbered list items' },
}

export const TRANSITION_OPTIONS = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide-left', label: 'Slide L' },
  { value: 'slide-right', label: 'Slide R' },
  { value: 'zoom-in', label: 'Zoom In' },
  { value: 'zoom-out', label: 'Zoom Out' },
  { value: 'blur', label: 'Blur' },
  { value: 'flip', label: 'Flip' },
] as const

// Get a text preview for a scene (used in timeline cards)
export function getScenePreview(scene: Record<string, unknown>): string {
  const type = scene.type as string
  switch (type) {
    case 'hook': return (scene.headline as string) || 'Hook scene'
    case 'brand': return (scene.brandName as string) || 'Brand scene'
    case 'features': return (scene.headline as string) || 'Features'
    case 'demo': return (scene.demoTitle as string) || (scene.headline as string) || 'Demo'
    case 'transformation': return (scene.headline as string) || 'Transformation'
    case 'stats': return (scene.headline as string) || 'Stats'
    case 'comparison': return (scene.headline as string) || 'Comparison'
    case 'cta': return (scene.headline as string) || 'Call to Action'
    case 'narrative': return ((scene.text as string) || 'Narrative').slice(0, 50)
    case 'quote': return ((scene.quote as string) || 'Quote').slice(0, 50)
    case 'chapter': return `Ch ${scene.chapterNumber || '?'}: ${(scene.chapterTitle as string) || ''}`
    case 'reveal': return (scene.revealText as string) || 'Reveal'
    case 'tip': return `Tip ${scene.tipNumber || '?'}: ${(scene.tipTitle as string) || ''}`
    case 'listicle': return (scene.headline as string) || 'List'
    case 'montage': return 'Montage'
    default: return type
  }
}

// Default scene data for newly created scenes
export function createDefaultScene(type: string): Record<string, unknown> {
  const base: Record<string, unknown> = { type }
  switch (type) {
    case 'hook': return { ...base, headline: 'Your Hook Here', subheadline: 'Supporting text' }
    case 'brand': return { ...base, brandName: 'Brand Name', tagline: 'Your tagline' }
    case 'features': return { ...base, headline: 'Key Features', features: ['Feature 1', 'Feature 2', 'Feature 3'] }
    case 'demo': return { ...base, demoTitle: 'Product Demo', headline: 'See it in action', demoSteps: ['Step 1', 'Step 2'] }
    case 'transformation': return { ...base, headline: 'The Transformation', before: 'Before', after: 'After', beforeLabel: 'BEFORE', afterLabel: 'AFTER' }
    case 'stats': return { ...base, headline: 'By the Numbers', stats: [{ value: '100+', label: 'Users' }] }
    case 'comparison': return { ...base, headline: 'Why Switch?', problems: ['Problem 1'], solutions: ['Solution 1'] }
    case 'cta': return { ...base, headline: 'Get Started', subheadline: 'Join today', ctaText: 'Start Free', url: 'https://example.com' }
    case 'narrative': return { ...base, text: 'Your story here...', mood: 'reflective' }
    case 'quote': return { ...base, quote: 'Your inspiring quote here.', author: 'Author Name' }
    case 'chapter': return { ...base, chapterNumber: 1, chapterTitle: 'Chapter Title' }
    case 'reveal': return { ...base, revealText: 'The Big Reveal', subtext: 'Supporting detail' }
    case 'tip': return { ...base, tipNumber: 1, tipTitle: 'Tip Title', tipBody: 'Explain the tip...' }
    case 'listicle': return { ...base, headline: 'Top Items', items: ['Item 1', 'Item 2', 'Item 3'] }
    default: return { ...base, headline: 'New Scene' }
  }
}
