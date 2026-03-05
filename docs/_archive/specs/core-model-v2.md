# Core Model v2 -- Spec (Profile-First)

**Created:** 2026-03-04
**Status:** Draft

## Mission

An evidence-based adaptive learning platform where users first build a Learning Profile (12-screen assessment), then organize study into Topics and Projects -- each with a dedicated AI agent that creates materials and schedules learning updates. All recommendations are traceable through three layers: Observe (what happened) -> Analyze (what it means) -> Act (what to do).

## Key Change from v1

**Profile-first gate.** The 12-screen Learning Profile is mandatory before any dashboard access. No topics, no projects, no agents until the profile exists. This ensures every learner has baseline data before the system makes any recommendations.

**Topic > Project hierarchy.** Replaces the flat project grid. Topics are broad subject areas; Projects are specific goals within them. Files tag to both levels.

**Per-project agents.** Each project gets a dedicated AI agent with persistent session history. Agents create learning materials AND schedule learning updates. Replaces the single shared agent model.

**Renamed layers.** Evidence/Inference/Policy -> Observe/Analyze/Act. Same architecture, clearer language.

## Main Features

- **Profile gate:** 12-screen typeform wizard required before dashboard access
- **3-layer data architecture:** Observe (append-only) -> Analyze (versioned) -> Act (auditable)
- **Topic > Project hierarchy:** Topics contain Projects; files tag to both
- **Per-project AI agents:** Persistent session history, material creation, learning schedule management
- **Material ingestion pipeline:** Drag-drop upload -> Vercel Blob -> text extraction -> concept identification -> knowledge graph
- **Analyze engine:** Bayesian Beta mastery updates, ECE/Brier calibration, construct risk estimates -- all with uncertainty
- **Act engine:** 7 deterministic rules with confidence gating, producing audit events
- **7-day learning guide generation:** AI SDK `generateObject` with Zod-constrained output per project
- **Scheduled learning updates:** Agent-managed reminders for reviews, guide refreshes, reassessments
- **Audit trail:** First-class UI showing Observe -> Analyze -> Act chain for every recommendation
- **5 sample personas** seeded via `drizzle-seed` with full profiles, topics, projects, agent history

## Major User Flows

1. **Sign up / Login** -> profile gate check
2. **Profile** -> 12-screen wizard -> Core Model JSON generated -> dashboard unlocked
3. **Create Topic** -> name, domain, optional files
4. **Create Project** -> within a topic, set goal/time/deadline, upload files
5. **Agent interaction** -> chat with project agent, request materials, schedule updates
6. **Learn** -> 7-day guide with daily blocks -> practice sessions -> session wraps
7. **Track** -> mastery map, calibration curve, uncertainty narrowing over time
8. **Audit** -> browse Observe -> Analyze -> Act chains per project

## Required Screens

- `/` -- Landing page with trust contract + "Start Your Learning Profile" CTA
- `/login` -- better-auth login (dev fake login button)
- `/profile` -- 12-screen typeform wizard (mandatory gate)
- `/profile/results` -- Profile results: Observe / Analyze / Act panes
- `/dashboard` -- Topic grid with mastery overview
- `/dashboard/topics/[topicId]` -- Topic detail: projects list, topic files, knowledge graph
- `/dashboard/topics/[topicId]/projects/[projectId]` -- Project workspace (tabbed: Agent, Guide, Files, Progress, Audit)
- `/dashboard/topics/[topicId]/projects/[projectId]/session/[sessionId]` -- Practice session + wrap
- `/dashboard/tags` -- Tag CRUD grid
- `/dashboard/settings` -- User settings, profile retake, data export

## API Routes

- `POST /api/auth/*` -- better-auth handlers
- `GET /api/profile/status` -- Profile gate check
- `POST /api/profile/responses` -- Save profile screen responses
- `POST /api/profile/generate` -- Generate Core Model JSON
- `GET /api/profile/[id]` -- Profile snapshot
- `POST /api/profile/recompute` -- Trigger analysis recompute
- `CRUD /api/topics` -- Topic management
- `CRUD /api/topics/[topicId]/projects` -- Project management
- `CRUD /api/files` -- File upload (Vercel Blob) + metadata
- `POST /api/files/[fileId]/tag` -- Tag file to topic/project/tag
- `CRUD /api/tags` -- Tag CRUD
- `POST /api/sessions` -- Session lifecycle
- `POST /api/attempts` -- Attempt submission + telemetry
- `POST /api/instruments` -- Instrument responses
- `POST /api/guide/generate` -- AI guide generation (per project)
- `CRUD /api/agents` -- Agent config CRUD
- `POST /api/agents/[agentId]/chat` -- Chat endpoint (AI SDK streaming)
- `GET /api/agents/[agentId]/artifacts` -- List artifacts
- `CRUD /api/agents/[agentId]/schedule` -- Scheduled updates
- `GET /api/audit/[projectId]` -- Audit log

## Required Features (Skills Mapping)

| Requirement | Skill(s) | Notes |
|-------------|----------|-------|
| Auth | auth, auth-dev | better-auth, dev fake login |
| Profile Gate | -- | Middleware redirect if profile incomplete |
| Chat + Canvas | ai-chat, ai-core | AI SDK streaming, Redis memory, artifact rendering |
| File Upload | -- | Vercel Blob, drag-drop with progress |
| Database | -- | Drizzle ORM, Vercel Postgres |
| Forms | -- | React Hook Form, 12-step wizard, sliders/multi-select |
| Deployment | vercel:setup, vercel:deploy | Vercel CLI, Vercel-native infra |
| Testing | -- | Playwright CLI for e2e |
| AI Generation | ai-core | AI SDK generateObject + Zod schemas |
| Scheduling | -- | Background job for scheduled updates |

## Data Model

### Layer 1: Observe (append-only -- what the system saw)

- `learner` (with `profile_completed_at` gate field)
- `consent_bundle`
- `learning_profile_response` (per-screen responses from the 12-screen wizard)
- `topic`, `project`
- `concept`, `concept_prereq`
- `item`, `item_exposure`
- `assessment_session`, `attempt`
- `instrument_run`, `instrument_response`, `instrument_score`
- `adherence_event`

### Layer 2: Analyze (versioned -- what the system thinks it means)

- `model_version`
- `profile_version`
- `mastery_estimate` (posterior + uncertainty, scoped to project)
- `calibration_summary` (ECE, Brier, curve, scoped to project)
- `construct_inference` (estimate + uncertainty + evidence refs)
- `review_queue_state`

### Layer 3: Act (auditable -- what the system does about it)

- `policy_version`
- `policy_decision` (scoped to project)
- `learning_guide`, `guide_block` (scoped to project)
- `scheduled_update` (agent-managed future actions)
- `audit_event` (scoped to project)
- `measurement_plan`

### Content & Organization

- `source_file`
- `file_topic`, `file_project` (dual tagging)
- `tag`, `file_tag`, `topic_tag`, `project_tag`
- `extracted_concept`, `knowledge_graph_edge`
- `agent_config` (per project)
- `agent_artifact` (materials created by agents)

## Sample Personas (5, seeded via drizzle-seed)

| Name | Topic | Project | Goal | Key Characteristics |
|------|-------|---------|------|---------------------|
| Maya Chen | Linear Algebra | Midterm Exam Prep | exam | Moderate mastery, overconfident, 45 min/day |
| Carlos Rivera | Machine Learning | Career Switch Fundamentals | fluency | Low exposure, wide uncertainty, high self-reg risk, 30 min/day |
| Dr. Priya Sharma | Curriculum Design | Teaching Portfolio | teach | High mastery, excellent calibration, 20 min/day |
| Jordan Kim | Statistics | Capstone Project | project | Moderate mastery, severely overconfident, 40 min/day |
| Aisha Okafor | Data Science | Fluency Sprint | fluency | Dropout risk, needs autonomy support, 25 min/day |

Each persona seeded with: completed profile (all 12 screens), topic, project, attempts, mastery/calibration/construct data, policy decisions, guide, audit events, files, agent config, agent chat history, agent artifacts.

## Analyze Engine

- `/lib/analyze/mastery.ts` -- Bayesian Beta posterior updates per concept per project
- `/lib/analyze/calibration.ts` -- ECE + Brier score from confidence/accuracy pairs
- `/lib/analyze/constructs.ts` -- cognitive_load_risk, self_regulation_risk, motivation_support_needed
- `/lib/analyze/dropout.ts` -- Adherence-based risk scoring
- `/lib/analyze/index.ts` -- `recomputeProfile()` orchestrator

## Act Engine (7 Rules)

| # | What It Checks | When It Fires | What It Does |
|---|---------------|---------------|-------------|
| R1 | Cognitive load risk | >= 0.6 (medium confidence) | Smaller chunks, more worked examples |
| R2 | Cognitive load risk | < 0.3 (medium confidence) | Larger chunks, fewer worked examples |
| R3 | Mastery uncertainty | posterior_sd > 0.15 | Shorter review intervals |
| R4 | Calibration error | ECE >= 0.12 (medium confidence) | Prediction-reflection loops every 3rd item |
| R5 | Self-regulation risk | >= 0.5 (medium confidence) | Insert study-skill lesson |
| R6 | Motivation support need | >= 0.6 (medium confidence) | Autonomy-supportive mode with choices |
| R7 | Cross-concept mastery | mean >= 0.5 (medium confidence) | Mix problem types in sessions |

All rules confidence-gated. Every fired rule produces an audit_event with the full Observe -> Analyze -> Act chain.

## Constraints / Assumptions

- **Vercel-native:** Vercel Postgres, Vercel KV (Redis), Vercel Blob, Vercel AI Gateway, Vercel CLI
- **AI boundary:** AI generates text only; never scores, analyzes, or decides
- **Stack:** Next.js 16, React 19, Tailwind v4, shadcn/ui, Drizzle, better-auth, Biome, bun
- **Forms:** React Hook Form with loading spinners on all mutations
- **Keys:** `useId` for React list keys (never index)
- **Profile gate:** Middleware enforces profile completion before dashboard access
- **Testing:** Playwright CLI only, local dev environment
- **No Docker** -- fully Vercel-managed infrastructure

## Open Gaps

- Node graph visualization library
- PDF text extraction in serverless
- CRT item bank (3+ rotated forms)
- Instrument licensing (MAI, LASSI)
- Scheduled update delivery (push/email/in-app)
- Agent history summarization for long sessions
- evalite integration specifics
