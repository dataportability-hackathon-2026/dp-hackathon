# Data Portability Hackathon Alignment — Design

## Track: 2 — AI Companions with Purpose

**Pitch**: CoreModel is an AI study companion that ingests a student's portable personal data — study history, calendar, conversation logs — and combines it with curated legal/academic source material to deliver adaptive tutoring, personalized study plans, and learning artifacts. Value flows to the student, not a platform.

## Change 1: Persona Data Importer

A new "Import Study Data" flow accessible from the dashboard. User selects a hackathon persona (or uploads their own export). A consent dialog shows data categories with toggles (calendar, conversations, lifelog, email, financial, social). On confirm, the selected data is ingested as sources into the current topic.

**Implementation**:
- New component: `PersonaImportDialog` — file picker or persona selector, consent toggles, import
- New API route: `POST /api/import` — accepts persona JSON/JSONL files, maps them to the existing `source` table entries
- Parser utilities for the hackathon persona format (conversations.jsonl, calendar.jsonl, lifelog.jsonl, etc.)
- Each imported category becomes a source document the AI can reference during chat/artifact generation

## Change 2: Data Export Bundle

A "Download My Data" button in the profile/settings area. Generates a ZIP containing all user data: sources, artifacts, assessment results, conversation history, preferences — in portable JSON format.

**Implementation**:
- New API route: `GET /api/export` — queries all user tables, bundles into JSON files, returns ZIP
- Button added to existing `ProfileSheetContent`

## Change 3: Legal Seed Data

Pre-loaded corpus of ~30-50 landmark legal documents covering Constitutional Law, Data Privacy, IP, and Torts. Available as a "Law Library" source collection that can be added to any topic.

**Implementation**:
- Curated markdown/text files in `public/datasets/legal/` (case summaries, holdings, key excerpts)
- New entries in `topics.ts` for law-specific topics (Constitutional Law, Data Privacy Law, Contracts, Torts)
- Seed script or "Add Law Library" button that bulk-creates source entries from the bundled files

## Change 4: Cross-Source Insight Prompt Enhancement

Update the AI system prompt to explicitly reference imported persona data when generating study plans and artifacts. When a user has imported calendar + conversation + lifelog data, the AI surfaces cross-source patterns (e.g., "Your study sessions drop off after back-to-back calendar events" or "Your AI conversation history shows recurring questions about due process — let's focus there").

**Implementation**:
- Modify the existing chat system prompt to include imported data context
- Add a `getImportedDataSummary()` utility that summarizes imported persona data for prompt injection
- No new UI — the AI naturally surfaces insights during tutoring

## What stays the same

- CoreModel branding
- Existing assessment/cognitive profiling flow
- Voice agent + artifact generation
- Billing, auth, preferences
- All existing UI components

## Demo Narrative

Meet Maya — a law student preparing for her Constitutional Law final. She exports her study data from other platforms and imports it into CoreModel. She reviews what's being imported, toggles off financial data she doesn't want to share, and confirms. CoreModel combines her study patterns with a curated legal case library to generate an adaptive 7-day study plan. During voice tutoring, the AI notices from her conversation history that she keeps revisiting equal protection clause questions — so it generates targeted flashcards and a worked example on Brown v. Board. When she's done, she downloads all her data as a portable bundle. Her data came in on her terms, created value for her, and leaves with her.

## Estimated Scope

| Change | New files | Modified files |
|---|---|---|
| Persona Importer | ~3 | ~1 |
| Data Export | ~1 | ~1 |
| Legal Seed Data | ~30-50 static files + 1 utility | ~1 |
| Cross-Source Prompts | ~1 | ~2 |
| **Total** | **~5 code files + static data** | **~5** |
