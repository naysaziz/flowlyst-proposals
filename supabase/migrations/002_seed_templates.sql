-- ═══════════════════════════════════════════════════════
-- flowlyst Proposals — Module Pricing & Template Seed
-- Run this in your Supabase SQL editor after 001_initial_schema.sql
-- ═══════════════════════════════════════════════════════

-- ── Update Training Modules ─────────────────────────────
-- Remove any proposal_modules rows referencing old training modules first
delete from proposal_modules
where module_id in (select id from modules where category = 'training');

-- Now replace the training modules with real workshop packages
delete from modules where category = 'training';

insert into modules (name, category, description, default_price, notes, sort_order) values
  (
    'AI Training — 3-Hour Half-Day Workshop',
    'training',
    'Focused AI literacy and prompt engineering — practical demos and actionable skills from day one',
    6500,
    'Travel expenses billed at cost for on-site engagements',
    1
  ),
  (
    'AI Training — Full-Day Workshop (5 Hours)',
    'training',
    'Comprehensive AI training with advanced applications, custom workflows, and extended hands-on practice',
    9500,
    'Travel expenses billed at cost for on-site engagements',
    2
  );

-- Keep addon/software modules but update prices to match real offerings
update modules set default_price = 6500 where name = 'Automation Consulting Package';

-- ── Update About flowlyst content block ────────────────
-- Richer bio matching the Brick Hourly / EBRD proposals
update content_blocks
set content = $txt$flowlyst is a boutique AI training and automation consulting firm helping organizations harness the power of technology to work smarter, faster, and with greater impact.

Led by Aziz Aghayev — an AI, automation, and digitalization specialist with 19 years of experience — flowlyst has delivered high-impact training and consulting programs for dozens of organizations across the US, UK, and internationally. Aziz holds an MBA from the Isenberg School of Management at UMass Amherst, served as Chief Financial Officer for over 14 years in the public education sector, and brings deep software development expertise from work with major US firms and startups.

As a trainer, Aziz is recognized for a practical, demo-driven style that makes advanced AI concepts immediately accessible. He specializes in building real capability for mixed-experience groups — from first-time AI users to seasoned professionals.

Notable engagements include:
• Chicago Public Schools — Grant reporting automation saving 60+ hours per quarter; payroll audit workflow reduced from 3 hours to 30 minutes per cycle
• ASBO International, NJASBO, MASBO, AASA — Multiple highly-rated sessions on AI, automation, and prompt engineering for public sector leaders
• Ministry of Agriculture, Azerbaijan — Ministry-level AI and digitalization training widely praised for practical impact
• City of Lucas, Ebby Halliday Real Estate, and dozens of school districts and businesses across the US$txt$
where key = 'about_flowlyst_full';

-- ── Insert Default AI Training Template ─────────────────
-- Applied to all new training proposals as the starting content
insert into proposal_templates (name, proposal_type, sections) values (
  'AI Training — Default',
  'training',
  $json${
    "cover_note": "Thank you for the opportunity to present this proposal. We are genuinely excited about the possibility of partnering with your team and bringing the power of Artificial Intelligence to your day-to-day operations.\n\nThis proposal outlines a hands-on, practical AI training program designed specifically for your organization. Our goal is simple: equip your team with real, immediately applicable AI skills — from understanding how AI works, to crafting effective prompts, to building AI-powered workflows that save time and reduce manual effort.\n\nWe look forward to working together. Please do not hesitate to reach out with any questions or to discuss how we can further customize this program to best serve your needs.",
    "scope_of_work": "flowlyst will design and deliver a fully customized AI training workshop for your team, focused on the practical, hands-on application of Artificial Intelligence and prompt engineering in your organization's workflows.\n\nThe engagement will cover:\n\n• Introduction to AI — What generative AI is, how it works, and why it matters for organizations like yours right now\n• AI Tools Overview — Hands-on exploration of leading AI platforms including ChatGPT, Claude, Microsoft Copilot, and Gemini\n• Prompt Engineering — The art and science of communicating with AI to consistently get professional, accurate, and useful results\n• Practical Applications — Automating routine tasks, drafting communications, summarizing documents, generating reports, and analyzing data\n• Live Demonstrations — Real-world demos using examples directly relevant to your team's daily work\n• Hands-On Practice — Participants work through guided exercises and leave with AI workflows they can use immediately\n• Q&A and Next Steps — Open discussion, personalized guidance, and a roadmap for integrating AI into your operations\n\nThe program is designed for mixed-experience groups — from first-time AI users to those with some existing exposure — ensuring every participant leaves with practical skills they can apply from day one.",
    "training_package": "AI is a Leadership Multiplier\nPractical AI and Prompt Engineering — Hands-On Workshop\n\nFormat: In-person or virtual (your choice)\nDuration: Half-day (3 hours) or Full-day (5 hours)\nParticipants: All staff levels — no prior AI experience required\n\nThis workshop gives your team real, hands-on experience with AI tools that can immediately transform how they work. Participants leave with practical skills — not just theory — and a set of tools and prompts they can put to use from day one.\n\nSession Topics:\n\n1. Understanding AI Today\nA clear, jargon-free introduction to generative AI — what it is, what it can and cannot do, and where it adds the most value for teams like yours.\n\n2. AI Tools in Action\nLive demonstration and hands-on use of ChatGPT, Claude, Gemini, and Microsoft Copilot — including when and how to use each effectively.\n\n3. Prompt Engineering Fundamentals\nThe most critical AI skill: crafting prompts that deliver professional, consistent, and on-brand results every time. Participants practice live with real examples from their work.\n\n4. Practical Applications\n• Automating recurring reports and narratives\n• Drafting and refining professional communications\n• Summarizing long documents and meeting notes in seconds\n• Analyzing data and surfacing actionable insights\n• Reviewing, editing, and improving documents with AI\n\n5. Hands-On Workshop\nParticipants build their own AI workflows with live coaching and feedback — exercises grounded in their actual day-to-day responsibilities.\n\n6. Advanced Techniques (Full-Day Only)\nCustom AI tools, repeatable workflow automation, and building templates for ongoing AI-powered productivity.\n\n7. Q&A, Takeaways, and Next Steps\nExtended Q&A, personalized recommendations, and a clear roadmap for continued AI adoption across your organization.",
    "deliverables": "Upon completion of the training engagement, your organization will receive:\n\n• Full session recording — Complete video recording of the workshop for future reference and for team members unable to attend live\n• Slide deck and training materials — A branded PDF covering all session content, ready to share with your team\n• Prompt library — A curated collection of ready-to-use AI prompts tailored specifically to your organization's most common tasks and workflows\n• Post-session resource guide — Recommended tools, templates, and action steps for continued AI adoption after training\n• 30-day email support — Post-training Q&A support from Aziz Aghayev for questions that arise as your team begins implementing AI in their work",
    "timeline_content": "Phase 1 — Scheduling and Preparation (1–2 Weeks Prior to Training)\n• Confirm training date, format (in-person or virtual), and participant list\n• Complete a brief intake questionnaire so we can customize session content, examples, and exercises for your organization\n• flowlyst prepares tailored materials, demonstrations, and a prompt library specific to your team's workflows\n\nPhase 2 — Training Day\n• Trainer arrives or joins 15 minutes early for setup and introductions\n• Deliver full training session per the agreed agenda\n• Collect participant feedback at session close\n\nPhase 3 — Post-Training Delivery (Within 5 Business Days)\n• Deliver session recording, slide deck, and customized prompt library\n• Provide post-session resource guide and recommended next steps\n• Begin 30-day email support period"
  }$json$::jsonb
);
