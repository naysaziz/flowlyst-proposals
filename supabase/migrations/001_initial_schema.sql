-- ═══════════════════════════════════════════════════════
-- flowlyst Proposals — Initial Schema
-- Run this in your Supabase SQL editor
-- ═══════════════════════════════════════════════════════

-- ── User Profiles ──────────────────────────────────────
create table user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  role          text not null default 'editor' check (role in ('admin', 'editor', 'viewer')),
  avatar_url    text,
  invited_by    uuid references user_profiles(id),
  created_at    timestamptz not null default now()
);

-- Auto-create profile on sign up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into user_profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Invitations ────────────────────────────────────────
create table invitations (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  role          text not null default 'editor' check (role in ('admin', 'editor', 'viewer')),
  invited_by    uuid references user_profiles(id),
  accepted_at   timestamptz,
  expires_at    timestamptz not null default (now() + interval '7 days'),
  token         uuid not null default gen_random_uuid() unique
);

-- ── Organization Types ─────────────────────────────────
create table organization_types (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  label           text not null,
  description     text,
  default_intro   text,
  default_about   text,
  ai_tone_notes   text,
  active          boolean not null default true,
  sort_order      int not null default 0
);

-- Seed org types
insert into organization_types (slug, label, description, ai_tone_notes, sort_order) values
  ('law_firm', 'Law Firm', 'Legal professionals — attorneys, paralegals, law partners',
   'Write for experienced attorneys. Emphasize ROI, billable hour efficiency, time savings, and practical application. Use formal, precise language. Avoid technical jargon. Focus on workflow optimization and competitive advantage.', 1),
  ('school_district', 'School District', 'Public K-12 school districts — administrators, superintendents, business managers',
   'Write for public school administrators juggling tight budgets and competing priorities. Be collaborative, outcomes-focused, and accessible. Emphasize ease of adoption, staff training, and alignment with district goals.', 2),
  ('clinic', 'Clinic / Healthcare', 'Healthcare organizations — clinics, hospitals, medical practices',
   'Write for healthcare professionals dealing with heavy regulation and patient-care priorities. Be precise, professional, and compliance-aware. Emphasize reducing administrative burden and operational efficiency.', 3),
  ('city', 'City / Municipality', 'Local government — city halls, towns, municipalities',
   'Write for government clients who must justify expenditures publicly. Use formal, transparent language. Emphasize public accountability, long-term value, and constituent service improvement.', 4),
  ('accounting_firm', 'Accounting Firm', 'Accounting and financial services firms',
   'Write for analytically-minded accountants. Be specific and quantify benefits where possible. Avoid vague transformation language. Focus on time savings, error reduction, and scalability during peak periods like tax season.', 5),
  ('real_estate', 'Real Estate', 'Real estate agencies, brokerages, and professionals',
   'Write for deal-oriented real estate professionals who move fast. Be energetic, practical, and concrete. Emphasize speed, competitive advantage, and anything that helps close deals or generate leads.', 6);

-- ── AI Providers ───────────────────────────────────────
create table ai_providers (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  provider    text not null check (provider in ('anthropic', 'openai', 'google')),
  label       text not null,
  active      boolean not null default true,
  sort_order  int not null default 0
);

insert into ai_providers (slug, provider, label, sort_order) values
  ('claude-sonnet-4-6',      'anthropic', 'Claude Sonnet 4.6',  1),
  ('claude-opus-4-6',        'anthropic', 'Claude Opus 4.6',    2),
  ('gpt-4o',                 'openai',    'GPT-4o',             3),
  ('gpt-4o-mini',            'openai',    'GPT-4o mini',        4),
  ('gemini-2.0-flash',       'google',    'Gemini 2.0 Flash',  5),
  ('gemini-1.5-pro',         'google',    'Gemini 1.5 Pro',    6);

-- ── User Preferences ──────────────────────────────────
create table user_preferences (
  user_id         uuid primary key references user_profiles(id) on delete cascade,
  preferred_model text not null default 'claude-sonnet-4-6'
);

-- ── Consulting Rate Settings ───────────────────────────
create table consulting_rate_settings (
  id                uuid primary key default gen_random_uuid(),
  rate_virtual      numeric not null default 350,
  rate_onsite       numeric not null default 500,
  travel_note       text default 'On-site engagements include travel expenses billed at cost',
  terms_minimum     text default '1-hour minimum per session',
  terms_billing     text default 'Net 30',
  terms_scope       text default 'Flexible and can evolve based on progress and priorities',
  updated_at        timestamptz not null default now()
);

-- Seed one default row
insert into consulting_rate_settings default values;

-- ── Modules ────────────────────────────────────────────
create table modules (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  category      text not null check (category in ('software', 'training', 'salary', 'addon')),
  description   text,
  default_price numeric not null default 0,
  notes         text,
  sort_order    int not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Training modules seed
insert into modules (name, category, description, default_price, sort_order) values
  ('AI Literacy Training — 4 Sessions',  'training', 'Foundations of AI tools, prompt engineering, and practical workflows', 4800,  1),
  ('AI Literacy Training — 8 Sessions',  'training', 'Full program with advanced applications and custom workflow development', 8800,  2),
  ('AI Literacy Training — 12 Sessions', 'training', 'Comprehensive program including implementation support and follow-up', 12000, 3),
  ('Automation Consulting Package',      'addon',    'Spreadsheet and workflow automation for internal operations', 6500,  4),
  ('Custom Dashboard Development',       'software', 'Looker Studio or Excel dashboards tailored to client needs', 3500,  5),
  ('Budget Entry Module',                'software', 'Structured budgeting system with department-level access', 8500,  6),
  ('Salary Projection Module',           'salary',   'Multi-year salary projections with COLA and step settings', 7400,  7),
  ('Implementation & Onboarding',        'addon',    '8 hours staff training and system setup support', 3500,  8);

-- ── Content Blocks ─────────────────────────────────────
create table content_blocks (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  label       text not null,
  content     text not null default '',
  updated_at  timestamptz not null default now()
);

insert into content_blocks (key, label, content) values
  ('about_flowlyst_full', 'About flowlyst (Full — for training proposals)',
   'flowlyst is a boutique consulting firm specializing in AI training, workflow automation, and technology solutions for public sector and private organizations. Led by Aziz Aghayev — a former Chief Financial Officer with 14+ years in public education and a software developer with deep expertise in AI implementation — flowlyst brings both strategic vision and technical depth to every engagement.

Aziz holds an MBA from the Isenberg School of Management at UMass Amherst and has delivered high-impact training and consulting programs for dozens of organizations across the US, UK, and internationally, including Chicago Public Schools, ASBO, NJASBO, MASBO, and the Ministry of Agriculture in Azerbaijan.'),

  ('about_flowlyst_short', 'About flowlyst (Short — for software proposals)',
   'flowlyst is a boutique technology consulting firm specializing in financial systems, automation, and AI training for public sector organizations. Led by Aziz Aghayev — a former CFO and software developer — flowlyst brings both operational expertise and technical depth to every engagement.'),

  ('terms_standard', 'Standard Proposal Terms',
   'This proposal is valid for 30 days from the date of issue. A signed agreement and deposit are required to initiate the engagement. Payment terms are Net 30 from invoice date. Scope adjustments may be accommodated with written agreement from both parties.');

-- ── Proposal Templates ────────────────────────────────
create table proposal_templates (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  proposal_type   text not null check (proposal_type in ('training', 'software', 'salary')),
  org_type_id     uuid references organization_types(id),
  default_modules uuid[],
  sections        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

-- ── Proposals ─────────────────────────────────────────
create table proposals (
  id                    uuid primary key default gen_random_uuid(),
  share_uuid            uuid not null unique default gen_random_uuid(),
  title                 text not null,
  type                  text not null check (type in ('training', 'software', 'salary')),
  status                text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined')),
  client_name           text not null,
  client_contact        text,
  client_email          text,
  proposal_date         date not null default current_date,
  cover_note            text,
  org_type_id           uuid references organization_types(id),
  template_id           uuid references proposal_templates(id),
  ai_generated          boolean not null default false,
  -- Content sections (AI-writable)
  scope_of_work         text,
  timeline_content      text,
  deliverables          text,
  training_package      text,
  -- Hourly consulting page
  include_hourly_page   boolean not null default false,
  hourly_rate_virtual   numeric,
  hourly_rate_onsite    numeric,
  hourly_purpose        text,
  hourly_service_areas  text[],
  -- Pricing
  show_year2            boolean not null default false,
  deposit_amount        numeric,
  year2_total           numeric,
  -- Snapshot
  proposal_content      jsonb,
  created_by            uuid references user_profiles(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger proposals_updated_at
  before update on proposals
  for each row execute procedure update_updated_at();

-- ── Proposal Modules ──────────────────────────────────
create table proposal_modules (
  id              uuid primary key default gen_random_uuid(),
  proposal_id     uuid not null references proposals(id) on delete cascade,
  module_id       uuid not null references modules(id),
  price_override  numeric,
  notes_override  text,
  sort_order      int not null default 0,
  included        boolean not null default true
);

-- ── Row Level Security ────────────────────────────────
alter table user_profiles enable row level security;
alter table proposals enable row level security;
alter table proposal_modules enable row level security;
alter table modules enable row level security;
alter table content_blocks enable row level security;
alter table organization_types enable row level security;
alter table ai_providers enable row level security;
alter table user_preferences enable row level security;
alter table consulting_rate_settings enable row level security;
alter table proposal_templates enable row level security;

-- Authenticated users can read most tables
create policy "auth users read org types"
  on organization_types for select to authenticated using (true);

create policy "auth users read ai providers"
  on ai_providers for select to authenticated using (true);

create policy "auth users read modules"
  on modules for select to authenticated using (true);

create policy "auth users read content blocks"
  on content_blocks for select to authenticated using (true);

create policy "auth users read proposal templates"
  on proposal_templates for select to authenticated using (true);

create policy "auth users read consulting rates"
  on consulting_rate_settings for select to authenticated using (true);

-- User profiles: read own + admins read all
create policy "users read own profile"
  on user_profiles for select to authenticated
  using (auth.uid() = id);

-- Proposals: created_by
create policy "users manage own proposals"
  on proposals for all to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "users manage own proposal modules"
  on proposal_modules for all to authenticated
  using (
    exists (select 1 from proposals where id = proposal_modules.proposal_id and created_by = auth.uid())
  );

-- User preferences
create policy "users manage own preferences"
  on user_preferences for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Public share view (no auth needed)
create policy "public share view"
  on proposals for select to anon
  using (share_uuid is not null);
