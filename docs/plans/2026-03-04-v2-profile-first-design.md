# Core Model v2 -- Design Doc (Profile-First)

**Date:** 2026-03-04
**Status:** Draft
**Classification:** Internal

---

## 1. Overview

Core Model v2 is a profile-first adaptive learning platform. Users must complete a 12-screen Learning Profile assessment before accessing any study features. Once profiled, users organize learning into **Topics** (broad subject areas) and **Projects** (specific goals within a topic). Every project gets a dedicated AI agent with persistent session history that creates learning materials and schedules updates.

The system enforces a strict three-layer architecture, renamed for clarity:

1. **Observe** (append-only): raw learner behavior -- what the system saw happen.
2. **Analyze** (versioned): derived insights with uncertainty -- what the system thinks it means.
3. **Act** (versioned + auditable): decisions and interventions -- what the system does about it.

**AI boundary:** AI generates structured text/content only. AI never scores learners, computes analysis, or makes policy decisions.

---

## 2. The Three Layers (Observe / Analyze / Act)

### Why three layers?

Every adaptive decision follows a chain: something happened, we interpreted it, we acted on it. Separating these makes the system transparent and auditable.

### Layer 1: Observe (What We Saw)

Raw, immutable facts. Never edited, never deleted. This is the system's memory.

Examples:
- "You answered question #42 correctly in 3.2 seconds"
- "You predicted 80% confidence before attempting this problem"
- "You skipped Tuesday's practice block"
- "You completed the metacognition survey with these responses"

This layer stores: attempts, response times, confidence predictions, hint usage, session attendance, survey responses, file uploads.

**Key property:** append-only. Every observation is timestamped and permanent. You can always go back and see exactly what happened.

### Layer 2: Analyze (What We Think It Means)

Derived insights computed deterministically from observations. Every insight includes how confident the system is.

Examples:
- "Your mastery of eigenvalues is 0.62 (we're moderately confident: could be 0.41 to 0.81)"
- "You tend to be overconfident -- you predict 80% but score 55%"
- "Your cognitive load risk is high based on rising response times"
- "Your motivation support need is moderate based on declining attendance"

This layer stores: mastery estimates with uncertainty, calibration scores, risk assessments, construct inferences.

**Key property:** versioned snapshots. Each time we recompute, we create a new immutable version linked to its parent. You can diff any two versions to see what changed.

### Layer 3: Act (What We Do About It)

Deterministic rules that turn analysis into concrete actions. Every action is logged with its reasoning.

Examples:
- "Because your cognitive load risk is high, we reduced chunk size from 8 to 4 problems"
- "Because your calibration error is above threshold, we inserted reflection prompts every 3rd item"
- "Because your motivation support need increased, we switched to autonomy-supportive mode with choice sets"

This layer stores: policy decisions, learning guides, practice schedules, audit events.

**Key property:** fully auditable. Every recommendation links back to the analysis that triggered it and the observations behind that analysis. You can always ask "why did the system do this?" and get a concrete answer.

### The Chain

```
Observe: "Error rate rose from 15% to 40% over 3 sessions"
   |
Analyze: "Cognitive load risk increased to 0.68 (confidence: medium)"
   |
Act: "Reduced chunk size to 4 items, added worked examples"
```

This chain is stored for every adaptive decision. It is browsable in the Audit screen.

---

## 3. Profile-First User Flow

### Gate: Learning Profile Required

No dashboard, no topics, no projects, no agents until the 12-screen Learning Profile is complete. This is the foundation everything else builds on.

```
Sign Up -> Login -> 12-Screen Learning Profile -> Dashboard unlocked
```

If a user logs in without a completed profile, they are redirected to the profile wizard. There is no "skip" option.

### Flow After Profile

```
Learning Profile (gate)
  |
  v
Dashboard (Topics overview)
  |
  +-- Topic (e.g., "Linear Algebra")
  |     |
  |     +-- Project (e.g., "Exam Prep - Midterm")
  |     |     +-- Files & Resources (tagged to this project AND topic)
  |     |     +-- Project Agent (persistent chat + materials + schedule)
  |     |     +-- Practice Sessions
  |     |     +-- Learning Guide (7-day)
  |     |
  |     +-- Project (e.g., "Deep Dive - Eigenvalues")
  |     |     +-- Files & Resources
  |     |     +-- Project Agent
  |     |     +-- Practice Sessions
  |     |     +-- Learning Guide
  |     |
  |     +-- Topic-level Files & Resources
  |
  +-- Topic (e.g., "Machine Learning")
        |
        +-- Project (e.g., "Career Switch - Fundamentals")
              +-- ...
```

### The 12-Screen Learning Profile

Typeform-style, snap-scroll, vertical swipe. React Hook Form with loading spinners.

| Screen | Title | Input Type | What It Measures |
|--------|-------|-----------|-----------------|
| 1 | What are you studying? | Searchable select | Domain context |
| 2 | What's your goal? | Radio cards (exam/project/fluency/teach) | Goal type |
| 3 | How much time do you have? | Dual sliders (min/day + days/week) | Time budget |
| 4 | Any deadline? | Date picker (optional) | Time pressure |
| 5 | What have you seen before? | Multi-select chips | Prior exposure |
| 6 | How do you solve tricky problems? | Scenario cards + slider (CRT rotated) | Cognitive reflection tendency |
| 7 | How well do you know what you know? | Likert scale sliders (MAI) | Metacognitive awareness |
| 8 | How do you study? | Multi-select + rating (LASSI) | Study strategy repertoire |
| 9 | What drives you? | Slider bank (autonomy/competence/relatedness) | Motivational orientation |
| 10 | How do you prefer to see things? | Drag-rank + toggles | UX preferences (presentation only, not pedagogy) |
| 11 | Communication style | Quick Big Five sliders | Coaching tone (affects language only, never content/difficulty) |
| 12 | Review & Generate | Summary cards + "Create My Learning Profile" CTA | Confirmation |

After screen 12, the system:
1. Stores all responses as observations (Layer 1: Observe)
2. Runs initial analysis to compute baseline estimates (Layer 2: Analyze)
3. Fires policy rules to set initial learning parameters (Layer 3: Act)
4. Generates the Core Model JSON (the learner's "Learning DNA")
5. Redirects to the Dashboard

---

## 4. Topics and Projects

### Topics

A Topic is a broad subject area (e.g., "Linear Algebra", "Machine Learning", "Statistics").

- Created by the user
- Contains one or more Projects
- Files can be tagged at the topic level (shared across all projects in that topic)
- Has a knowledge graph built from all files tagged to it
- Mastery tracking is per-concept within the topic

### Projects

A Project is a specific learning goal within a topic (e.g., "Midterm Exam Prep", "Build a Neural Network", "Deep Dive: Bayesian Stats").

- Belongs to exactly one Topic
- Has its own files and resources (also inherits topic-level files)
- Gets a dedicated AI agent with persistent session history
- Has its own 7-day learning guide
- Has its own practice sessions
- Has its own audit trail

### File & Resource Tagging

Files and resources can be tagged to:
- A **Topic** (available to all projects in that topic)
- A **Project** (available only to that project, plus inherits topic files)
- Both (explicitly tagged to a specific project AND visible at topic level)

Tags are independent of topics/projects and provide cross-cutting organization (e.g., "lecture-notes", "problem-sets", "reference").

---

## 5. Per-Project Agents

Every project gets a dedicated AI agent. This is the primary interface for learning within a project.

### What the agent can do

1. **Create learning materials** -- flashcards, quizzes, summaries, worked examples, concept maps. All generated as structured artifacts via Zod schemas.
2. **Schedule learning updates** -- propose and adjust the 7-day learning guide based on progress, create spaced repetition reminders, suggest practice sessions.
3. **Answer questions** -- about the project's materials, concepts, and the learner's progress.
4. **Explain audit trails** -- why the system made specific recommendations, in plain language.

### Agent context

Each agent has access to:
- The learner's Core Model JSON (Learning DNA)
- All files tagged to the project and its parent topic
- The project's full session history (persistent, never reset)
- The project's current learning guide and practice schedule
- The project's analysis snapshot (mastery, calibration, risks)

### Session history

Agent conversations persist across sessions. When you return to a project, the agent remembers where you left off, what you discussed, and what materials it created. History is stored in Vercel KV (Redis) keyed by project ID + learner ID.

### Agent configuration

Each agent can be customized per project:
- Model selection (via AI Gateway)
- Abilities (which tools/artifact types are enabled)
- Coaching tone (derived from Big Five profile but overridable)
- Material format preferences (derived from screen 10 but overridable)

---

## 6. Architecture & Stack (Vercel-Native)

### Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Database | Vercel Postgres (Neon) | All Drizzle tables across 3 layers |
| Cache/Memory | Vercel KV (Upstash Redis) | Agent session history, session state |
| File Storage | Vercel Blob | Uploaded materials (PDFs, markdown, slides) |
| AI | Vercel AI Gateway | Single `AI_GATEWAY_API_KEY`, all models |
| Hosting | Vercel | Next.js 16 App Router |
| CLI | Vercel CLI | Project creation, deployment, linking |

### Application Stack

- **Next.js 16** App Router + React 19 + React Compiler
- **Tailwind v4** + shadcn/ui + Lucide icons
- **Drizzle ORM** + `drizzle-seed` for sample data
- **Vercel AI SDK** v5+ with `generateObject` (Zod-constrained)
- **React Hook Form** with loading spinners on all mutations
- **better-auth** for authentication
- **Biome** for lint/format
- **Playwright CLI** for e2e tests
- **evalite** for AI generation evals

### Key Boundaries

- API routes for all dynamic data (no server component data fetching for mutations)
- AI only generates text/structured output via Zod schemas
- All estimates store uncertainty (`posterior_sd`, `confidence_band`)
- Deterministic engines in `/lib/analyze/` and `/lib/act/`
- `useId` for React list keys (never index)

---

## 7. Database Schema (3 Layers + Content)

### Conventions

- ULID primary keys (TEXT)
- Derived rows include `model_version_id`, `profile_version_id`, `computed_at`
- Profile snapshots are immutable with `parent_profile_version_id`
- JSONB where flexibility is needed

### Layer 1: Observe (Append-Only)

**`learner`** -- learner_id PK, created_at, locale, timezone, profile_completed_at (nullable -- null means profile gate is active)

**`consent_bundle`** -- consent_id PK, learner_id FK, created_at, required_telemetry (default true), opt_in_mai, opt_in_lassi, opt_in_motivation, opt_in_big5_tone, opt_in_crt_rotated, opt_in_preferences_ux, policy_text_version, revoked_at

**`learning_profile_response`** -- response_id PK, learner_id FK, screen_index (1-12), screen_key, response_data JSONB, responded_at

**`topic`** -- topic_id PK, learner_id FK, name, description, domain_label, created_at, updated_at

**`project`** -- project_id PK, topic_id FK, learner_id FK, name, description, goal_type (exam|project|fluency|teach), deadline, minutes_per_day, days_per_week, prior_exposure_self_report JSONB, created_at, updated_at

**`concept`** -- concept_id PK, topic_id FK, name, description, difficulty_rank, tags TEXT[]

**`concept_prereq`** -- concept_id + prereq_concept_id composite PK, weight (default 1.0)

**`item`** -- item_id PK, topic_id FK, prompt_type (retrieval|application|near_transfer|reflection), stem JSONB, correct_answer JSONB, concept_ids TEXT[], difficulty, discrimination, form_family_id, is_sensitive

**`item_exposure`** -- exposure_id PK, learner_id FK, item_id FK, first_seen_at, times_seen, self_report_prior_exposure, contamination_flag

**`assessment_session`** -- session_id PK, project_id FK, learner_id FK, started_at, ended_at, session_type (baseline|practice|weekly_update|module), adaptive_algo_version

**`attempt`** -- attempt_id PK, session_id FK, learner_id FK, item_id FK, shown_at, answered_at, response JSONB, is_correct, latency_ms, hint_count, confidence_pre, confidence_post, error_type, repair_outcome (pass|fail|skipped), attempt_meta JSONB

**`instrument_run`** -- instrument_run_id PK, learner_id FK, session_id FK, instrument_type (MAI|LASSI|MSLQ|SDT_MINI|BIG5_TONE|CRT_ROTATED|PREFS_UX), instrument_version, started_at, ended_at, scoring_status

**`instrument_response`** -- instrument_response_id PK, instrument_run_id FK, item_key, response JSONB, responded_at

**`instrument_score`** -- instrument_score_id PK, instrument_run_id FK, scale_key, score, stderr, percentile, score_meta JSONB

**`adherence_event`** -- adherence_id PK, learner_id FK, project_id FK, guide_id FK, block_id FK, event_type (started|completed|skipped|rescheduled), occurred_at, meta JSONB

### Layer 2: Analyze (Versioned)

**`model_version`** -- model_version_id PK, created_at, model_family (mastery|calibration|dropout|load), version_label, params_ref JSONB

**`profile_version`** -- profile_version_id PK, learner_id FK, created_at, parent_profile_version_id (self-ref), summary_payload JSONB

**`mastery_estimate`** -- mastery_id PK, learner_id FK, concept_id FK, project_id FK, profile_version_id, model_version_id FK, posterior_mean, posterior_sd, credible_low, credible_high, last_updated_at, evidence_window JSONB

**`calibration_summary`** -- calibration_id PK, learner_id FK, project_id FK, profile_version_id, model_version_id FK, ece, brier_score, curve_points JSONB, computed_at

**`construct_inference`** -- inference_id PK, learner_id FK, profile_version_id, construct_key (cognitive_load_risk|self_regulation_risk|motivation_support_needed|...), estimate, uncertainty_sd, confidence_band (low|medium|high), model_version_id FK, evidence_refs JSONB, fastest_disambiguation JSONB, computed_at

**`review_queue_state`** -- queue_state_id PK, learner_id FK, project_id FK, profile_version_id, algorithm_version, state_payload JSONB, computed_at

### Layer 3: Act (Versioned, Auditable)

**`policy_version`** -- policy_version_id PK, created_at, version_label, ruleset_ref JSONB

**`policy_decision`** -- decision_id PK, learner_id FK, project_id FK, profile_version_id, policy_version_id FK, decision_key (pacing|spacing|feedback_style|study_skill_lesson|interleaving_level), decision_value JSONB, triggered_by JSONB, rationale, computed_at

**`learning_guide`** -- guide_id PK, project_id FK, learner_id FK, profile_version_id, created_at, horizon_days (default 7), guide_payload JSONB

**`guide_block`** -- block_id PK, guide_id FK, day_index (1..7), block_type (core_practice|skill_builder|metacog_routine|motivation_support), planned_minutes, concept_ids TEXT[], item_selector JSONB, completion_criteria JSONB, ordering

**`scheduled_update`** -- update_id PK, project_id FK, learner_id FK, agent_id FK, scheduled_for, update_type (guide_refresh|spaced_review|progress_check|reassessment), status (pending|sent|completed|skipped), payload JSONB, created_at

**`audit_event`** -- audit_id PK, learner_id FK, project_id FK, occurred_at, observation, observation_refs JSONB, inference_change JSONB, policy_change JSONB, user_visible_summary

**`measurement_plan`** -- plan_id PK, learner_id FK, project_id FK, profile_version_id, created_at, target_construct_key, reason, proposed_actions JSONB, expected_info_gain

### Content & Organization Tables

**`source_file`** -- file_id PK, uploaded_by FK, filename, mime_type, size_bytes, storage_url, uploaded_at, extraction_status (pending|processing|completed|failed), metadata JSONB

**`file_topic`** -- file_id + topic_id composite PK, added_at

**`file_project`** -- file_id + project_id composite PK, added_at

**`tag`** -- tag_id PK, name UNIQUE, color, created_at

**`file_tag`** -- file_id + tag_id composite PK

**`topic_tag`** -- topic_id + tag_id composite PK

**`project_tag`** -- project_id + tag_id composite PK

**`extracted_concept`** -- extracted_concept_id PK, file_id FK, concept_id FK, label, description, confidence, extraction_model_version, extracted_at

**`knowledge_graph_edge`** -- edge_id PK, source_concept_id, target_concept_id, relation_type (prerequisite|related|contains|extends), weight, provenance_file_id FK, created_at

**`agent_config`** -- agent_id PK, project_id FK, learner_id FK, name, model_id, abilities JSONB, tone_overrides JSONB, format_overrides JSONB, created_at, updated_at

**`agent_artifact`** -- artifact_id PK, agent_id FK, project_id FK, artifact_type (flashcard_set|quiz|text_content|summary|worked_example|concept_map), content JSONB, concept_ids TEXT[], created_at

---

## 8. Inference Engine (Analyze)

Located at `/lib/analyze/`:

- **`mastery.ts`** -- Bayesian Beta updates. Prior: Beta(1,1). Update: correct -> alpha++, incorrect -> beta++. Posterior mean = alpha/(alpha+beta). 90% credible interval from Beta quantiles.
- **`calibration.ts`** -- ECE: mean |confidence - accuracy| across bins. Brier: mean squared error. Calibration curve: binned confidence vs accuracy.
- **`constructs.ts`** -- cognitive_load_risk, self_regulation_risk, motivation_support_needed. All output estimate + uncertainty_sd + confidence_band + evidence_refs + fastest_disambiguation.
- **`dropout.ts`** -- Adherence-based risk from declining session completion and rescheduling patterns.
- **`index.ts`** -- `recomputeProfile(learnerId, projectId?)`: loadObservations -> computeMastery -> computeCalibration -> computeConstructs -> computeDropoutRisk -> persistProfile. Creates new immutable profile_version, writes all derived rows, emits audit_events for changes.

---

## 9. Policy Engine (Act)

Located at `/lib/act/`:

### v1 Ruleset (7 rules)

| # | Key | What It Checks | Condition | Confidence Gate | What It Does |
|---|-----|---------------|-----------|-----------------|-------------|
| R1 | pacing | Cognitive load risk | >= 0.6 | medium | Smaller chunks (4 items), more worked examples |
| R2 | pacing | Cognitive load risk | < 0.3 | medium | Larger chunks (8 items), fewer worked examples |
| R3 | spacing | Mastery uncertainty | posterior_sd > 0.15 | low | Shorter review intervals (0.7x multiplier) |
| R4 | metacog_insertion | Calibration error | ECE >= 0.12 | medium | Add prediction-reflection loops every 3rd item |
| R5 | study_skill_lesson | Self-regulation risk | >= 0.5 | medium | Insert 5-min time management lesson |
| R6 | feedback_style | Motivation support need | >= 0.6 | medium | Switch to autonomy-supportive mode with choices |
| R7 | interleaving_level | Cross-concept mastery | mean >= 0.5 | medium | Mix problem types within sessions (40% ratio) |

Rules fire only if the confidence gate is met. If confidence is too low, the system keeps its previous decision or uses a safe default. Every applied decision produces an audit_event with the full Observe -> Analyze -> Act chain.

---

## 10. Per-Project Agent System

### Agent Lifecycle

1. When a project is created, an agent_config row is created with defaults derived from the learner's profile (tone from Big Five, format preferences from screen 10).
2. The agent is available immediately in the project view.
3. Session history accumulates in Vercel KV, keyed by `agent:{agentId}:history`.
4. The agent can be reconfigured at any time without losing history.

### Agent Capabilities

| Capability | Description | Output Schema |
|-----------|-------------|---------------|
| Create Flashcards | Generate flashcard sets from project materials | `FlashcardSetSchema` |
| Create Quiz | Generate quiz with explanations | `QuizSchema` |
| Create Summary | Generate structured text content | `TextContentSchema` |
| Create Worked Example | Step-by-step problem solutions | `WorkedExampleSchema` |
| Refresh Guide | Regenerate 7-day learning guide | `GuideSchema` |
| Schedule Update | Create/modify scheduled learning reminders | `ScheduledUpdateSchema` |
| Explain Audit | Translate audit events into plain language | Free text |
| Answer Questions | Q&A about materials and progress | Free text |

### Scheduled Learning Updates

Agents can schedule future actions:
- **Guide refresh** -- regenerate the 7-day guide based on latest analysis
- **Spaced review reminder** -- notify the learner to review specific concepts
- **Progress check** -- summarize what changed since last session
- **Reassessment** -- suggest retaking specific profile screens if uncertainty is high

Scheduled updates are stored in the `scheduled_update` table and processed by a background job.

---

## 11. Screen Specifications

### `/` -- Landing Page
Trust contract messaging, 4 commitments, "Start Your Learning Profile" CTA. Redirects authenticated users with completed profiles to /dashboard, without profiles to /profile.

### `/login` -- Authentication
better-auth login. Dev mode: fake login button.

### `/profile` -- 12-Screen Learning Profile (Gate)
Full-screen typeform wizard. No navigation chrome, no dashboard access. Progress dots at top. Each screen validates before advancing. Screen 12 shows summary and "Create My Learning Profile" button. On completion, sets `learner.profile_completed_at` and redirects to /dashboard.

### `/profile/results` -- Profile Results
After profile creation, shows the generated Learning DNA:
- Observe pane: what the profile test captured
- Analyze pane: initial estimates with (wide) uncertainty bands
- Act pane: initial learning parameters the system will use

### `/dashboard` -- Topics Overview
Grid of topic cards. Each card shows: name, domain, project count, file count, overall mastery (with uncertainty bar). "Create Topic" CTA. Clicking a topic goes to `/dashboard/topics/[topicId]`.

### `/dashboard/topics/[topicId]` -- Topic Detail
- **Projects list** -- cards with name, goal type, progress, agent activity indicator
- **Topic files** -- files tagged to this topic (shared across all projects)
- **Knowledge graph** -- concepts and prerequisites from all topic files
- **Create Project** CTA

### `/dashboard/topics/[topicId]/projects/[projectId]` -- Project Workspace
Split layout:
- **Main area:** Tabbed view
  - **Agent** -- Chat + Canvas with persistent session history. Streaming responses, artifact rendering (flashcards, quizzes, text), attachments, model selection.
  - **Guide** -- 7-day learning guide with daily blocks. "Start Day N" CTA.
  - **Files** -- Project files + inherited topic files. Drag-drop upload with progress. Tag management.
  - **Progress** -- Mastery map, calibration curve, construct estimates (all with uncertainty). Version diffs.
  - **Audit** -- Per-recommendation audit trail (Observe -> Analyze -> Act chain). Chronological and by-concept views.
- **Sidebar:** Project settings, agent config, scheduled updates list

### `/dashboard/topics/[topicId]/projects/[projectId]/session/[sessionId]` -- Practice Session
Retrieval practice items, reflection loops, effort-aware pacing. Session wrap: mastery delta, calibration delta, policy changes with plain-language explanations.

### `/dashboard/tags` -- Tag Management
Grid with create form (name, color), inline edit, delete with confirm. Shows which files/topics/projects use each tag.

### `/dashboard/settings` -- User Settings
Profile management, retake profile screens, data export, account deletion.

---

## 12. API Routes

- `POST /api/auth/*` -- better-auth handlers
- `GET /api/profile/status` -- Check if profile is complete (gate check)
- `POST /api/profile/responses` -- Save profile screen responses
- `POST /api/profile/generate` -- Generate Core Model JSON from completed profile
- `GET /api/profile/[id]` -- Profile snapshot (JSON envelope)
- `POST /api/profile/recompute` -- Trigger analysis recompute
- `CRUD /api/topics` -- Topic management
- `CRUD /api/topics/[topicId]/projects` -- Project management within a topic
- `CRUD /api/files` -- File upload (Vercel Blob) + metadata
- `POST /api/files/[fileId]/tag` -- Tag a file to topic/project/tag
- `CRUD /api/tags` -- Tag CRUD
- `POST /api/sessions` -- Session lifecycle
- `POST /api/attempts` -- Attempt submission + telemetry
- `POST /api/instruments` -- Instrument responses
- `POST /api/guide/generate` -- AI guide generation (per project)
- `CRUD /api/agents` -- Agent config CRUD
- `POST /api/agents/[agentId]/chat` -- Chat endpoint (AI SDK streaming)
- `GET /api/agents/[agentId]/artifacts` -- List agent-created artifacts
- `CRUD /api/agents/[agentId]/schedule` -- Scheduled update management
- `GET /api/audit/[projectId]` -- Audit log for a project

---

## 13. Material Ingestion Pipeline

1. **Upload** -- File uploaded to Vercel Blob; `source_file` row created with `extraction_status = 'pending'`; file tagged to topic and/or project via `file_topic`/`file_project`
2. **Content extraction** -- Background: extract text by MIME type; status -> `'processing'`; save extracted markdown to Vercel Blob
3. **Concept identification** -- AI SDK `generateObject` with `ExtractedConceptOutput` Zod schema; stored in `extracted_concept` with confidence; concepts linked to the topic
4. **Knowledge graph construction** -- Concepts linked via `knowledge_graph_edge` with typed relations and provenance
5. **Status update** -- `extraction_status` -> `'completed'` or `'failed'`

---

## 14. AI Generation Pipeline

All AI calls use Vercel AI SDK `generateObject` with strict Zod schemas via AI Gateway.

### Schemas

- **`GuideSchema`** -- summary, dailyPlan[dayIndex, blocks[type, minutes, description]]
- **`FlashcardSetSchema`** -- setId, title, conceptIds, cards[cardId, front, back, difficulty, conceptId]
- **`QuizSchema`** -- quizId, title, conceptIds, questions[questionId, stem, options[isCorrect, explanation], conceptId, bloomLevel]
- **`TextContentSchema`** -- contentId, title, conceptIds, sections[heading, body, keyTerms]
- **`WorkedExampleSchema`** -- exampleId, title, conceptId, steps[stepNumber, instruction, work, explanation]
- **`ScheduledUpdateSchema`** -- updateType, scheduledFor, payload

### Agent Pattern

- Each project has one agent with persistent session history
- Agent consumes Core Model JSON + project files + analysis snapshot as context
- Outputs structured JSON conforming to artifact Zod schemas
- Chat memory in Vercel KV (Redis), keyed by agent ID
- Streaming responses via AI SDK

---

## 15. Sample Personas (5, seeded via drizzle-seed)

Each persona has a completed learning profile, at least one topic with projects, files, and agent history.

| Name | Topic | Project | Goal | Key Characteristics |
|------|-------|---------|------|---------------------|
| Maya Chen | Linear Algebra | Midterm Exam Prep | exam | Moderate mastery (0.55 +/- 0.12), overconfident (ECE 0.18), 45 min/day |
| Carlos Rivera | Machine Learning | Career Switch Fundamentals | fluency | Low exposure, wide uncertainty, high self-reg risk, 30 min/day |
| Dr. Priya Sharma | Curriculum Design | Teaching Portfolio | teach | High mastery (0.82 +/- 0.06), excellent calibration, 20 min/day |
| Jordan Kim | Statistics | Capstone Project | project | Moderate mastery (0.48 +/- 0.15), severely overconfident, 40 min/day |
| Aisha Okafor | Data Science | Fluency Sprint | fluency | Dropout risk, declining adherence, needs autonomy support, 25 min/day |

Each persona seeded with: completed profile responses, consent, topic, project, 20-50 attempts, mastery estimates, calibration summaries, construct inferences, policy decisions, learning guide, audit events, uploaded files, agent config, 5-10 agent chat messages, 2-3 agent artifacts.

---

## 16. Playwright E2E Tests

```
test("user without profile is redirected to profile wizard")
test("user can complete 12-screen learning profile")
test("user with profile can access dashboard")
test("user can create a topic and project")
test("user can upload files to a project")
test("user can chat with a project agent")
test("agent can create learning materials")
test("user can view audit trail for a recommendation")
```

---

## 17. Event Taxonomy

All events stored in the Observe layer with learner_id + timestamp.

| Event | Key Fields |
|-------|-----------|
| profile.screen.completed | learnerId, screenIndex, screenKey |
| profile.completed | learnerId, profileVersionId |
| topic.created | topicId, learnerId |
| project.created | projectId, topicId, learnerId |
| session.started | sessionId, projectId, sessionType |
| session.ended | sessionId, endedAt |
| attempt.submitted | attemptId, sessionId, itemId, isCorrect, latencyMs |
| confidence.pre | attemptId, confidencePre |
| confidence.post | attemptId, confidencePost |
| reflection.submitted | attemptId, errorType, reflectionText |
| repair.completed | attemptId, repairOutcome |
| guide.block.started | guideId, blockId, projectId |
| guide.block.completed | guideId, blockId, projectId |
| guide.block.skipped | guideId, blockId, reason |
| profile.recomputed | profileVersionId, parentProfileVersionId |
| policy.decision.applied | decisionId, projectId, decisionKey |
| agent.message.sent | agentId, projectId, messageType |
| agent.artifact.created | agentId, projectId, artifactType, artifactId |
| agent.update.scheduled | agentId, projectId, updateType, scheduledFor |
| file.uploaded | fileId, topicId, projectId |
| file.extraction.completed | fileId, conceptCount |

---

## 18. Zod Contracts

### Observe Inputs
- `ProfileResponseInput` -- screenIndex, screenKey, responseData
- `AttemptInput` -- sessionId, itemId, response, latencyMs, confidencePre/Post, errorType, repairOutcome, hintCount
- `AdherenceEventInput` -- projectId, guideId, blockId, eventType, meta
- `InstrumentResponseInput` -- instrumentRunId, itemKey, response

### Analyze Outputs
- `ProfileSnapshotSchema` -- profileVersionId, createdAt, observeSummary (masteryMap, calibration), analyzeResults[], actDecisions[], guideRef
- `PolicyDecisionSchema` -- decisionKey, decisionValue, triggeredBy, rationale, policyVersionId

### AI Outputs (Schema-Constrained)
- `GuideSchema`, `FlashcardSetSchema`, `QuizSchema`, `TextContentSchema`, `WorkedExampleSchema`, `ScheduledUpdateSchema`

### Material Ingestion
- `FileUploadInput` -- filename, mimeType, sizeBytes, tags, topicId, projectId
- `ExtractedConceptOutput` -- label, description, confidence, relatedConcepts[]

---

## 19. Open Gaps

- Node graph visualization library selection (candidate: reactflow or d3-force)
- PDF text extraction in serverless (candidate: Vercel AI Gateway document processing or pdf-parse)
- Video URL handling and transcript extraction
- CRT item bank (need 3+ rotated forms per item)
- Instrument licensing (MAI, LASSI commercial terms)
- evalite integration specifics
- Scheduled update delivery mechanism (push notifications, email, in-app)
- Agent session history size limits and summarization strategy
