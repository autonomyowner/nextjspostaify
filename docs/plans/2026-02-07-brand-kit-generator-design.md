# Brand Kit Generator - Design Document

**Date:** 2026-02-07
**Feature:** AI-Powered Full Brand Identity Generator
**Goal:** Create a viral "wow factor" feature that generates $2,000+ worth of branding in 60 seconds

---

## User Experience Flow

### Input (3 fields)
1. **Brand name** - text input
2. **One-line description** - e.g. "AI-powered fitness coaching for busy professionals"
3. **Vibe selector** - pick 2-3 visual tiles from: Bold, Minimal, Playful, Luxury, Tech, Organic, Retro, Corporate, Creative, Edgy

### Generation Sequence (cinematic reveal, ~15-20 seconds)
1. Color palette swatches animate in one by one
2. Typography pair slides in with sample preview
3. Logo generates and fades in (4 variations fan out)
4. Social media templates cascade in per platform
5. Mood board images tile across
6. Mockup previews render (business card, phone, storefront)
7. Post templates appear
8. "Your brand kit is ready" with download/apply button

### Post-Generation
- Brand kit lives as a persistent page under the brand
- Export as PDF brand guidelines
- One-click apply to all future content generation
- Share via public link (watermarked "Built with Postaify")

---

## Generated Components

### 1. Color Palette (AI-generated)
- Primary color (hero color)
- Secondary color (complementary)
- Accent color (CTAs, highlights)
- Dark shade (text, backgrounds)
- Light shade (backgrounds, cards)
- Each with hex, RGB, and suggested use label

**Generation:** Claude AI analyzes brand description + vibe keywords to select harmonious colors using color theory principles. Returns JSON with hex values.

### 2. Typography Pairing
- Heading font (bold, distinctive - from Google Fonts)
- Body font (clean, readable - from Google Fonts)
- Live preview: brand name in heading font + sample paragraph in body
- Font size recommendations for social posts

**Generation:** Claude AI selects from curated Google Fonts pairings based on brand vibe. ~30 pre-vetted pairings categorized by vibe.

### 3. Logo (4 variations via Ideogram/Runware)
- Primary logo (full color, horizontal)
- Icon mark (square, works as avatar)
- Monochrome version (single color)
- Inverted version (for dark backgrounds)

**Generation:** Ideogram V2 Turbo (existing integration) with auto-generated prompts based on brand name + description + vibe + color palette.

### 4. Brand Mood Board (4 images via Runware)
- Lifestyle/aesthetic photos capturing brand vibe
- Generated with brand color influence via prompt injection
- Reusable as content assets

**Generation:** Runware Flux models. Prompts crafted from brand description + vibe. Color palette injected into prompts for consistency.

### 5. Social Media Profile Kit (per platform)
**Avatar/profile picture** (logo icon mark, properly sized):
- Instagram: 320x320
- Twitter/X: 400x400
- LinkedIn: 400x400
- Facebook: 170x170
- YouTube: 800x800
- TikTok: 200x200

**Cover/banner** (branded gradient/pattern with tagline):
- Instagram Story highlight: 1080x1920
- Twitter/X: 1500x500
- LinkedIn: 1584x396
- Facebook: 820x312
- YouTube: 2560x1440

**Generation:** Runware image generation + resize API. Banners use brand colors as gradient/pattern backgrounds with logo overlay.

### 6. Branded Post Backgrounds (6 templates via Runware)
- Textured, on-brand backgrounds per platform size
- Gradient meshes, abstract shapes, subtle patterns
- All in brand color palette
- Drag straight into post creation

**Generation:** Runware Flux with prompts like "abstract gradient mesh background in [primary] and [secondary] colors, minimal, clean, social media post background"

### 7. Mockup Previews (3 renders via Runware)
- Business card with logo
- Phone screen with logo as app icon
- Storefront/signage with logo

**Generation:** Runware Flux with prompts like "professional business card mockup on marble surface, logo: [brand name], colors: [palette], photorealistic"

### 8. Brand Pattern/Texture (1 via Runware)
- Seamless repeating pattern in brand colors
- For story backgrounds, banner fills, packaging

### 9. Brand Guidelines Summary
- One-page overview: colors, fonts, logo usage rules, tone of voice
- Downloadable as PDF
- Shareable public link

**Generation:** Auto-generated from all kit data. PDF via client-side generation (html2canvas + jsPDF or similar).

---

## Viral Loop Features

### Public Brand Kit Page
- URL: `postaify.com/brand/[brand-name]` or `postaify.com/kit/[id]`
- Beautiful showcase page displaying full kit
- Footer: "Brand identity generated in 60 seconds with Postaify"
- Visitor CTA: "Create yours free"

### Brand Kit Score
- 0-100 score for brand consistency/professionalism
- Shareable badge/card
- People love sharing scores

### Before/After
- Auto-generated comparison visual
- Social proof that markets itself

---

## Integration with Existing Features

- **Content generation** auto-uses brand fonts, colors, and tone
- **Image generation** defaults to brand color palette
- **Voice cloning** pairs with brand tone for complete identity
- **Calendar view** posts styled in brand colors
- **Export** includes brand guidelines PDF with all assets

---

## Cost Analysis

| Asset | Provider | Images | Cost per Kit |
|-------|----------|--------|-------------|
| Logo (4 variations) | Ideogram | 4 | $0.08-0.12 |
| Mood board | Runware Flux Dev | 4 | $0.015 |
| Post backgrounds | Runware Flux Dev | 6 | $0.023 |
| Mockup previews | Runware Flux Dev | 3 | $0.011 |
| Brand pattern | Runware Flux Dev | 1 | $0.004 |
| Social banners | Runware Flux Dev | 5 | $0.019 |
| AI (palette, fonts, prompts) | OpenRouter | - | $0.005 |
| **Total** | | **~23 images** | **~$0.16** |

At $0.16 per full brand kit, even FREE tier users could get one kit. Perceived value: $2,000-4,700.

---

## Plan Gating

| Feature | FREE | PRO | BUSINESS |
|---------|------|-----|----------|
| Brand kits | 1 | 3 | Unlimited |
| Logo variations | 2 | 4 | 4 |
| Mood board images | 2 | 4 | 6 |
| Post templates | 2 | 6 | 10 |
| Mockup previews | 0 | 3 | 5 |
| Public share link | No | Yes | Yes |
| PDF export | No | Yes | Yes |
| Brand pattern | No | Yes | Yes |

FREE users get enough to be impressed and share. PRO/BUSINESS get the full package.

---

## Technical Architecture

### New Convex Tables
```
brandKits:
  - userId (indexed)
  - brandId (indexed)
  - name, description, vibes (array)
  - palette: { primary, secondary, accent, dark, light } (hex values)
  - typography: { heading: { family, weight }, body: { family, weight } }
  - logos: array of { type, url, storageId }
  - moodBoard: array of { url, storageId, prompt }
  - socialProfiles: array of { platform, avatarUrl, bannerUrl }
  - postBackgrounds: array of { url, storageId, size }
  - mockups: array of { type, url, storageId }
  - pattern: { url, storageId }
  - score: number (0-100)
  - publicSlug (indexed, optional)
  - status: GENERATING | READY | FAILED
  - createdAt
```

### New Convex Actions
```
brandKit.generate       - Orchestrates full kit generation
brandKit.generatePalette    - AI color palette
brandKit.generateTypography - AI font pairing
brandKit.generateLogos      - Ideogram logo generation
brandKit.generateMoodBoard  - Runware mood board images
brandKit.generateSocialKit  - Runware social media assets
brandKit.generateMockups    - Runware mockup renders
brandKit.generateBackgrounds - Runware post backgrounds
brandKit.generatePattern    - Runware brand pattern
brandKit.calculateScore     - Brand consistency score
brandKit.publish            - Create public share link
```

### New Frontend Components
```
src/components/brand-kit/
  BrandKitModal.tsx        - Input form (name, description, vibes)
  BrandKitReveal.tsx       - Cinematic generation reveal animation
  BrandKitViewer.tsx       - Full kit display page
  BrandKitExport.tsx       - PDF export functionality
  PaletteDisplay.tsx       - Color swatch component
  TypographyPreview.tsx    - Font pairing preview
  LogoGrid.tsx             - Logo variations display
  MoodBoardGrid.tsx        - Mood board image grid
  SocialProfilePreview.tsx - Platform profile previews
  MockupCarousel.tsx       - Mockup preview carousel
  BrandScoreCard.tsx       - Score badge/card
```

### New Pages
```
src/app/(dashboard)/brand-kit/     - Brand kit management
src/app/(marketing)/kit/[slug]/    - Public brand kit page
```
