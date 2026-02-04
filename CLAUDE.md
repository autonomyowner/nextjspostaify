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
- **Auth:** Clerk with Next.js middleware
- **i18n:** react-i18next (en, ar, fr)

### Route Structure

```
src/app/
├── (auth)/           # Auth pages (sign-in, sign-up, sso-callback)
├── (dashboard)/      # Protected routes (dashboard, posts, calendar, admin)
├── (marketing)/      # Public pages (pricing, roadmap)
├── tools/[slug]/     # Programmatic SEO pages (YouTube converters)
├── sitemap.ts        # Dynamic sitemap
└── robots.ts         # Robots.txt
```

Route protection is handled by Clerk middleware in `middleware.ts`.

### Convex Backend

Database tables defined in `convex/schema.ts`:
- `users` - User profiles with plan info, indexed by clerkId
- `brands` - Brand profiles per user
- `posts` - Content posts with platform, status, scheduling
- `emailCaptures` - Marketing email captures
- `chatSessions`, `botLeads` - Chatbot data

Key Convex files:
- `ai.ts` - Content generation via OpenRouter
- `voice.ts` - ElevenLabs voiceovers
- `imagesAction.ts` - Fal.ai image generation (Flux + Ideogram)
- `images.ts` - Image model configurations
- `subscriptionsAction.ts` - Stripe integration
- `tools.ts` - Free YouTube converter tool actions

### AI Image Generation

Three modes in `ImageGeneratorModal.tsx`:

**Image Mode:** Uses Flux models with auto prompt enhancement
- Simple prompts auto-enhanced with quality, lighting, subject-specific terms
- Subject detection: portrait, landscape, animal, food, product, architecture

**Logo Mode:** Uses Ideogram models (optimized for logos/text)
- Pre-built expert prompt templates (Minimal, Modern Tech, Lettermark, etc.)
- User provides: brand name + color + style
- System builds professional prompt automatically

**Product Mode:** Uses Bria Product Shot API (for e-commerce)
- Upload product image, select background scene
- 10 preset scenes: Studio White, Marble, Wood, Kitchen, Living Room, Nature, etc.
- Optional custom scene prompt for additional details
- No studio/camera needed - AI places product in professional scenes

Models configured in `convex/images.ts`:
- `fal-ai/flux/schnell` - Fast image generation
- `fal-ai/ideogram/v2/turbo` - Fast logo generation (default for logos)
- `fal-ai/bria/product-shot` - Product photography (e-commerce)

### State Management

Two React contexts (both client components):
- `DataContext` - User, brands, posts CRUD via Convex hooks
- `SubscriptionContext` - Plan limits, feature gating

## Key Patterns

### Client vs Server Components
- Components using hooks (React, Convex, Clerk) need `'use client'`
- Context providers are client components
- Pages default to server components for SEO

### Auth Pattern with Convex
Clerk JWT tokens don't always work with Convex auth. Use clerkId fallback:

```typescript
// Backend (Convex)
const identity = await ctx.auth.getUserIdentity();
const userClerkId = identity?.subject || args.clerkId;

// Frontend - pass clerkId explicitly
const { user } = useUser()
await someAction({ ...data, clerkId: user?.id })
```

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
| AI Images/Month | 5 | 100 | 500 |
| AI Voiceovers/Month | 2 | 30 | 150 |
| YouTube Repurpose | No | Yes | Yes |

**Pricing Strategy:** $19/mo kept as sweet spot for solopreneurs. 90%+ users are light/medium = excellent margins.

### Usage Tracking
User usage tracked in `convex/schema.ts` users table:
- `postsThisMonth` - Content posts created
- `imagesThisMonth` - AI images generated
- `voiceoversThisMonth` - AI voiceovers generated
- `usageResetDate` - Monthly reset timestamp

**Mutations for tracking:**
- `users.incrementImageUsage` - Called after successful image generation
- `users.incrementVoiceoverUsage` - Called after successful voiceover generation
- `users.resetMonthlyUsage` - Resets all counters (cron job)

**Usage Warning UI:** `src/components/ui/UsageWarning.tsx`
- Shows warning at 80% usage (yellow)
- Shows error at 100% usage (red)
- Displays in ImageGeneratorModal and VoiceoverModal

## Environment Variables

```env
# Frontend (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_CONVEX_URL=https://...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Server-only
CLERK_SECRET_KEY=sk_...

# Convex Dashboard (set there, not in .env)
OPENROUTER_API_KEY, ELEVENLABS_API_KEY, FAL_API_KEY, STRIPE_*
```

## Import Conventions

- Use `@/` path alias for `src/` imports: `import { Button } from '@/components/ui/button'`
- Convex API imports use relative path: `import { api } from '../../convex/_generated/api'`

## Marketing Pages

### Waitlist Campaign (`/waitlist`)
Early-bird signup page with:
- **50% off for 3 months** ($9.50/mo instead of $19)
- First 100 spots urgency counter
- Email capture to `emailCaptures` table with source: `waitlist-early-bird`
- Success state with share/invite functionality

### Terms of Service (`/terms`)
Legal page with:
- Fair use policy for AI features
- Usage limits table
- Prohibited uses (bulk automation, reselling, multiple accounts)
- Soft limits explanation

### Pricing (`/pricing` or `/#pricing`)
- Value stack comparison (vs Jasper, Midjourney, ElevenLabs, Buffer)
- Feature comparison table with actual limits
- Monthly/yearly toggle with 20% savings

## API Cost Reference (for pricing decisions)
| Feature | Cost to POSTAIFY |
|---------|------------------|
| Image (Flux Schnell) | $0.008-0.012 |
| Logo (Ideogram) | $0.02-0.03 |
| Product Shot (Bria) | $0.04 |
| Voiceover (ElevenLabs) | ~$0.015/clip |
| AI Content (OpenRouter) | ~$0.001/post |

**Pro Plan Economics:** Light user (~$0.50 cost) = 97% margin. Heavy user (~$8 cost) = 58% margin.
