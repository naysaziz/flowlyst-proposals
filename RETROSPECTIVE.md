# flowlyst Proposal App — Retrospective

## Current State (as of 2026-03-04)
**Phase:** Sprint 4 complete — full AI writer built, build passes
**Next action:** Sprint 5 — Training Proposal (new proposal form, editor, preview, PDF export, shareable link)

---

## What's Been Done

### 2026-03-04 — Architecture & Design Session
- ✅ Created `design-mockup.html` — fully interactive 3-screen UI mockup (dashboard, editor, preview)
- ✅ Finalized architecture (see CONTEXT.md)
- ✅ Updated CONTEXT.md with full spec
- ✅ Created CLAUDE.md (session startup instructions)
- ✅ Created RETROSPECTIVE.md (this file)
- ✅ `proposal-writer-skill.md` created with full AI instructions (skill-creator skill used)
- ✅ Read `docs/Brick Hourly Consulting Proposal.pdf` — extracted hourly page structure and full Aziz bio
- ✅ Updated `proposal-writer-skill.md` with hourly consulting page section and Aziz bio content
- ✅ Updated `CONTEXT.md` with `consulting_rate_settings` table, hourly page fields in `proposals`, training proposal structure

**Key decisions made:**
- Supabase Auth (Google OAuth) — no NextAuth
- Template-first UX: all fields pre-filled, AI refines (not generates from blank)
- Multi-model AI: Claude, OpenAI, Gemini — model selector in topbar
- Org-type presets in DB (editable from admin panel)
- Phase 1 = Training proposals (law firm client is first deliverable)
- Vercel AI SDK for unified streaming across AI providers
- Invite-by-email user management

---

## What's Been Done

### 2026-03-04 — Sprint 1 & 2: Foundation + Auth

**Sprint 1 — Scaffolding:**
- ✅ Next.js 14 App Router scaffolded with TypeScript + Tailwind
- ✅ All deps installed: `@supabase/supabase-js @supabase/ssr ai @anthropic-ai/sdk openai @google/generative-ai puppeteer`
- ✅ Tailwind configured with full flowlyst brand tokens (teal, purple, charcoal, silver)
- ✅ Nunito + DM Serif Display fonts (Google Fonts via next/font)
- ✅ Full folder structure created (auth, app, admin, api routes, components, lib)
- ✅ All TypeScript types defined in `src/types/index.ts`
- ✅ Build passes clean (`npm run build` ✓)

**Sprint 2 — Auth:**
- ✅ Login page (`/login`) — flowlyst branded Google Sign-In
- ✅ `middleware.ts` — protects all `/(app)/*` routes, redirects unauthenticated users
- ✅ Auth callback route (`/api/auth/callback`)
- ✅ `handle_new_user` trigger — auto-creates `user_profiles` row on first sign-in
- ✅ Supabase project created, Google OAuth enabled, migration run
- ✅ First login completed, admin role granted via SQL
- ✅ Dashboard page + Sidebar nav (role-based admin links)

**Infrastructure:**
- ✅ DB schema migrated (`supabase/migrations/001_initial_schema.sql`) — all tables, RLS, seeds
- ✅ GitHub repo created: `git@github.com:naysaziz/flowlyst-proposals.git`
- ✅ `main` and `dev` branches pushed
- ✅ `.gitignore` blocks all `.env` files

---

### 2026-03-04 — Sprint 3: Admin Panel

- ✅ `/admin/layout.tsx` — admin guard (redirects non-admins) + tabbed nav across all admin pages
- ✅ `/admin/users` — user list with inline role editor, invite by email, revoke pending invites
- ✅ `/admin/org-types` — edit org presets, AI tone notes, default intro/about per industry
- ✅ `/admin/modules` — add/edit modules, toggle active, edit pricing inline
- ✅ `/admin/content` — edit reusable content blocks (About flowlyst full/short, Terms)
- ✅ `/admin/ai-models` — toggle switches per model, grouped by provider (Anthropic, OpenAI, Google)
- ✅ Build passes clean, committed and pushed to `dev`

---

### 2026-03-04 — Sprint 4: AI Writer

- ✅ `src/lib/ai/providers/anthropic.ts` — streams via `@anthropic-ai/sdk` `messages.stream()`
- ✅ `src/lib/ai/providers/openai.ts` — streams via `openai` `chat.completions.create({ stream: true })`
- ✅ `src/lib/ai/providers/google.ts` — streams via `@google/generative-ai` `generateContentStream()`
- ✅ `src/lib/ai/generate.ts` — unified router: routes to provider by model slug prefix (`claude-`, `gpt-`, `gemini-`)
- ✅ `POST /api/ai/change-section` — loads `proposal-writer-skill.md`, builds context message, returns `text/plain` stream
- ✅ `POST /api/ai/generate-proposal` — full proposal generation with section targeting
- ✅ `src/components/ai/InlineChanger.tsx` — 4-state machine (idle → open → streaming → preview), Accept/Reject
- ✅ `src/components/ai/AIChatPanel.tsx` — slide-out 420px panel, section selector, streaming chat, "Apply to proposal"
- ✅ `src/contexts/ModelContext.tsx` — React context, syncs preferred_model to/from `user_preferences` table
- ✅ `src/components/ui/ModelSelector.tsx` — dropdown grouped by provider (Anthropic/OpenAI/Google), persists to DB
- ✅ Dashboard topbar updated to include `ModelSelector`
- ✅ `(app)/layout.tsx` wraps with `ModelProvider` (server-fetches default model)
- ✅ Build passes clean (`next build` ✓)

**Architecture notes:**
- Streaming uses `ReadableStream<Uint8Array>` returned directly as `Response` body (`text/plain`)
- Frontend reads with `fetch` + `response.body.getReader()` (no AI SDK client hooks needed)
- Model routing by slug prefix: `claude-*` → Anthropic, `gpt-*`/`o1-*` → OpenAI, `gemini-*` → Google
- `ModelProvider` server-reads preferred model, `ModelContext` client-syncs changes back to DB

---

## Up Next

### Sprint 5: Training Proposal
- [ ] New proposal form (training type, template-first, org-type selector)
- [ ] Training proposal preview component (flowlyst branded)
- [ ] PDF export (`/api/pdf/[id]`)
- [ ] Shareable link (`/share/[uuid]`)

---

## Blockers / Waiting On
- API keys needed in `.env.local`: Anthropic, OpenAI, Google (replace placeholder values)
- Brand assets still needed: logo SVGs, Cera Round Pro fonts (optional polish)

---

## Notes & Decisions Log

### Hourly Consulting Page
- Optional standalone page, toggled per proposal (`include_hourly_page` boolean)
- Default rates: $350/hr virtual, $500/hr on-site (stored in `consulting_rate_settings`, editable from admin)
- Structure: Purpose → How I Can Help (bullets) → Professional Fee → Terms
- AI customizes the purpose paragraph and service area bullets based on org type
- Reference: `docs/Brick Hourly Consulting Proposal.pdf`

### Aziz Aghayev — Bio Context (for "About" sections)
- 19 years experience, MBA from Isenberg/UMass Amherst
- Former CFO 14+ years in public education
- Software developer (React, TypeScript, Python)
- Contact: +1(857)999-1234 · flowlyst.io · aziz@flowlyst.io
- Notable: Chicago Public Schools, Ministry of Agriculture Azerbaijan, ASBO, NJASBO, AASA, MASBO, City of Lucas, Ebby Halliday Real Estate
- Full bio stored in `proposal-writer-skill.md` for AI to reference

### Training Proposal (law firm)
- First real proposal to send: AI/tech training for attorneys
- Structure: Scope → Sessions/Package → Consulting hourly rate → Timeline → Deliverables
- Reference: East Penn SD.pdf and EBRD AI Training.pdf (similar structure, different audience)
- Law firm tone: formal, ROI-focused, emphasis on time efficiency for attorneys

### Org Type Presets
- Start with 6: Law Firm, School District, Clinic/Healthcare, City/Municipality, Accounting Firm, Real Estate
- All stored in DB — editable from admin without code changes
- AI tone notes injected into every AI API call for that org type

### AI Model Architecture
- Vercel AI SDK (`ai` package) provides unified streaming API across all providers
- Provider adapters in `src/lib/ai/providers/` — one file per provider
- Add new providers by: inserting DB row + creating adapter file

---
*Update this file at the end of every work session*
