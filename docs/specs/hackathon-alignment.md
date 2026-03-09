# Hackathon Alignment — Spec

**Created**: 2026-03-08
**Status**: APPROVED

## Mission

- Minimally extend CoreModel to align with the Data Portability Hackathon Track 2 (AI Companions with Purpose), adding persona data import with consent, data export, legal seed data, and cross-source AI insights — focused on legal/academic use cases.

## Main Features

- **Persona Data Importer** — import hackathon synthetic persona datasets (p01-p05) or user-uploaded exports with per-category consent toggles
- **Data Export Bundle** — one-click ZIP download of all user data (sources, artifacts, assessments, conversations, preferences) in portable JSON
- **Legal Seed Data** — pre-loaded corpus of ~30-50 landmark legal cases (Constitutional Law, Data Privacy, IP, Torts) as source documents
- **Cross-Source Insight Prompts** — AI system prompt enhancements that surface patterns across imported data (calendar + conversations + lifelog)

## Major User Flows

- **Import flow**: Dashboard → "Import Study Data" button → select persona or upload files → consent dialog with category toggles (calendar, conversations, lifelog, email; financial/social off by default) → confirm → data ingested as sources on current topic
- **Study flow**: Select law topic → pre-loaded legal cases available as sources → AI chat generates adaptive study plan referencing both imported persona data and legal sources → artifacts (quizzes, flashcards, worked examples) generated from combined context
- **Export flow**: Profile/settings → "Download My Data" button → ZIP generated server-side → browser download
- **Cross-source insight**: During chat, AI detects patterns across imported data categories and surfaces them naturally (e.g., "Your conversation history shows repeated questions about due process — here's a targeted review")

## Required Screens

- **PersonaImportDialog** — modal with file picker / persona selector, data category toggles, consent summary, confirm button
- **Export button** — added to existing ProfileSheetContent (no new screen)
- **Legal topic entries** — new entries in topics.ts (Constitutional Law, Data Privacy Law, Contracts, Torts)

## Required Features (from /skills)

| Requirement | Skill(s) | Notes |
|-------------|----------|-------|
| AI chat with context injection | ai-chat, ai-core | Already implemented; extend system prompt |
| AI tool definitions | ai-tools | Already implemented; add cross-source summary tool |
| File/source management | storage, storage-ui | Already implemented; reuse source pipeline for import |
| Database queries | db | Already implemented; new queries for export |
| UI components | add-shadcn | Dialog, Switch, Button already available |
| Deployment | deploy-to-vercel, setup-vercel | Already configured |

## Open Gaps

- **Persona format parser** — custom code needed to map hackathon JSONL format (conversations.jsonl, calendar.jsonl, lifelog.jsonl, etc.) to CoreModel's source table schema
- **ZIP generation** — server-side ZIP creation for export endpoint (use `archiver` or built-in `zlib`)
- **Legal case corpus** — need to curate and write ~30-50 markdown case summaries (landmark cases with holdings, key excerpts, significance)
- **Cross-source summarizer** — utility function to aggregate imported persona data into a concise prompt-injectable summary
- **Consent toggle state** — client-side state for per-category import toggles (no backend persistence needed beyond what gets imported)

## Constraints / Assumptions

- No new database tables — imported persona data maps to existing `source` table
- Legal cases are static markdown files in `public/datasets/legal/`, not fetched from live APIs
- Consent is visual/UX only — no backend consent ledger, just import-time toggles
- Export bundles all user data from existing tables; no new data model
- Hackathon persona format follows the schema at DATASET_SCHEMA.md (lifelog, conversations, calendar, email, social, financial, files, profile)
- Stack unchanged: Next.js 16, React 19, Drizzle/Postgres, OpenAI, Bun
- Deadline: March 9th, 5pm submission
