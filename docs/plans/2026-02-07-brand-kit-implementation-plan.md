# Brand Kit Generator - Implementation Plan

**Design doc:** `docs/plans/2026-02-07-brand-kit-generator-design.md`

---

## Phase 1: Backend Foundation
*Convex schema, AI palette/typography generation, core data layer*

### Step 1.1 - Schema & Types
- Add `brandKits` table to `convex/schema.ts` with all fields (palette, typography, logos, moodBoard, socialProfiles, postBackgrounds, mockups, pattern, score, publicSlug, status)
- Add indexes: `by_userId`, `by_brandId`, `by_publicSlug`
- Add `brandKitsGenerated` usage counter to `users` table
- Add plan limits for brand kits in `convex/lib/planLimits.ts`

### Step 1.2 - AI Palette Generation
- Create `convex/brandKit.ts` with `generatePalette` action
- Input: brand name, description, vibes array
- Uses OpenRouter Claude to generate harmonious 5-color palette
- Returns: `{ primary, secondary, accent, dark, light }` with hex values and use labels
- Color theory rules in prompt: complementary, analogous, or triadic based on vibe

### Step 1.3 - AI Typography Pairing
- Add `generateTypography` action to `convex/brandKit.ts`
- Curated list of ~30 Google Fonts pairings categorized by vibe (bold/minimal/playful/luxury/tech/etc.)
- AI selects best pairing based on brand description + vibe
- Returns: `{ heading: { family, weight, style }, body: { family, weight, style } }`

### Step 1.4 - Core CRUD
- Add queries: `brandKit.get`, `brandKit.getByBrandId`, `brandKit.getBySlug`
- Add mutations: `brandKit.create` (initial record with GENERATING status), `brandKit.update`, `brandKit.delete`
- Add `brandKit.updateStatus` mutation for progress tracking

---

## Phase 2: Image Generation Pipeline
*Logo, mood board, backgrounds, mockups, pattern - all via existing Runware/Ideogram integrations*

### Step 2.1 - Logo Generation
- Add `generateLogos` action
- Uses existing Ideogram V2 Turbo integration (from `imagesAction.ts`)
- Generate 4 prompts based on brand name + description + vibe + palette colors:
  - Primary logo (horizontal, full color)
  - Icon mark (square, minimal)
  - Monochrome (single color version prompt)
  - Inverted (dark background version prompt)
- Store generated images to Convex storage
- Update brandKit record with logo URLs

### Step 2.2 - Mood Board Generation
- Add `generateMoodBoard` action
- Uses existing Runware Flux integration
- Generate 4 prompts from brand description + vibe:
  - Lifestyle shot reflecting brand values
  - Product/service context image
  - Aesthetic/texture shot in brand colors
  - People/action shot matching brand energy
- Inject brand palette colors into each prompt
- Store to Convex storage, update brandKit

### Step 2.3 - Post Backgrounds
- Add `generateBackgrounds` action
- Uses Runware Flux
- 6 abstract/gradient backgrounds in brand colors
- Prompts: "abstract gradient mesh background, colors: [hex1] [hex2], minimal, clean, social media"
- Different sizes: 1080x1080, 1080x1920, 1200x675
- Store to Convex storage

### Step 2.4 - Mockup Previews
- Add `generateMockups` action
- Uses Runware Flux
- 3 mockups with brand name/logo context in prompts:
  - Business card on surface
  - Phone screen / app icon
  - Storefront / signage
- Store to Convex storage

### Step 2.5 - Brand Pattern
- Add `generatePattern` action
- Uses Runware Flux
- Prompt: "seamless repeating pattern, [vibe] style, colors: [palette], tileable texture"
- Single image, store to Convex storage

### Step 2.6 - Social Media Profile Kit
- Add `generateSocialKit` action
- Uses Runware Flux for banners (branded gradients with tagline)
- Uses existing image resize API for avatar sizing from icon mark logo
- Generate 5 banners (Twitter, LinkedIn, Facebook, YouTube, Instagram highlight)
- Resize icon mark logo to all avatar sizes
- Store all to Convex storage

---

## Phase 3: Orchestrator & Progress
*Main generation orchestrator, real-time progress updates*

### Step 3.1 - Generation Orchestrator
- Add `brandKit.generate` action - the main entry point
- Flow:
  1. Check plan limits (brand kits allowed)
  2. Create brandKit record with status: GENERATING
  3. Generate palette (Step 1.2) - fast, ~2s
  4. Generate typography (Step 1.3) - fast, ~1s
  5. Fire off parallel image generation:
     - Logos (Step 2.1)
     - Mood board (Step 2.2)
     - Post backgrounds (Step 2.3)
     - Mockups (Step 2.4)
     - Pattern (Step 2.5)
  6. Generate social kit (Step 2.6) - depends on logo icon mark
  7. Calculate brand score
  8. Update status: READY
- Use mutations for progress updates so frontend can show real-time progress

### Step 3.2 - Brand Score Calculator
- Add `calculateScore` internal function
- Score 0-100 based on:
  - Color harmony (palette contrast ratios, accessibility)
  - Typography pairing quality
  - Completeness of kit (all assets generated)
  - Vibe consistency
- Mostly deterministic calculation from the generated data

---

## Phase 4: Frontend - Input & Generation UI
*BrandKitModal, generation progress, reveal animation*

### Step 4.1 - Brand Kit Modal (Input Form)
- Create `src/components/brand-kit/BrandKitModal.tsx`
- 3-step form:
  1. Brand name input
  2. One-line description textarea
  3. Vibe selector grid (visual tiles, pick 2-3)
- "Generate Brand Kit" CTA button
- Plan limit check before generation
- Trigger `brandKit.generate` action on submit

### Step 4.2 - Generation Progress UI
- Create `src/components/brand-kit/BrandKitProgress.tsx`
- Real-time progress bar/steps showing what's generating
- Steps: Palette > Typography > Logos > Mood Board > Templates > Mockups > Finalizing
- Each step animates to "complete" as mutations fire
- Subscribe to brandKit record for live updates via Convex reactivity

### Step 4.3 - Cinematic Reveal Animation
- Create `src/components/brand-kit/BrandKitReveal.tsx`
- After all assets are READY, play reveal sequence:
  - Color swatches drop in with spring animation
  - Typography slides in with sample text
  - Logo variations fan out from center
  - Mood board tiles cascade
  - Social templates slide in per platform
  - Mockups carousel auto-plays
  - Score counter animates up to final number
  - "Your brand kit is ready" with confetti/particles
- Use CSS animations + requestAnimationFrame (no heavy library needed)
- This is the KEY viral moment - must feel premium

---

## Phase 5: Frontend - Brand Kit Viewer & Management
*Full kit display, editing, dashboard integration*

### Step 5.1 - Brand Kit Viewer Page
- Create `src/app/(dashboard)/brand-kit/page.tsx`
- Full scrollable page showing all kit components:
  - Palette section with copy-hex buttons
  - Typography section with live preview
  - Logo grid with download buttons per variation
  - Mood board gallery
  - Social profile previews (tabbed by platform)
  - Post background grid
  - Mockup carousel
  - Pattern preview with tiling demo
- "Regenerate" button per section (regenerate just logos, just mood board, etc.)
- "Apply to Brand" button - saves palette/typography to brand record

### Step 5.2 - Dashboard Integration
- Add "Brand Kit" card/button to main dashboard
- Show kit status (not created / generating / ready)
- Quick stats: "1 of 3 brand kits used"
- Link to full viewer page
- Add brand kit entry point in BrandModal too

### Step 5.3 - Brand Kit in Content Generation
- Update `GenerateModal.tsx` to show brand kit colors as reference
- Update image generation to default to brand kit palette
- Update AI prompts to reference brand typography/tone

---

## Phase 6: Export & Viral Features
*PDF export, public sharing, brand score sharing*

### Step 6.1 - PDF Brand Guidelines Export
- Create `src/components/brand-kit/BrandKitExport.tsx`
- Generate PDF client-side (html2canvas + jsPDF or @react-pdf/renderer)
- Contents: Logo usage, color palette with hex/RGB, typography specs, tone of voice
- Professional layout - this IS the shareable artifact
- PRO+ only

### Step 6.2 - Public Brand Kit Page
- Create `src/app/(marketing)/kit/[slug]/page.tsx`
- Server-rendered public page showing the brand kit
- SEO optimized (meta tags, OG image auto-generated from kit)
- Footer: "Brand identity generated in 60 seconds with Postaify"
- CTA: "Create yours free" button
- PRO+ only (toggle in kit settings)

### Step 6.3 - Brand Score Sharing
- Shareable score card image (auto-generated)
- "My brand scored 94/100 on Postaify" with brand colors
- Copy link / download image buttons
- OG meta tags for social sharing previews

---

## Phase 7: Polish & Optimization
*Performance, error handling, edge cases*

### Step 7.1 - Error Recovery
- Handle partial generation failures (retry individual steps)
- Timeout handling for image generation
- Fallback: if one mockup fails, show 2 instead of error

### Step 7.2 - Loading States
- Skeleton loaders for each kit section
- Progressive loading (show palette first since it's fastest)
- Optimistic UI updates

### Step 7.3 - Mobile Responsiveness
- Ensure reveal animation works on mobile
- Responsive kit viewer layout
- Touch-friendly vibe selector

---

## File Summary

### New Convex Files
- `convex/brandKit.ts` - All brand kit actions, queries, mutations

### Modified Convex Files
- `convex/schema.ts` - Add brandKits table
- `convex/lib/planLimits.ts` - Add brand kit limits

### New Frontend Files
```
src/components/brand-kit/
  BrandKitModal.tsx          - Input form
  BrandKitProgress.tsx       - Generation progress
  BrandKitReveal.tsx         - Cinematic reveal animation
  BrandKitViewer.tsx         - Full kit display
  BrandKitExport.tsx         - PDF export
  PaletteDisplay.tsx         - Color swatches
  TypographyPreview.tsx      - Font preview
  LogoGrid.tsx               - Logo variations
  MoodBoardGrid.tsx          - Mood board gallery
  SocialProfilePreview.tsx   - Platform previews
  MockupCarousel.tsx         - Mockup slides
  BrandScoreCard.tsx         - Score display
  VibeSelector.tsx           - Vibe tile picker
```

### New Pages
```
src/app/(dashboard)/brand-kit/page.tsx    - Kit management
src/app/(marketing)/kit/[slug]/page.tsx   - Public share page
```

### Modified Frontend Files
- `src/components/Dashboard.tsx` - Add brand kit entry point
- `src/components/BrandModal.tsx` - Add "Generate Brand Kit" button
- `src/components/GenerateModal.tsx` - Show brand kit palette reference
- `src/components/ImageGeneratorModal.tsx` - Default to brand kit colors

---

## Estimated Effort by Phase
- Phase 1 (Backend Foundation): Core schema + AI generation
- Phase 2 (Image Pipeline): Leverage existing Runware/Ideogram code
- Phase 3 (Orchestrator): Wire it all together
- Phase 4 (Input & Reveal): The wow-factor UI
- Phase 5 (Viewer & Management): Complete experience
- Phase 6 (Export & Viral): Growth loop features
- Phase 7 (Polish): Production ready
