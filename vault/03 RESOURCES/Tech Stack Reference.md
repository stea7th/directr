---
type: resource
created: 2026-07-13
tags: [directr, stack]
---

# Tech Stack Reference

Quick reference for the Directr stack. Keep this current — it's what Claude reads first when helping with product work.

## App (repo: stea7th/directr)
- **Framework**: Next.js 15 (App Router), React 18, TypeScript
- **Auth/DB/Storage**: Supabase (`@supabase/ssr`, auth callback at `/auth/callback`)
- **Payments**: Stripe — checkout at `/api/checkout`, webhooks at `/api/stripe/webhook` and `/api/webhooks/stripe`
- **AI**: OpenAI via `src/app/lib/ai.ts` — `generateClipIdeas()` powers the generate flow
- **Gating**: lock/waitlist flow at `/lock`

## Worker (`worker/main.py`)
- Python, polls Supabase for jobs every `POLL_SECONDS` (default 3s)
- **Transcription**: Deepgram
- **Encode**: ffmpeg → 720x1280, CRF 23, 128k audio (deliberately compressed from 1080/CRF 20 to save storage)
- Storage bucket: `videos` (signed URLs, 1h)

## Key routes
- `/api/generate` — hook/clip generation
- `/api/jobs`, `/jobs/[id]` — clip job lifecycle
- `/api/clipper` — clipper entry
- `/planner` — placeholder, unbuilt

## Env that must exist
`OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DEEPGRAM_API_KEY`, Stripe keys

## Connections
- [[Directr Product]]
