# Claude Instructions — flowlyst Proposal App

## Session Startup (ALWAYS do this first)
1. Read `RETROSPECTIVE.md` to understand current progress and where we left off
2. Read `CONTEXT.md` for full architecture reference
3. Check git status to see any uncommitted work
4. Summarize current state to the user before asking what to work on

## Project Overview
flowlyst Proposal App — Next.js 14 + Supabase + multi-model AI proposal writer.
See `CONTEXT.md` for full architecture, `design-mockup.html` for visual reference.

## Key Rules
- Brand name is always **lowercase**: `flowlyst` — never "Flowlyst" or "FLOWLYST"
- Colors: primary `#00A568` (teal), secondary `#5F5AA2` (purple), dark `#404041`
- Font: Cera Round Pro (fallback: Nunito)
- Follow the build order in CONTEXT.md — do not skip sprints
- Update `RETROSPECTIVE.md` at the end of every work session

## Skills to Use During Development
Use these skills proactively when the task matches:

| Task | Skill |
|---|---|
| UI components, pages, layouts | `document-skills:frontend-design` |
| PDF handling or export | `document-skills:pdf` |
| Word doc exports | `document-skills:docx` |
| Spreadsheet exports | `document-skills:xlsx` |
| Testing the web app (Playwright) | `document-skills:webapp-testing` |
| Building with Claude/Anthropic API | `claude-developer-platform` |
| MCP server integrations | `document-skills:mcp-builder` |
| Creating/refining AI prompt files | `document-skills:skill-creator` |
| Brand-consistent visual assets | `document-skills:brand-guidelines` |
| Internal docs / specs | `document-skills:doc-coauthoring` |

## File Map
```
CLAUDE.md           ← This file (session instructions)
CONTEXT.md          ← Full architecture + DB schema + build order
RETROSPECTIVE.md    ← Living progress log (update every session)
design-mockup.html  ← Visual UI reference (open in browser)
src/lib/ai/proposal-writer-skill.md  ← AI system prompt for proposal generation
```

## AI Proposal Writer
- Skill file: `src/lib/ai/proposal-writer-skill.md`
- API routes: `/api/ai/change-section` and `/api/ai/generate-proposal`
- Uses Vercel AI SDK for unified streaming across Anthropic/OpenAI/Google
- Model selection persisted in `user_preferences` table

## Reference PDFs (in repo root)
- `EBRD AI Training for SME Consultants.pdf` — Training proposal structure
- `East Penn SD.pdf` — Training proposal style
- `Briarcliff Manor.pdf` — Software proposal structure
- `Oswego CUSD 308.pdf` — Salary projection structure
- `flowlyst - Brand Book_r.pdf` — Brand guidelines (requires `brew install poppler` to read)
