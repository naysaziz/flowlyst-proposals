# flowlyst Proposal App — Project Context

## What We're Building
A personal web application for Aziz (flowlyst) to create, manage, and share consulting proposals. Replaces manual PDF/Word creation with a structured, AI-powered, branded tool.

> **Brand note:** The company name is always lowercase: **flowlyst**

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database + Auth | Supabase (Postgres + Auth + OAuth) |
| AI | Multi-model: Anthropic, OpenAI, Google (via Vercel AI SDK) |
| PDF Export | Puppeteer (server-side, via API route) |
| Deployment | Vercel |

---

## Authentication & Authorization

### Provider
Supabase Auth with Google OAuth — no NextAuth needed.

### Access Control
- **Invite-only**: Admin creates invite → user gets email → signs in with Google → profile auto-created
- **Roles**: `admin` (full access), `editor` (create/edit proposals), `viewer` (read-only, future)

### Auth Flow
1. `/login` page with "Sign in with Google" button
2. Supabase OAuth callback at `/api/auth/callback`
3. `middleware.ts` protects all `/(app)/*` routes
4. Unauthenticated users redirected to `/login`

---

## Features

- Template-first proposal creation (all fields pre-filled from templates, not blank)
- AI-powered section writer: inline "✦ Change with AI" per section + full chat panel mode
- Multi-model AI selector: choose Claude, OpenAI, or Gemini per session
- Organization-type presets: industry-specific language (law firm, school district, clinic, etc.)
- Public UUID shareable links (anyone with link can view)
- Server-side PDF generation
- Module/pricing database (manageable via admin panel)
- Content blocks database (standard text — editable via admin panel)
- Invite-based user management

---

## Proposal Types (Build Order)
1. **Phase 1:** Training proposals (law firm — first client) ← START HERE
2. **Phase 2:** Software/Budget proposals (Briarcliff Manor style)
3. **Phase 3:** Salary Projection proposals (Oswego style)

---

## Database Schema

### `user_profiles`
```sql
id            uuid primary key references auth.users(id)
email         text
full_name     text
role          text          -- 'admin' | 'editor' | 'viewer'
avatar_url    text
invited_by    uuid references user_profiles(id)
created_at    timestamptz
```

### `invitations`
```sql
id            uuid primary key
email         text unique
role          text          -- default 'editor'
invited_by    uuid references user_profiles(id)
accepted_at   timestamptz
expires_at    timestamptz
token         uuid unique
```

### `organization_types`
Industry presets with default language and AI tone guidance.
```sql
id              uuid primary key
slug            text unique   -- 'law_firm' | 'school_district' | 'clinic' | 'city' | 'accounting' | 'real_estate'
label           text          -- 'Law Firm'
description     text
default_intro   text          -- Pre-written intro for this org type
default_about   text          -- About flowlyst tailored to this audience
ai_tone_notes   text          -- Injected into AI prompt (e.g. "Use formal legal language...")
active          boolean
sort_order      int
```

Initial org types: Law Firm, School District, Clinic/Healthcare, City/Municipality, Accounting Firm, Real Estate.

### `ai_providers`
```sql
id          uuid primary key
slug        text unique    -- 'claude-sonnet-4-6' | 'gpt-4o' | 'gemini-2.0-flash'
provider    text           -- 'anthropic' | 'openai' | 'google'
label       text           -- Display name: 'Claude Sonnet 4.6'
active      boolean
sort_order  int
```

Initial models:
- Anthropic: Claude Sonnet 4.6, Claude Opus 4.6
- OpenAI: GPT-4o, GPT-4o mini
- Google: Gemini 2.0 Flash, Gemini 1.5 Pro

### `user_preferences`
```sql
user_id         uuid primary key references user_profiles(id)
preferred_model text    -- references ai_providers.slug
```

### `proposal_templates`
Reusable full-proposal templates per type + org combo.
```sql
id              uuid primary key
name            text          -- 'AI Training — Law Firm'
proposal_type   text          -- 'training' | 'software' | 'salary'
org_type_id     uuid references organization_types(id)
default_modules uuid[]        -- pre-selected module IDs
sections        jsonb         -- pre-filled section content (all fields)
created_at      timestamptz
```

### `modules`
Reusable service/pricing catalog.
```sql
id            uuid primary key
name          text           -- e.g., "AI Literacy Training (8 sessions)"
category      text           -- 'software' | 'training' | 'salary' | 'addon'
description   text
default_price numeric
notes         text           -- e.g., "Per session rate available"
sort_order    int
active        boolean
created_at    timestamptz
```

### `consulting_rate_settings`
Default hourly rates stored globally (editable from admin). Proposals inherit defaults but can override.
```sql
id                 uuid primary key
rate_virtual       numeric default 350  -- USD per hour, virtual
rate_onsite        numeric default 500  -- USD per hour, on-site
travel_note        text                 -- e.g., "Travel expenses billed at cost"
terms_minimum      text default '1-hour minimum per session'
terms_billing      text default 'Net 30'
terms_scope        text default 'Flexible and can evolve based on progress and priorities'
updated_at         timestamptz
```

### `proposals`
```sql
id                uuid primary key
share_uuid        uuid unique       -- Public shareable link token
title             text
type              text              -- 'software' | 'training' | 'salary'
status            text              -- 'draft' | 'sent' | 'accepted' | 'declined'
client_name       text
client_contact    text
client_email      text
proposal_date     date
cover_note        text
org_type_id       uuid references organization_types(id)
template_id       uuid references proposal_templates(id)
ai_generated      boolean default false
-- AI-writable content sections
scope_of_work     text
timeline_content  text
deliverables      text
training_package  text
-- Hourly consulting page (optional, standalone page)
include_hourly_page    boolean default false
hourly_rate_virtual    numeric           -- overrides consulting_rate_settings default
hourly_rate_onsite     numeric
hourly_purpose         text              -- purpose paragraph (AI-writable)
hourly_service_areas   text[]            -- bullet list of areas (AI-writable)
-- Pricing
show_year2        boolean
deposit_amount    numeric
year2_total       numeric
-- Snapshot
proposal_content  jsonb             -- Snapshot of content blocks at creation time
created_by        uuid references user_profiles(id)
created_at        timestamptz
updated_at        timestamptz
```

### `proposal_modules`
```sql
id              uuid primary key
proposal_id     uuid references proposals(id)
module_id       uuid references modules(id)
price_override  numeric
notes_override  text
sort_order      int
included        boolean
```

### `content_blocks`
```sql
id          uuid primary key
key         text unique    -- 'about_flowlyst', 'company_overview', 'training_intro'
label       text
content     text
updated_at  timestamptz
```

---

## AI Proposal Writer

### How It Works
1. User selects proposal template (e.g., "AI Training — Law Firm")
2. ALL form fields pre-populate from template + org type preset
3. User reviews; can directly edit any field
4. For AI changes: click `✦ Change` on any section, type instruction, AI streams update
5. User accepts or rejects the AI suggestion

### Dual Modes
- **Inline**: Per-section `✦ Change` button with streaming response
- **Chat Panel**: Slide-out AI assistant for wholesale proposal changes

### AI Model Selection
- Model dropdown in topbar (saves to `user_preferences.preferred_model`)
- Routes to correct provider adapter at runtime

### Prompt Architecture
- `src/lib/ai/proposal-writer-skill.md` — Master instruction file (version-controlled)
- Loaded server-side for every AI call
- Org-type `ai_tone_notes` injected dynamically per request

### API Routes
- `POST /api/ai/change-section` — Refine one section with streaming
- `POST /api/ai/generate-proposal` — Full proposal from chat description

---

## Training Proposal Structure
(Based on East Penn SD / EBRD AI Training + Brick Hourly reference proposals)

1. Cover — client, type, date, total investment
2. Introduction — personalized cover note
3. About flowlyst / About the Trainer — org-type adapted Aziz bio
4. Scope of Work — AI-assisted, session/unit breakdown
5. Training Package — sessions, format (onsite/virtual), materials, duration
6. Deliverables — what the client receives
7. Timeline — week-by-week or phase-by-phase
8. Investment — training package price (separate line items)
9. *(Optional)* Hourly Consulting Page — standalone page, toggleable per proposal
10. Terms — payment terms, validity period

### Hourly Consulting Page (optional, standalone)
- Toggled on/off per proposal with `include_hourly_page` flag
- Default rates: $350/hr virtual, $500/hr on-site (editable in admin settings)
- Structure: Purpose → How I Can Help (bullets) → Professional Fee → Terms
- AI can customize the purpose paragraph and service areas bullets based on org type
- Rates pulled from `consulting_rate_settings` (overridable per proposal)

### Law Firm Preset
- Tone: formal, outcome-oriented, efficiency-focused
- Language: "legal professionals", "billable hour efficiency", "workflow optimization"
- AI tone: *"Write for experienced attorneys. Emphasize ROI, time savings, practical application. Use concise, professional prose."*
- Hourly page service areas for law firms: document review automation, intake workflows, client communication templates, billing data analysis, research automation

---

## Folder Structure
```
/proposal/
├── CLAUDE.md                               ← Session startup instructions for Claude
├── CONTEXT.md                              ← This file — full architecture reference
├── RETROSPECTIVE.md                        ← Living progress log (update each session)
├── design-mockup.html                      ← Interactive UI design reference
├── public/
│   └── assets/
│       ├── logo/                           ← DROP: logo.svg, logo-white.svg
│       ├── patterns/                       ← DROP: pattern images from brand book
│       └── fonts/                          ← DROP: Cera Round Pro .woff2 files
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (app)/                          ← Protected routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    ← Dashboard
│   │   │   ├── proposals/
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx            ← Editor
│   │   │   │       └── preview/page.tsx
│   │   │   └── admin/
│   │   │       ├── modules/page.tsx
│   │   │       ├── content/page.tsx
│   │   │       ├── users/page.tsx
│   │   │       ├── org-types/page.tsx
│   │   │       └── ai-models/page.tsx
│   │   ├── share/[uuid]/page.tsx           ← Public (no auth)
│   │   └── api/
│   │       ├── pdf/[id]/route.ts
│   │       ├── ai/
│   │       │   ├── change-section/route.ts
│   │       │   └── generate-proposal/route.ts
│   │       └── auth/callback/route.ts
│   ├── components/
│   │   ├── proposal/
│   │   ├── preview/
│   │   ├── ai/
│   │   │   ├── InlineChanger.tsx
│   │   │   └── AIChatPanel.tsx
│   │   └── ui/
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts
│       │   ├── server.ts
│       │   └── middleware.ts
│       ├── ai/
│       │   ├── proposal-writer-skill.md    ← Master AI instructions
│       │   ├── generate.ts
│       │   └── providers/
│       │       ├── anthropic.ts
│       │       ├── openai.ts
│       │       └── google.ts
│       └── pdf.ts
├── middleware.ts
└── .env.local
```

---

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## Brand (flowlyst)
- **Name:** always lowercase — `flowlyst`
- **Primary:** `#00A568` (teal/emerald)
- **Secondary:** `#5F5AA2` (purple)
- **Dark:** `#404041` (charcoal)
- **Light:** `#D9D9D9` (gray)
- **Font:** Cera Round Pro (`.woff2` files needed) — fallback: Nunito or DM Sans
- **Design:** Modern, minimalist, rounded shapes, generous whitespace

### Brand Assets Needed (user will provide)
```
public/assets/logo/logo.svg
public/assets/logo/logo-white.svg
public/assets/patterns/pattern-teal.png
public/assets/patterns/pattern-light.png
public/assets/fonts/CeraRoundPro-*.woff2
```

---

## Reference Files (in repo root)
- `Briarcliff Manor.pdf` — Software/budget proposal (Phase 2 template)
- `EBRD AI Training for SME Consultants.pdf` — Training proposal style reference
- `East Penn SD.pdf` — Training proposal style reference
- `Oswego CUSD 308.pdf` — Salary projection proposal (Phase 3)
- `flowlyst - Brand Book_r.pdf` — Brand guidelines
- `design-mockup.html` — Interactive UI design reference (open in browser)

---

## Build Order

### Step 0: Context files ✅ (done)
- CONTEXT.md, CLAUDE.md, RETROSPECTIVE.md, proposal-writer-skill.md

### Sprint 1: Foundation
1. `npx create-next-app@latest` — TypeScript + Tailwind
2. Install deps: `@supabase/supabase-js @supabase/ssr ai @anthropic-ai/sdk openai @google/generative-ai puppeteer`
3. Tailwind config: flowlyst colors + Nunito font
4. Supabase schema migrations
5. Supabase Auth: enable Google OAuth provider

### Sprint 2: Auth
6. Login page — Google Sign-In, flowlyst branded
7. `middleware.ts` — protect `/(app)/*`
8. Auth callback route
9. User profile auto-creation on first login

### Sprint 3: Admin Foundation
10. Admin users page — invite by email, role management
11. Org types seed data (6 types)
12. Org types admin page
13. AI models admin page + seed data
14. Module admin + content blocks admin

### Sprint 4: AI Proposal Writer
15. Vercel AI SDK + provider adapters
16. `POST /api/ai/change-section` — streaming
17. `POST /api/ai/generate-proposal`
18. `InlineChanger.tsx`
19. `AIChatPanel.tsx`
20. Model selector in topbar

### Sprint 5: Training Proposal (Phase 1 Deliverable)
21. Proposal dashboard
22. New proposal form — training type, template-first
23. Org-type selector → pre-fills all fields
24. Training proposal preview (flowlyst branded)
25. PDF export
26. Shareable link

### Phase 2: Software/Budget Proposals
### Phase 3: Salary Projection Proposals
