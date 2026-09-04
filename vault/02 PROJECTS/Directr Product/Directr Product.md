---
type: project
status: active
started: 2026-07-13
deadline:
---

# Directr Product

## Goal
Ship and grow Directr — the tool that fixes a creator's hook before they post. Success looks like paying creators who come back weekly.

## Current State
- **Web app**: Next.js 15 + Supabase (auth, SSR) + Stripe (checkout, webhooks) — landing, pricing, waitlist/lock, jobs flow
- **Generate flow**: OpenAI-powered hook + clip breakdown generator (`/api/generate`, `lib/ai.ts`)
- **Clipper worker**: Python worker polling Supabase — download, Deepgram transcription, ffmpeg captions/encode at 720x1280
- **Planner**: placeholder page, not built yet

## Next Action
[The single most important next step — update this every weekly review]

## Open Questions / Decisions
- [Log decisions here so they don't get re-debated. E.g. why SSR auth over auth-helpers, why 720p default encode]

## Notes
- Bugs live in this folder as `BUG — [name].md` (use the Bug Report template)
- Features live as `SPEC — [name].md` (use the Feature Spec template)
- Every user signal gets a `FEEDBACK — [name].md` note (use the User Feedback template)

## Reference
- [[Tech Stack Reference]]
- [[Hooks Are Retention Devices]] — the positioning thesis behind everything here
