# flowlyst Proposal App — Retrospective

## Current State (as of 2026-03-04)
**Phase:** Pre-development — context files created, architecture finalized, hourly consulting page designed
**Next action:** Begin Sprint 1 — `npx create-next-app` and project scaffolding

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

## Up Next

### Immediate (Sprint 1)
- [ ] `npx create-next-app@latest` in `/proposal` — TypeScript + Tailwind
- [ ] Install deps: `@supabase/supabase-js @supabase/ssr ai @anthropic-ai/sdk openai @google/generative-ai puppeteer`
- [ ] Tailwind config with flowlyst brand colors + Nunito font
- [ ] Supabase project: create project, run schema migrations
- [ ] Enable Google OAuth in Supabase dashboard

### Sprint 2: Auth
- [ ] Login page (`/login`) — Google Sign-In, flowlyst branded
- [ ] `middleware.ts` route protection
- [ ] Auth callback route
- [ ] User profile auto-creation trigger

### Sprint 3: Admin
- [ ] Users/invite management
- [ ] Org types seed + admin UI
- [ ] AI models seed + admin UI
- [ ] Modules + content blocks admin

### Sprint 4: AI Writer
- [ ] Vercel AI SDK provider adapters
- [ ] `change-section` and `generate-proposal` API routes
- [ ] `InlineChanger.tsx` component
- [ ] `AIChatPanel.tsx` component
- [ ] Model selector in topbar

### Sprint 5: Training Proposal
- [ ] Dashboard
- [ ] Proposal form (training type, template-first)
- [ ] Preview component (flowlyst branded)
- [ ] PDF export
- [ ] Shareable link

---

## Blockers / Waiting On
- User needs to provide: Supabase project URL + keys, Google OAuth credentials, API keys (Anthropic, OpenAI, Google), brand assets (logo SVGs, Cera Round Pro fonts)
- `brew install poppler` needed to read brand book PDF

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
