# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # TypeScript check + production build
npm run lint         # ESLint
npx convex dev       # Start Convex dev server (run in separate terminal)
npx convex deploy    # Deploy Convex functions to production
```

**Development workflow:** Run `npm run dev` and `npx convex dev` in separate terminals.

## Architecture Overview

**POSTAIFY** is a SaaS for AI-powered social media content generation built with Next.js 15 App Router and Convex backend.

### Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4
- **Backend:** Convex (serverless DB + functions)
- **Auth:** Better-Auth with `@convex-dev/better-auth`
- **i18n:** react-i18next (en, ar, fr)

### Route Structure

```
src/app/
├── (auth)/           # Auth pages (sign-in, sign-up, sso-callback)
├── (dashboard)/      # Protected routes (dashboard, posts, calendar, admin)
├── (marketing)/      # Public pages (pricing, roadmap, terms, waitlist)
├── compare/[competitor]/  # SEO comparison pages (vs Buffer, Hootsuite, etc.)
├── tools/[slug]/     # Programmatic SEO pages (YouTube converters)
├── api/auth/[...all]/  # Better-Auth API routes
├── sitemap.ts        # Dynamic sitemap
└── robots.ts         # Robots.txt with AI bot allowlisting
```

### Convex Backend

Database tables defined in `convex/schema.ts`:
- `users` - User profiles with plan info, indexed by email
- `brands` - Brand profiles per user (with optional voiceProfile for AI voice cloning)
- `posts` - Content posts with platform, status, scheduling
- `emailCaptures` - Marketing email captures
- `chatSessions`, `botLeads` - Chatbot data

Key Convex files:
- `auth.ts` - Better-Auth integration with `getAuthenticatedAppUser()` helper
- `ai.ts` - Content generation via OpenRouter (injects voice profile if available)
- `voiceAnalysis.ts` - Voice cloning: analyze posts to extract writing style
- `voice.ts` - ElevenLabs voiceovers
- `imagesAction.ts` - Image generation (Runware for Flux, Fal.ai for Ideogram/Bria)
- `imageResize.ts` - Multi-format resize for social media sizes (Instagram, Twitter, LinkedIn, etc.)
- `images.ts` - Image model configurations
- `subscriptionsAction.ts` - Stripe integration
- `tools.ts` - Free YouTube converter tool actions

### AI Image Generation

Three modes in `ImageGeneratorModal.tsx`:

**Image Mode:** Uses Flux models with auto prompt enhancement
- Subject detection: portrait, landscape, animal, food, product, architecture
- Models: Flux Schnell (8s), Flux Dev, Flux Pro 1.1

**Logo Mode:** Uses Ideogram V2 Turbo
- Pre-built expert prompt templates (Minimal, Modern Tech, Lettermark, etc.)
- User provides: brand name + color + style

**Product Mode:** Uses Bria Product Shot API
- Upload product image, select background scene
- 10 preset scenes: Studio White, Marble, Wood, Kitchen, etc.

### Voice Cloning (Brand Voice Analyzer)

Users can paste 3-20 posts to clone any writing style. Located in `VoiceAnalyzerModal.tsx`.

**Flow:** Edit brand → "Analyze Voice" → Paste posts → AI extracts voice profile → Save

**Voice profile fields:** formality, energy, humor, directness (1-10), sentenceStyle, vocabularyLevel, emojiUsage, hashtagStyle, keyTraits, ctaPatterns

When generating content, `ai.ts` injects voice profile + sample posts into the prompt for few-shot learning.

### State Management

Two React contexts (both client components):
- `DataContext` - User, brands, posts CRUD via Convex hooks
- `SubscriptionContext` - Plan limits, feature gating

## Key Patterns

### Better-Auth Pattern

```typescript
// Frontend - use authClient hooks
import { authClient } from '@/lib/auth-client'
const { data: session, isPending } = authClient.useSession()

// Sign in/up
await authClient.signIn.email({ email, password })
await authClient.signUp.email({ email, password, name })
await authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })

// Backend (Convex) - wrap getAuthUser in try-catch (it throws when unauthenticated)
import { getAuthenticatedAppUser } from './auth'
const user = await getAuthenticatedAppUser(ctx)
if (!user) throw new Error('Unauthorized')
```

### Client vs Server Components
- Components using hooks (React, Convex, auth) need `'use client'`
- Context providers are client components
- Pages default to server components for SEO

### Case Conventions
Frontend uses Title Case, Convex uses UPPERCASE:
```typescript
// Frontend
platform: 'Instagram' | 'Twitter' | 'LinkedIn'
status: 'draft' | 'scheduled' | 'published'

// Convex
platform: 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN'
status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED'
```

Conversion helpers in `DataContext.tsx`: `platformToBackend()`, `platformFromBackend()`

### Plan Limits & Pricing
Defined in `convex/lib/planLimits.ts`:

| Feature | FREE | PRO ($19/mo) | BUSINESS ($49/mo) |
|---------|------|--------------|-------------------|
| Brands | 2 | 5 | Unlimited |
| Posts/Month | 20 | 1,000 | 90,000 |
| AI Images/Month | 5 | 200 | 1,000 |
| AI Voiceovers/Month | 2 | 30 | 150 |
| Voice Profiles | 1 | 3 | Unlimited |
| YouTube Repurpose | No | Yes | Yes |
| Logo Generation | No | Yes | Yes |
| Product Photography | No | Yes | Yes |

### Tiered Model Access
- **FREE:** FLUX.2 Klein 4B only (via Runware, $0.0006/image)
- **PRO:** FLUX.2 Klein, Flux Dev, Flux Pro 1.1, Ideogram (logos), Bria (product shots)
- **BUSINESS:** All above + Recraft V3 (premium creative model, outputs WebP only)

### Image Output Format
- All models output **PNG** (lossless) except Recraft V3 which outputs WebP
- Configured in `imagesAction.ts`: `outputFormat: "png"`, `outputQuality: 95`

### Usage Tracking
User usage tracked in `users` table:
- `postsThisMonth`, `imagesThisMonth`, `voiceoversThisMonth`
- `usageResetDate` - Monthly reset timestamp

Mutations: `users.incrementImageUsage`, `users.incrementVoiceoverUsage`, `users.resetMonthlyUsage`

## Environment Variables

```env
# Frontend (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_CONVEX_URL=https://...
NEXT_PUBLIC_CONVEX_SITE_URL=https://...convex.site

# Server-only
CONVEX_SITE_URL=https://...convex.site

# Convex Dashboard (set via npx convex env set)
BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SITE_URL
OPENROUTER_API_KEY, ELEVENLABS_API_KEY, FAL_API_KEY, RUNWARE_API_KEY, STRIPE_*
```

## Import Conventions

- Use `@/` path alias for `src/` imports: `import { Button } from '@/components/ui/button'`
- Convex API imports use relative path: `import { api } from '../../convex/_generated/api'`

## SEO Infrastructure

### JSON-LD Schema Components (`src/components/seo/`)
- `SoftwareSchema` - SoftwareApplication structured data
- `FAQSchema` - FAQPage structured data
- `OrganizationSchema` - Organization structured data

### Comparison Pages (`/compare/[competitor]`)
Competitor data in `src/lib/competitors-config.ts`:
- Buffer, Hootsuite, Jasper, Midjourney, Taplio
- Each with: pricing, pros/cons, feature comparison, FAQs

### AI Bot Allowlisting (`robots.ts`)
Explicitly allows: GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, etc.

## API Cost Reference
| Feature | Provider | Cost |
|---------|----------|------|
| Image (FLUX.2 Klein 4B) | Runware | $0.0006 |
| Image (Flux Dev) | Runware | $0.0038 |
| Image (Flux Pro 1.1) | Runware | $0.0038 |
| Image (Recraft V3) | Runware | $0.005 |
| Logo (Ideogram) | Fal.ai | $0.02-0.03 |
| Product Shot (Bria) | Fal.ai | $0.04 |
| Voiceover (ElevenLabs) | ElevenLabs | ~$0.015/clip |
| AI Content (OpenRouter) | OpenRouter | ~$0.001/post |

**Hybrid Provider Strategy:** Runware for Flux models (93% savings vs Fal.ai), Fal.ai for Ideogram/Bria.

**Runware Model IDs:**
- FLUX.2 Klein 4B: `runware:400@4` (FREE tier)
- Flux Dev: `runware:101@1`
- Flux Pro 1.1: `civitai:618692@691639`
- Recraft V3: `runware:2@1`
