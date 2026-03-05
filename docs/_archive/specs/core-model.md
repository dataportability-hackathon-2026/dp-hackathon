# Core Model Platform -- Spec

**Created:** 2026-03-04
**Status:** APPROVED

## Mission

- An evidence-based adaptive learning platform for Masters-level autodidacts that measures behavior with uncertainty, derives inferences deterministically, and generates auditable learning guides -- deployed Vercel-native.

## Main Features

- **3-layer data architecture:** Evidence (append-only) -> Inference (versioned) -> Policy (auditable)
- **12-step training wizard:** Typeform-style snap-scroll form with sliders, multi-select, Likert scales for construct scoring
- **Material ingestion pipeline:** Drag-drop upload -> Vercel Blob storage -> text extraction -> concept identification -> knowledge graph construction
- **Inference engine:** Bayesian Beta mastery updates, ECE/Brier calibration, construct risk estimates -- all with uncertainty
- **Policy engine:** 7 deterministic rules with confidence gating, producing audit events
- **7-day learning guide generation:** AI SDK `generateObject` with Zod-constrained output
- **Chat + canvas agent:** Streaming AI chat with Redis memory, artifact rendering (flashcards, quizzes, text, video)
- **Audit trail:** First-class UI showing observation -> inference -> policy chain for every recommendation
- **5 sample personas** seeded via `drizzle-seed` with full evidence/inference/policy data
- **Playwright e2e tests:** Login, training, upload, chat

## Major User Flows

- **Onboard:** Upload materials -> set domain/goal/time budget -> 10-15 min adaptive baseline
- **Profile:** Behavior-first assessment with confidence tracking -> optional instruments (MAI, LASSI, SDT, CRT, Big Five) -> 3-pane profile (Evidence/Inference/Policy)
- **Train:** 12-step form wizard captures construct scores via sliders/multi-select -> generates Core Model JSON on save
- **Upload:** Drag-drop files -> progress spinners -> background extraction -> concept graph built
- **Learn:** 7-day guide with daily blocks -> prediction-attempt-reflection-repair loops -> session wraps showing deltas
- **Chat:** Agent reads materials (markdown from Blob) + Core Model JSON -> streaming responses -> artifacts in canvas
- **Audit:** Browse audit log chronologically or by topic -> profile version diffs -> model card

## Required Screens

- `/` -- Landing page with trust contract + CTA
- `/login` -- better-auth login (dev fake login button)
- `/dashboard` -- Filterable project grid (CRUD)
- `/dashboard/core-model` -- Node graph + 12-step form wizard + JSON panel
- `/dashboard/tags` -- Tag CRUD grid
- `/dashboard/files` -- File datatable with drag-drop upload, bulk edit, preview
- `/dashboard/profile` -- 3-pane Evidence/Inference/Policy view
- `/dashboard/guide` -- 7-day learning guide display
- `/dashboard/session/[id]` -- Practice session + wrap
- `/dashboard/audit` -- Audit log + model card
- `/dashboard/agents/[agentId]` -- Split panel: sidebar config + chat/canvas

## API Routes

- `POST /api/auth/*` -- better-auth handlers
- `CRUD /api/projects` -- Project management
- `CRUD /api/tags` -- Tag CRUD
- `CRUD /api/files` -- File upload (Vercel Blob) + metadata
- `CRUD /api/collections` -- Collection CRUD
- `POST /api/sessions` -- Session lifecycle
- `POST /api/attempts` -- Attempt submission + telemetry
- `POST /api/instruments` -- Instrument responses
- `GET /api/profile/[id]` -- Profile snapshot (JSON envelope)
- `POST /api/profile/recompute` -- Trigger inference recompute
- `POST /api/guide/generate` -- AI guide generation
- `CRUD /api/agents` -- Agent config CRUD
- `POST /api/agents/[id]/chat` -- Chat endpoint (AI SDK streaming)
- `POST /api/core-model/generate` -- Generate core model JSON from form data

## Required Features (Skills Mapping)

| Requirement | Skill(s) | Notes |
|-------------|----------|-------|
| Auth | auth, auth-dev | better-auth, dev fake login |
| Chat + Canvas | ai-chat, ai-core | AI SDK streaming, Redis memory, artifact rendering |
| File Upload | -- | Vercel Blob, drag-drop with progress |
| Database | -- | Drizzle ORM, Vercel Postgres, 30 tables |
| Forms | -- | React Hook Form, 12-step wizard, sliders/multi-select |
| Deployment | vercel:setup, vercel:deploy | Vercel CLI, Vercel-native infra |
| Testing | -- | Playwright CLI for e2e |
| AI Generation | ai-core | AI SDK generateObject + Zod schemas |
| Evals | -- | evalite library |

## Data Model

- **30 tables** across 3 layers + content ingestion (see design doc for full schema)
- **Layer A (Evidence):** learner, consent_bundle, learning_goal, concept, concept_prereq, item, item_exposure, assessment_session, attempt, instrument_run, instrument_response, instrument_score, adherence_event
- **Layer B (Inference):** model_version, profile_version, mastery_estimate, calibration_summary, construct_inference, review_queue_state
- **Layer C (Policy):** policy_version, policy_decision, learning_guide, guide_block, audit_event, measurement_plan
- **Content:** source_file, source_collection, collection_file, extracted_concept, knowledge_graph_edge, tag, file_tag, project, project_file

## Sample Personas (5, seeded via drizzle-seed)

| Name | Domain | Goal | Key Characteristics |
|------|--------|------|---------------------|
| Maya Chen | Linear Algebra | Exam prep | Moderate mastery, poor calibration (overconfident), 45 min/day |
| Carlos Rivera | Machine Learning | Career switch | Low exposure, wide uncertainty, high self-reg risk, 30 min/day |
| Dr. Priya Sharma | Curriculum Design | Teaching | High mastery, excellent calibration, 20 min/day |
| Jordan Kim | Statistics | Project | Moderate mastery, severely overconfident, needs metacog loops, 40 min/day |
| Aisha Okafor | Data Science | Fluency | Dropout risk, needs autonomy support, 25 min/day |

Each persona seeded with: consent, goal, 20-50 attempts, mastery estimates, calibration summaries, construct inferences, policy decisions, learning guide, audit events, uploaded files.

## Inference Engine

- `/lib/inference/mastery.ts` -- Bayesian Beta posterior updates per concept
- `/lib/inference/calibration.ts` -- ECE + Brier score from confidence/accuracy pairs
- `/lib/inference/constructs.ts` -- cognitive_load_risk, self_regulation_risk, motivation_support_needed
- `/lib/inference/dropout.ts` -- Adherence-based risk scoring
- `/lib/inference/index.ts` -- `recomputeProfile()` orchestrator

## Policy Engine (7 Rules)

- R1/R2: Pacing by cognitive load risk (chunk size + worked examples)
- R3: Spacing by mastery uncertainty (interval multiplier)
- R4: Metacognitive loop insertion by calibration error (ECE threshold)
- R5: Study-skill lesson by self-regulation risk
- R6: Feedback style by motivation support need (autonomy-supportive)
- R7: Interleaving by cross-concept mastery

All rules confidence-gated. Every fired rule produces an audit_event.

## Open Gaps

- Node graph visualization library selection (candidate: reactflow or d3-force)
- PDF text extraction in serverless (candidate: Vercel AI Gateway document processing or pdf-parse)
- Video URL handling and transcript extraction
- CRT item bank (need 3+ rotated forms per item)
- Instrument licensing (MAI, LASSI commercial terms)
- evalite integration specifics

## Constraints / Assumptions

- **Vercel-native:** Vercel Postgres, Vercel KV (Redis), Vercel Blob, Vercel AI Gateway, Vercel CLI for deploy
- **AI boundary:** AI generates text only; never scores, infers, or decides
- **Stack:** Next.js 16, React 19, Tailwind v4, shadcn/ui, Drizzle, better-auth, Biome, bun
- **Forms:** React Hook Form with loading spinners on all mutations
- **Keys:** `useId` for React list keys (never index)
- **Testing:** Playwright CLI only, local dev environment
- **No Docker** -- fully Vercel-managed infrastructure
