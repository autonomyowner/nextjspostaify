# CLAUDE.md - POSTAIFY Next.js Migration

This file provides guidance to Claude Code when working with the migrated Next.js codebase.

## Development Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # TypeScript check + production build
npm run start        # Start production server
npm run lint         # ESLint
npx convex dev       # Start Convex dev server (watches for changes)
npx convex deploy    # Deploy Convex functions to production
```

**Development workflow:** Run `npm run dev` and `npx convex dev` in separate terminals.

## Architecture Overview

**POSTAIFY** is a SaaS for AI-powered social media content generation, migrated from Vite to Next.js App Router.

```
/src/app/             # Next.js App Router pages
/src/components/      # React components (with 'use client' where needed)
/src/context/         # DataContext, SubscriptionContext (client components)
/src/lib/             # Utilities and config
/convex/              # Convex backend (unchanged from Vite)
```

## Next.js App Router Structure

```
src/app/
├── layout.tsx              # Root layout (Clerk + Convex providers)
├── page.tsx                # Landing page (/)
├── globals.css             # Global styles
├── sitemap.ts              # Dynamic sitemap
├── robots.ts               # Robots.txt
│
├── (auth)/                 # Auth route group
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   └── sso-callback/page.tsx
│
├── (dashboard)/            # Protected route group
│   ├── layout.tsx          # Auth check wrapper
│   ├── dashboard/page.tsx
│   ├── posts/page.tsx
│   ├── calendar/page.tsx
│   └── admin/page.tsx
│
├── (marketing)/            # Public pages
│   ├── pricing/page.tsx
│   └── roadmap/page.tsx
│
└── tools/                  # Programmatic SEO pages
    ├── page.tsx            # Tools index
    └── [slug]/             # Dynamic tool pages
        ├── page.tsx        # Server component with metadata
        └── tool-page-client.tsx  # Client component
```

## Key Differences from Vite

### 1. Client vs Server Components
- Components using React hooks, Convex hooks, or browser APIs need `'use client'`
- Context providers are client components
- Pages can be server components for SEO

### 2. Import Paths
- Use `@/` path alias for imports from `src/`
- Example: `import { Button } from '@/components/ui/button'`

### 3. Auth Pattern
- Clerk middleware handles route protection in `middleware.ts`
- Dashboard layout has additional client-side auth check
- Pass `clerkId` as fallback for Convex auth

### 4. Environment Variables
```env
# Frontend (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_CONVEX_URL=https://...

# Server-only
CLERK_SECRET_KEY=sk_...
```

## Convex Integration (Unchanged)

Backend schema, queries, mutations, and actions remain the same. Key files:
- `convex/schema.ts` - Database schema
- `convex/users.ts`, `brands.ts`, `posts.ts` - CRUD operations
- `convex/ai.ts` - Content generation via OpenRouter
- `convex/voice.ts` - ElevenLabs voiceovers
- `convex/imagesAction.ts` - Fal.ai images

## Migration Status

### Completed
- [x] Project setup with Next.js 15 + App Router
- [x] Convex backend copied
- [x] Root layout with Clerk + Convex providers
- [x] Middleware for route protection
- [x] DataContext and SubscriptionContext migrated
- [x] SEO setup (sitemap.ts, robots.ts, metadata)
- [x] Auth pages (sign-in, sign-up, sso-callback)
- [x] Dashboard page placeholders
- [x] Marketing pages (pricing, roadmap) placeholders
- [x] Programmatic SEO tool pages structure
- [x] UI components migrated (button, card, badge, accordion, calendar, logo)

### Remaining Migration Tasks
- [ ] Migrate full landing page components (Hero, ProblemSolution, HowItWorks, Footer)
- [ ] Migrate dashboard components (GenerateModal, VoiceoverModal, etc.)
- [ ] Set up i18n with react-i18next
- [ ] Configure production environment variables
- [ ] Migrate services and hooks

## SEO Features

### Programmatic SEO Pages
Tool pages at `/tools/[slug]` for YouTube converters:
- youtube-to-linkedin
- youtube-to-twitter
- youtube-to-instagram
- youtube-to-tiktok
- youtube-to-facebook

Each page includes:
- Dynamic metadata
- JSON-LD structured data (SoftwareApplication, FAQPage)
- Email capture flow
- FAQ section

### Sitemap & Robots
- `src/app/sitemap.ts` - Auto-generated sitemap
- `src/app/robots.ts` - Robots rules (disallows dashboard routes)

## Styling

Uses Tailwind CSS v4 with:
- HSL color variables (same as Vite project)
- Custom fonts: DM Sans, Syne, Noto Sans Arabic
- RTL support for Arabic
- Custom utilities: glass, glow-yellow, grid-pattern, etc.
