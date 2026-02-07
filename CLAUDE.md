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

**Development workflow:** Run `npm run dev` and `npx convex dev` in separate terminals. Convex dev server auto-regenerates types when backend files change.

**No test framework** is configured. Playwright is installed for MCP browser automation only, not E2E testing.

## Architecture Overview

**POSTAIFY** is a SaaS for AI-powered social media content generation built with Next.js 15 App Router and Convex backend.

### Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4
- **Backend:** Convex (serverless DB + functions)
- **Auth:** Better-Auth with `@convex-dev/better-auth`
- **i18n:** react-i18next (en, ar, fr)
- **UI:** Radix UI primitives, Framer Motion, Recharts

### Route Structure

```
src/app/
├── layout.tsx              # Root: fonts only (next/font), no providers
├── (auth)/                 # Auth pages (sign-in, sign-up) - no providers needed
├── (dashboard)/            # Protected routes - ALL providers (Convex, i18n, Data, Subscription)
│   └── layout.tsx          # Wraps: ConvexClientProvider → I18nProvider → DashboardAuthGuard → DataProvider → SubscriptionProvider
├── (marketing)/            # Public pages - LIGHT providers (Convex, i18n only)
│   ├── layout.tsx          # ConvexClientProvider + I18nProvider only
│   ├── page.tsx            # Landing page
│   ├── pricing/
│   ├── blog/               # SEO blog articles (TS data, no MDX)
│   ├── blog/[slug]/        # Individual blog posts with Article schema
│   ├── tools/[slug]/       # Free YouTube converter tools (rate-limited)
│   ├── compare/[competitor]/ # SEO comparison pages (11 competitors)
│   └── youtube-summary/
├── api/auth/[...all]/      # Better-Auth API routes
├── sitemap.ts
└── robots.ts               # Allows AI bots (GPTBot, ClaudeBot, etc.)
```

**Provider Architecture:** Providers are split by route group for performance:
- Marketing pages don't load `DataProvider` or `SubscriptionProvider`
- Dashboard pages get all 4 providers with auth guard
- Auth pages use `authClient` directly (no Convex providers needed)
- **Important:** Marketing page components must NOT use `useData()` or `useSubscription()` hooks

### Convex Backend

**Convex file conventions:**
- Files with `"use node"` directive at top can ONLY contain `action()` functions (no queries/mutations)
- Files without `"use node"` contain `query()` and `mutation()` functions
- When a feature needs both, split into two files (e.g., `brandKit.ts` + `brandKitActions.ts`)

Database tables defined in `convex/schema.ts`:

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `users` | User profiles with plan info, usage tracking | `email`, `by_stripeCustomerId`, `by_telegramChatId` |
| `brands` | Brand profiles per user (with optional voiceProfile) | `by_userId` |
| `brandKits` | AI-generated full brand identities | `by_userId`, `by_brandId`, `by_publicSlug` |
| `posts` | Content posts with platform, status, scheduling | `by_userId`, `by_brandId`, `by_userId_status`, `by_status_scheduledFor` |
| `emailCaptures` | Marketing email captures | `by_email` |
| `chatSessions` | Chatbot conversation sessions | `by_sessionId`, `by_email` |
| `botLeads` | Email captures from chatbot | `by_email`, `by_capturedAt` |
| `toolRateLimits` | IP-based rate limiting for free tools (3/hr) | `by_ip_tool` |
| `featureClicks` | Conversion analytics for upsells | `by_feature` |

Key Convex files:

| File | Purpose |
|------|---------|
| `auth.ts` | Better-Auth integration, `getAuthenticatedAppUser()` helper |
| `ai.ts` | Content generation via OpenRouter (injects voice profile if available) |
| `brandKit.ts` | Brand kit queries/mutations (NO "use node") |
| `brandKitActions.ts` | Brand kit generation orchestrator action ("use node") |
| `imagesAction.ts` | Image generation (Runware for Flux, Fal.ai for Ideogram/Bria) |
| `imageResize.ts` | Multi-format resize for social media sizes |
| `images.ts` | Image model configurations |
| `voice.ts` | ElevenLabs voiceovers |
| `voiceAnalysis.ts` | Voice cloning: analyze posts to extract writing style |
| `subscriptionsAction.ts` | Stripe integration |
| `tools.ts` | Free YouTube converter tool actions (rate-limited) |
| `admin.ts` | Admin dashboard actions (token-based auth) |
| `internal.ts` | Internal queries for admin data |
| `telegram.ts` / `telegramAction.ts` | Telegram bot integration |
| `chatbot.ts` / `chatbotAction.ts` | Website chatbot |
| `emails.ts` | Email capture mutations |
| `lib/planLimits.ts` | Plan tier definitions and limits |

### AI Image Generation

Three modes in `ImageGeneratorModal.tsx`:

**Image Mode:** Uses Flux models with auto prompt enhancement
- Subject detection: portrait, landscape, animal, food, product, architecture
- Models: Flux Schnell (8s), Flux Dev, Flux Pro 1.1

**Logo Mode:** Uses Ideogram V2 Turbo via Fal.ai
- Pre-built expert prompt templates (Minimal, Modern Tech, Lettermark, etc.)

**Product Mode:** Uses Bria Product Shot API via Fal.ai
- Upload product image, select background scene

### Brand Kit Generator

Full AI-generated brand identity. 8-step generation in `brandKitActions.ts`:
1. Color palette (5 colors via AI/OpenRouter)
2. Typography (24 curated Google Font pairings matched by vibes)
3. Logo variations (primary, icon, monochrome, inverted via Ideogram)
4. Mood board images (via Runware)
5. Post backgrounds (multiple sizes: 1080x1080, 1080x1920, 1200x675)
6. Mockups (business card, phone, storefront, laptop, packaging) - PRO+ only
7. Social media banners (Twitter, LinkedIn, Facebook, YouTube)
8. Brand pattern (seamless repeating) - PRO+ only

Cost per kit: ~$0.06 (FREE), ~$0.16 (PRO), ~$0.20 (BUSINESS)

Frontend components in `src/components/dashboard/brand-kit/`:
- `BrandKitModal.tsx` - Input form (name, description, vibes) + generation progress + reveal
- `BrandKitReveal.tsx` - Cinematic staggered reveal of all assets

Full viewer page: `src/app/(dashboard)/brand-kit/page.tsx`

### Voice Cloning (Brand Voice Analyzer)

Users paste 3-20 posts to clone writing style. Located in `VoiceAnalyzerModal.tsx`.

**Flow:** Edit brand → "Analyze Voice" → Paste posts → AI extracts voice profile → Save

When generating content, `ai.ts` injects voice profile + sample posts into the prompt for few-shot learning.

### State Management

Two React contexts (dashboard-only, both client components):
- `DataContext` - User, brands, posts CRUD via Convex hooks
- `SubscriptionContext` - Plan limits, feature gating

## Key Patterns

### Tailwind CSS v4 Configuration
Uses Tailwind v4 with `@theme inline` directive in `src/app/globals.css` — there is NO `tailwind.config.ts` file. PostCSS plugin: `@tailwindcss/postcss`.

Brand colors: Primary yellow (#FACC15), dark theme throughout. RTL support for Arabic.

### Font Loading (Performance Critical)
Fonts loaded via `next/font/google` in root `layout.tsx` — NOT via CSS `@import`:
```typescript
import { DM_Sans, Syne, Noto_Sans_Arabic } from 'next/font/google'
```
CSS uses variables: `var(--font-dm-sans)`, `var(--font-syne)`, `var(--font-noto-arabic)`. Never add `@import url('fonts.googleapis.com')` to CSS.

### Better-Auth Pattern

```typescript
// Frontend
import { authClient } from '@/lib/auth-client'
const { data: session, isPending } = authClient.useSession()
await authClient.signIn.email({ email, password })
await authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })

// Backend (Convex) - wrap getAuthUser in try-catch (it THROWS when unauthenticated)
import { getAuthenticatedAppUser } from './auth'
const user = await getAuthenticatedAppUser(ctx)
if (!user) throw new Error('Unauthorized')
```

### Convex "use node" Constraint
Files with `"use node"` at the top can ONLY export `action()` functions. If you need queries/mutations alongside an action, split into two files. Example: `brandKit.ts` (queries/mutations) + `brandKitActions.ts` (action with "use node").

### Case Conventions
Frontend uses Title Case, Convex uses UPPERCASE:
```typescript
// Frontend: 'Instagram' | 'Twitter' | 'LinkedIn'
// Convex:   'INSTAGRAM' | 'TWITTER' | 'LINKEDIN'
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
| Brand Kits | 1 | 3 | 999 |
| Brand Kit Logos | 2 | 4 | 4 |
| Brand Kit Mood Images | 2 | 4 | 6 |
| Brand Kit Templates | 2 | 6 | 10 |
| Brand Kit Mockups | 0 | 3 | 5 |
| YouTube Repurpose | No | Yes | Yes |
| Logo Generation | No | Yes | Yes |
| Product Photography | No | Yes | Yes |
| Brand Kit Export/Share | No | Yes | Yes |

### Tiered Model Access
- **FREE:** FLUX.2 Klein 4B only (via Runware, $0.0006/image)
- **PRO:** FLUX.2 Klein, Flux Dev, Flux Pro 1.1, Ideogram (logos), Bria (product shots)
- **BUSINESS:** All above + Recraft V3 (premium creative model, outputs WebP only)

### Usage Tracking
User usage tracked in `users` table: `postsThisMonth`, `imagesThisMonth`, `voiceoversThisMonth`, `usageResetDate`, `brandKitsGenerated`

### Dashboard Modal Pattern
Dashboard modals follow: `isOpen` state + `onClose` handler in `Dashboard.tsx`. QuickActions grid accepts callbacks and renders as horizontal scroll on mobile, grid on desktop.

## Import Conventions

- Use `@/` path alias for `src/` imports: `import { Button } from '@/components/ui/button'`
- Convex API imports use relative path from frontend: `import { api } from '../../convex/_generated/api'`
- Convex internal imports: `import { api } from "./_generated/api"`

## Environment Variables

```env
# Frontend (NEXT_PUBLIC_ prefix) - set in Vercel
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://...convex.site
CONVEX_SITE_URL=https://...convex.site

# Convex Dashboard (set via `npx convex env set`)
BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SITE_URL
OPENROUTER_API_KEY, ELEVENLABS_API_KEY, FAL_API_KEY, RUNWARE_API_KEY
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRO_PRICE_ID, STRIPE_BUSINESS_PRICE_ID
ADMIN_USERNAME, ADMIN_PASSWORD
```

## API Cost Reference
| Feature | Provider | Cost |
|---------|----------|------|
| Image (FLUX.2 Klein 4B) | Runware | $0.0006 |
| Image (Flux Dev) | Runware | $0.0038 |
| Image (Flux Pro 1.1) | Runware | $0.0038 |
| Image (Recraft V3) | Runware | $0.005 |
| Logo (Ideogram V2 Turbo) | Fal.ai | $0.02-0.03 |
| Product Shot (Bria) | Fal.ai | $0.04 |
| Voiceover (ElevenLabs) | ElevenLabs | ~$0.015/clip |
| AI Content (OpenRouter/Haiku) | OpenRouter | ~$0.001/post |

**Hybrid Provider Strategy:** Runware for Flux models (93% savings vs Fal.ai), Fal.ai for Ideogram/Bria.

**Runware Model IDs:** `runware:400@4` (Klein, FREE), `runware:101@1` (Dev), `civitai:618692@691639` (Pro 1.1), `runware:2@1` (Recraft V3)

## SEO & AEO Infrastructure

**Canonical domain:** `https://postaify.com` (no www). All URLs, sitemaps, and schemas use this.

- JSON-LD schemas: Organization, SoftwareApplication, FAQPage, BreadcrumbList, HowTo, AggregateOffer, Blog, BlogPosting
- Schema components in `src/components/seo/`: `SoftwareSchema`, `OrganizationSchema`
- Comparison pages (`/compare/[competitor]`) with data in `src/lib/competitors-config.ts` (11 competitors)
- Blog posts in `src/lib/blog-posts.ts` (pure TS data, no MDX dependency)
- AI bot allowlisting in `robots.ts` (GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, etc.)
- Free YouTube converter tools at `/tools/[slug]` serve as SEO entry points with rate limiting (3/hr per IP)
- "What is POSTAIFY?" entity definition section on homepage (`WhatIsPostaify.tsx`) for AEO
- Custom 404 page at `src/app/not-found.tsx`

## Remote Image Domains
Configured in `next.config.ts`: `img.clerk.com` (legacy), `*.convex.cloud`, `fal.media`
