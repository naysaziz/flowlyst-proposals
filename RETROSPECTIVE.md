# flowlyst Proposal App — Retrospective

## Current State (as of 2026-03-06)
**Phase:** Sprint 5 + PDF visual redesign complete — full Brick-style proposal with static brand pages
**Next action:** Test full PDF end-to-end, commit, then decide on cover subtitle field

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

### 2026-03-04 — Sprint 5: Training Proposal

- ✅ `/proposals/new` — client-side new proposal form: client info, org type picker, module checkboxes, total preview, creates proposal + modules in DB
- ✅ `/proposals/[id]` — full editor: all content sections, auto-save (2.5s debounce), status selector, module pricing sidebar, share link copy, links to preview + PDF
- ✅ `ProposalEditor.tsx` — client component with InlineChanger on every section + AIChatPanel toggle
- ✅ `ProposalPreview.tsx` — branded render component: cover page, all sections, investment table, hourly page, terms
- ✅ `/proposals/[id]/preview` — dark toolbar (back, copy share link, export PDF) + preview in white paper container
- ✅ `PreviewToolbar.tsx` — client component for interactive buttons in server page
- ✅ `/share/[uuid]` — public page (anon Supabase key), reads by `share_uuid`, no auth needed
- ✅ `/api/pdf/[id]` — Puppeteer: service role fetch → `buildProposalHTML()` → `page.setContent()` → PDF download
- ✅ `src/lib/pdf.ts` — full HTML template with inline CSS for PDF generation (no Puppeteer URL navigation)
- ✅ `next.config.mjs` — `serverComponentsExternalPackages: ['puppeteer']`
- ✅ Build passes clean (`next build` ✓) — 15 routes

**Architecture notes:**
- PDF route uses `page.setContent(html)` (not `page.goto(url)`) — avoids auth issues entirely
- Share page uses anon key for proposal data, service role for consulting rates + content blocks
- Auto-save: `useEffect` watches all state fields, 2.5s debounce, visual "Saving…/Saved ✓/Save" indicator
- Modules sidebar: toggle included/excluded + inline price override → delete-and-reinsert on save

---

---

### 2026-03-05 — Template Pre-fill (Sprint 5 Extension)

- ✅ Read `docs/East Penn SD.pdf` and `docs/Brick Hourly Consulting Proposal.pdf` for real proposal content
- ✅ Created `supabase/migrations/002_seed_templates.sql`:
  - Replaced placeholder training modules with real packages:
    - "AI Training — 3-Hour Half-Day Workshop" → $6,500 (+ travel billed at cost)
    - "AI Training — Full-Day Workshop (5 Hours)" → $9,500 (+ travel billed at cost)
  - Updated `about_flowlyst_full` content block with richer Aziz bio (19 yrs, CFO, CPS, EBRD, etc.)
  - Inserted "AI Training — Default" template with all 5 sections fully pre-filled from real proposal content
- ✅ Updated `proposals/new/page.tsx` to:
  - Fetch generic training template on page load
  - Apply all template sections (cover_note, scope_of_work, training_package, deliverables, timeline_content) on proposal creation
- ✅ New proposals now arrive in editor fully pre-filled — ready to send or refine with AI

**Run `002_seed_templates.sql` in Supabase SQL editor to activate**

---

### 2026-03-05 — Bug Fixes

- ✅ Fixed infinite re-render loop: `createClient()` was called every render and used as a `useEffect`/`useCallback` dep — replaced with `useMemo(() => createClient(), [])` in `ModelContext.tsx`, `ProposalEditor.tsx`, and `proposals/new/page.tsx`
- ✅ Fixed stale closure in auto-save: `markDirty` was `useCallback([])` so `save()` always used initial render's state — fixed with `saveRef` pattern (ref updated every render, timeout calls `saveRef.current()`)
- ✅ Fixed auto-save firing on initial mount (unnecessary save on page open) — added `isMounted` ref guard
- ✅ Cleared stale `.next/` build cache that caused `Cannot find module './948.js'` errors after running `next build` while dev server was active

---

### 2026-03-06 — PDF Visual Redesign (Session 6)

**Brand images added to `public/images/`** (committed as "images"):
- `logo-full-color.png`, `logo-full-white.png`, `logo-icon-color.png`, `logo-icon-white.png`
- `pattern-strip.png`, `pattern-accent.png`, `pattern-accent-white.png`
- `aziz-photo.png`
- Favicon added to `src/app/`

**PDF redesign — matching Brick Hourly Consulting Proposal style:**
- ✅ `src/lib/pdf.ts` rewritten: two-column cover, logo/pattern images as base64, running Puppeteer header/footer
- ✅ `src/app/api/pdf/[id]/route.ts` updated: loads all 7 PNGs as base64 at request time, proper page margins (`top:68px, right:64px, bottom:52px, left:64px`), `displayHeaderFooter:true`
- ✅ `src/components/ui/Sidebar.tsx` — replaced SVG with `logo-full-color.png` via `next/image`
- ✅ `src/app/(auth)/login/page.tsx` — replaced SVG with `logo-full-color.png` via `next/image`
- ✅ Fixed TypeScript error: `client_org_type` field didn't exist on `ProposalData` — removed reference
- ✅ Nunito font loaded via Google Fonts `<link>` in PDF HTML — applied to all body text, headings, and title
- ✅ Pattern strip opacity set to 30% — matches Brick design (subtle, not dominant)
- ✅ Cover subtitle added: dark text below main title (currently "AI & Workflow Automation" — to be made dynamic)
- ✅ Playwright installed and used to visually verify cover page — matches Brick style

**Verified with Playwright screenshot** — cover page confirmed matching target design.

---

### 2026-03-06 — Static Brand Pages + Image Masking (Session 6 continued)

**Additional images added to `public/images/`:**
- `ai-visual.png` — AI/automation visual for "Our Mission" page
- `training-photo.jpg` — Training room photo for "Recognition" page (jpg, not png)
- `pattern-accent-single.png` — Solid green triangle only (for page decorative accents)
- `pattern-accent-single-white.png` — White version of single triangle

**PDF restructure — full Brick proposal page order:**
- ✅ Page 1: Cover (unchanged)
- ✅ Page 2: **Our Mission** — static text + AI visual clipped inside triangle shape using CSS `mask-image`
- ✅ Page 3: **Our Services** — "Automation consulting" + "Training packages" subsections
- ✅ Page 4: **About the Trainer** — Aziz photo + `about_flowlyst_full` DB content
- ✅ Page 5: **Recognition & Client Feedback** — testimonials + training photo + notable engagements
- ✅ Page 6: **Relevant Engagements** — CPS case study with detailed impact metrics
- ✅ Pages 7+: Dynamic proposal sections (each own page): Intro, Scope, Training Package, Deliverables, Timeline, Investment, Terms
- ✅ Conditional: Hourly Consulting page
- ✅ Last: Back cover (teal card)
- ✅ `patternAccentSingle` used for all page decorative accents (solid triangle, positioned/sized per page)
- ✅ Footer border updated to teal `#00A568` line (matching Brick)
- ✅ `loadBase64()` updated to handle `.jpg`/`.jpeg` with correct mime type
- ✅ Build passes clean (15 routes)

**CSS triangle mask on Our Mission page:**
- `ai-visual.png` is clipped to the flowlyst triangle shape using `-webkit-mask-image` / `mask-image` with `pattern-accent-single.png` as the mask
- Verified visually with Playwright screenshot — matches Brick "Our Mission" design

**Dev server note:** Two Next.js servers running — latest code on port 3002 (started this session), older server on port 3000.

---

## Up Next

- Test full PDF end-to-end via `/api/pdf/[id]`
- Decide on cover subtitle field (currently hardcoded "AI & Workflow Automation" — make dynamic or per proposal type)
- Commit all PDF redesign work to dev branch
- Phase 2: Software/Budget proposals
- Phase 3: Salary Projection proposals
- Vercel deployment
- Email sharing

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
