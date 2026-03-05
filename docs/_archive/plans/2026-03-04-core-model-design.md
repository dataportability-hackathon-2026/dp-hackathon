# Core Model Platform -- Design Doc

**Date:** 2026-03-04
**Status:** APPROVED
**Classification:** Internal

---

## 1. Overview

Core Model is an evidence-based, uncertainty-native adaptive learning platform for Masters-level autodidacts. It measures behavioral evidence, derives inferences with explicit uncertainty, and generates actionable learning guides through auditable policy decisions.

The system enforces a strict three-layer architecture:

1. **Evidence Layer** (append-only): raw learner behavior -- attempts, latency, confidence, adherence, instrument responses.
2. **Inference Layer** (versioned): deterministic estimates with uncertainty -- mastery posteriors, calibration scores, construct risks.
3. **Policy Layer** (versioned + auditable): deterministic rules that choose interventions and produce 7-day guides.

**AI boundary:** AI generates structured text/content only. AI never scores learners, computes inferences, or fires policy rules.

---

## 2. Architecture & Stack (Vercel-Native)

### Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Database | Vercel Postgres (Neon) | All 30 Drizzle tables across 3 layers |
| Cache/Memory | Vercel KV (Upstash Redis) | Chat conversation memory, session state |
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
- Deterministic engines in `/lib/inference/` and `/lib/policy/`
- `useId` for React list keys (never index)

---

## 3. Database Schema (30 Tables, 3 Layers)

### Conventions

- ULID primary keys (TEXT)
- Derived rows include `model_version_id`, `profile_version_id`, `computed_at`
- Profile snapshots are immutable with `parent_profile_version_id`
- JSONB where flexibility is needed

### Layer A: Evidence (Append-Only)

**`learner`** -- learner_id PK, created_at, locale, timezone

**`consent_bundle`** -- consent_id PK, learner_id FK, created_at, required_telemetry (default true), opt_in_mai, opt_in_lassi, opt_in_motivation, opt_in_big5_tone, opt_in_crt_rotated, opt_in_preferences_ux, policy_text_version, revoked_at

**`learning_goal`** -- goal_id PK, learner_id FK, created_at, domain_label, goal_type (exam|project|fluency|teach), deadline, minutes_per_day, days_per_week, prior_exposure_self_report JSONB

**`concept`** -- concept_id PK, domain_label, name, description, difficulty_rank, tags TEXT[]

**`concept_prereq`** -- concept_id + prereq_concept_id composite PK, weight (default 1.0)

**`item`** -- item_id PK, domain_label, prompt_type (retrieval|application|near_transfer|reflection), stem JSONB, correct_answer JSONB, concept_ids TEXT[], difficulty, discrimination, form_family_id, is_sensitive

**`item_exposure`** -- exposure_id PK, learner_id FK, item_id FK, first_seen_at, times_seen, self_report_prior_exposure, contamination_flag

**`assessment_session`** -- session_id PK, learner_id FK, goal_id FK, started_at, ended_at, session_type (baseline|practice|weekly_update|module), adaptive_algo_version

**`attempt`** -- attempt_id PK, session_id FK, learner_id FK, item_id FK, shown_at, answered_at, response JSONB, is_correct, latency_ms, hint_count, confidence_pre, confidence_post, error_type, repair_outcome (pass|fail|skipped), attempt_meta JSONB

**`instrument_run`** -- instrument_run_id PK, learner_id FK, session_id FK, instrument_type (MAI|LASSI|MSLQ|SDT_MINI|BIG5_TONE|CRT_ROTATED|PREFS_UX), instrument_version, started_at, ended_at, scoring_status

**`instrument_response`** -- instrument_response_id PK, instrument_run_id FK, item_key, response JSONB, responded_at

**`instrument_score`** -- instrument_score_id PK, instrument_run_id FK, scale_key, score, stderr, percentile, score_meta JSONB

**`adherence_event`** -- adherence_id PK, learner_id FK, guide_id FK, block_id FK, event_type (started|completed|skipped|rescheduled), occurred_at, meta JSONB

### Layer B: Inference (Versioned)

**`model_version`** -- model_version_id PK, created_at, model_family (mastery|calibration|dropout|load), version_label, params_ref JSONB

**`profile_version`** -- profile_version_id PK, learner_id FK, created_at, parent_profile_version_id (self-ref), summary_payload JSONB

**`mastery_estimate`** -- mastery_id PK, learner_id FK, concept_id FK, profile_version_id, model_version_id FK, posterior_mean, posterior_sd, credible_low, credible_high, last_updated_at, evidence_window JSONB

**`calibration_summary`** -- calibration_id PK, learner_id FK, profile_version_id, model_version_id FK, ece, brier_score, curve_points JSONB, computed_at

**`construct_inference`** -- inference_id PK, learner_id FK, profile_version_id, construct_key (cognitive_load_risk|self_regulation_risk|motivation_support_needed|...), estimate, uncertainty_sd, confidence_band (low|medium|high), model_version_id FK, evidence_refs JSONB, fastest_disambiguation JSONB, computed_at

**`review_queue_state`** -- queue_state_id PK, learner_id FK, profile_version_id, algorithm_version, state_payload JSONB, computed_at

### Layer C: Policy & Guide (Versioned, Auditable)

**`policy_version`** -- policy_version_id PK, created_at, version_label, ruleset_ref JSONB

**`policy_decision`** -- decision_id PK, learner_id FK, profile_version_id, policy_version_id FK, decision_key (pacing|spacing|feedback_style|study_skill_lesson|interleaving_level), decision_value JSONB, triggered_by JSONB, rationale, computed_at

**`learning_guide`** -- guide_id PK, learner_id FK, profile_version_id, created_at, horizon_days (default 7), guide_payload JSONB

**`guide_block`** -- block_id PK, guide_id FK, day_index (1..7), block_type (core_practice|skill_builder|metacog_routine|motivation_support), planned_minutes, concept_ids TEXT[], item_selector JSONB, completion_criteria JSONB, ordering

**`audit_event`** -- audit_id PK, learner_id FK, occurred_at, observation, observation_refs JSONB, inference_change JSONB, policy_change JSONB, user_visible_summary

**`measurement_plan`** -- plan_id PK, learner_id FK, profile_version_id, created_at, target_construct_key, reason, proposed_actions JSONB, expected_info_gain

### Content Ingestion Tables

**`source_file`** -- file_id PK, uploaded_by FK, filename, mime_type, size_bytes, storage_url, uploaded_at, extraction_status (pending|processing|completed|failed), metadata JSONB

**`source_collection`** -- collection_id PK, created_by FK, name, description, created_at, updated_at

**`collection_file`** -- collection_id + file_id composite PK, added_at

**`extracted_concept`** -- extracted_concept_id PK, file_id FK, concept_id FK, label, description, confidence, extraction_model_version, extracted_at

**`knowledge_graph_edge`** -- edge_id PK, source_concept_id, target_concept_id, relation_type (prerequisite|related|contains|extends), weight, provenance_file_id FK, created_at

**`tag`** -- tag_id PK, name UNIQUE, color, created_at

**`file_tag`** -- file_id + tag_id composite PK

**`project`** -- project_id PK, created_by FK, name, description, created_at, updated_at

**`project_file`** -- project_id + file_id composite PK, added_at

---

## 4. Sample Personas (5 Learners, Seeded via drizzle-seed)

### Persona 1: Maya Chen -- Linear Algebra Exam Prep

- **Goal:** exam, 45 min/day, 5 days/week, deadline in 6 weeks
- **Profile:** High conscientiousness, moderate mastery (0.55 +/- 0.12), poor calibration (ECE 0.18, overconfident), low cognitive load risk
- **Seed data:** 40 attempts across 8 concepts (gaussian_elim, matrix_mult, eigenvalues, etc.), calibration curve showing overconfidence at 0.7-0.9 range, 3 uploaded PDFs (textbook chapters)
- **Active policy:** metacog_insertion (ECE >= 0.12), spacing with intervalMultiplier 0.7
- **Guide:** 7 days with prediction-reflection-repair loops every 3rd item

### Persona 2: Carlos Rivera -- ML Career Switch

- **Goal:** fluency, 30 min/day, 4 days/week, no deadline
- **Profile:** Low prior exposure, high motivation (SDT autonomy high), wide uncertainty (posterior_sd 0.20+), high self-regulation risk (LASSI time management low)
- **Seed data:** 20 attempts across 5 concepts (regression, classification, neural_nets, etc.), mostly incorrect early items, 2 uploaded markdown notes
- **Active policy:** pacing (chunkSize: 4, workedExampleRatio: 0.5), study_skill_lesson (time_management)
- **Guide:** 7 days with smaller chunks and worked examples

### Persona 3: Dr. Priya Sharma -- Curriculum Design Teaching

- **Goal:** teach, 20 min/day, 3 days/week, no deadline
- **Profile:** High domain mastery (0.82 +/- 0.06), excellent calibration (ECE 0.04), low risk across all constructs
- **Seed data:** 50 attempts across 10 concepts, mostly correct, well-calibrated confidence, 5 uploaded slide decks
- **Active policy:** interleaving_level (interleavingRatio: 0.4), normal pacing
- **Guide:** 7 days focused on cross-concept integration and teaching preparation

### Persona 4: Jordan Kim -- Statistics Project

- **Goal:** project, 40 min/day, 5 days/week, deadline in 4 weeks
- **Profile:** Moderate mastery (0.48 +/- 0.15), severely overconfident (confidence 0.8, accuracy 0.55, ECE 0.25), moderate cognitive load risk
- **Seed data:** 35 attempts across 7 concepts (hypothesis_testing, regression, anova, etc.), confidence consistently 0.75-0.85 but accuracy 0.45-0.60, 4 uploaded PDFs
- **Active policy:** metacog_insertion (every_3rd_item), pacing (chunkSize: 4)
- **Guide:** 7 days heavy on calibration repair loops

### Persona 5: Aisha Okafor -- Data Science Fluency

- **Goal:** fluency, 25 min/day, 3 days/week, no deadline
- **Profile:** High openness, low conscientiousness (Big Five), dropout risk signals (declining adherence), needs autonomy-supportive policy
- **Seed data:** 25 attempts across 6 concepts, declining session completion over 2 weeks, motivation_support_needed: 0.72, 3 uploaded notebooks
- **Active policy:** feedback_style (autonomy_supportive, choiceSets: 3), study_skill_lesson (time_management)
- **Guide:** 7 days with shorter sessions, choice sets, competence proofs

---

## 5. Inference Engine

Located at `/lib/inference/`:

- **`mastery.ts`** -- Bayesian Beta updates. Prior: Beta(1,1). Update: correct -> alpha++, incorrect -> beta++. Posterior mean = alpha/(alpha+beta). Posterior SD = sqrt(alpha*beta / ((alpha+beta)^2 * (alpha+beta+1))). 90% credible interval from Beta quantiles.
- **`calibration.ts`** -- ECE: mean |confidence - accuracy| across bins. Brier: mean squared error. Calibration curve: binned confidence vs accuracy with counts.
- **`constructs.ts`** -- cognitive_load_risk (latency on multi-step items + error rate), self_regulation_risk (adherence telemetry + LASSI/MAI), motivation_support_needed (SDT/MSLQ + dropout signals). All output estimate + uncertainty_sd + confidence_band + evidence_refs + fastest_disambiguation.
- **`dropout.ts`** -- Adherence-based risk from declining session completion and rescheduling patterns.
- **`index.ts`** -- `recomputeProfile(learnerId)`: loadEvidence -> computeMastery -> computeCalibration -> computeConstructs -> computeDropoutRisk -> persistProfile. Creates new immutable profile_version, writes all derived rows, snapshots queue, emits audit_events for changes.

---

## 6. Policy Engine

Located at `/lib/policy/`:

### v1 Ruleset (7 rules)

| # | Key | Construct | Condition | Confidence Gate | Action |
|---|-----|-----------|-----------|-----------------|--------|
| R1 | pacing | cognitive_load_risk | >= 0.6 | medium | chunkSize: 4, workedExampleRatio: 0.5 |
| R2 | pacing | cognitive_load_risk | < 0.3 | medium | chunkSize: 8, workedExampleRatio: 0.1 |
| R3 | spacing | mastery posterior_sd | > 0.15 | low | intervalMultiplier: 0.7 |
| R4 | metacog_insertion | calibration ece | >= 0.12 | medium | insertPredictionLoop: true, frequency: every_3rd_item |
| R5 | study_skill_lesson | self_regulation_risk | >= 0.5 | medium | lessonType: time_management, durationMinutes: 5 |
| R6 | feedback_style | motivation_support_needed | >= 0.6 | medium | style: autonomy_supportive, choiceSets: 3 |
| R7 | interleaving_level | cross-concept mastery mean | >= 0.5 | medium | interleavingRatio: 0.4 |

Rules fire only if confidence_band meets gate. If not, keep previous decision or conservative default. Every applied decision produces an audit_event.

---

## 7. Material Ingestion Pipeline

1. **Upload** -- File uploaded to Vercel Blob; `source_file` row created with `extraction_status = 'pending'`
2. **Content extraction** -- Background: extract text by MIME type (PDF via bash tool, markdown passthrough); status -> `'processing'`; save extracted markdown to Vercel Blob
3. **Concept identification** -- AI SDK `generateObject` with `ExtractedConceptOutput` Zod schema; stored in `extracted_concept` with confidence
4. **Knowledge graph construction** -- Concepts linked via `knowledge_graph_edge` with typed relations and provenance
5. **Ontology integration** -- Match extracted concepts to existing `concept` rows or create new ones
6. **Status update** -- `extraction_status` -> `'completed'` or `'failed'`

---

## 8. AI Generation Pipeline

All AI calls use Vercel AI SDK `generateObject` with strict Zod schemas via AI Gateway.

### Schemas

- **`GuideSchema`** -- summary, dailyPlan[dayIndex, blocks[type, minutes, description]]
- **`FlashcardSetSchema`** -- setId, title, conceptIds, cards[cardId, front, back, difficulty, conceptId]
- **`QuizSchema`** -- quizId, title, conceptIds, questions[questionId, stem, options[isCorrect, explanation], conceptId, bloomLevel]
- **`TextContentSchema`** -- contentId, title, conceptIds, sections[heading, body, keyTerms]

### Guide Generation Flow

1. Policy engine produces decisions
2. Mastery map provides concept priorities + uncertainty
3. Time constraints from learning_goal
4. Assembled into structured prompt
5. AI generates guide via GuideSchema
6. Persisted to learning_guide + guide_block tables

### Agent Pattern

- Configured via AGENTS.md markdown files
- Consumes Core Model JSON as context
- Reads uploaded materials (stored as markdown in Vercel Blob)
- Outputs structured JSON conforming to artifact Zod schemas
- Maintains progress markdown file (created if missing)
- Chat memory in Vercel KV (Redis)
- Streaming responses via AI SDK

---

## 9. Training UI (12-Step Form Wizard)

Typeform-style, snap-scroll, vertical swipe. React Hook Form with loading spinners.

| Step | Title | Input Type |
|------|-------|-----------|
| 1 | Domain | Searchable select |
| 2 | Goal Type | Radio cards (exam/project/fluency/teach) |
| 3 | Time Budget | Dual sliders (min/day + days/week) |
| 4 | Deadline | Date picker (optional) |
| 5 | Prior Exposure | Multi-select chips |
| 6 | Cognitive Reflection | Slider + scenario cards (CRT rotated) |
| 7 | Metacognitive Awareness | Likert scale sliders (MAI) |
| 8 | Study Strategies | Multi-select + rating (LASSI) |
| 9 | Motivation | Slider bank (SDT autonomy/competence/relatedness) |
| 10 | Learning Preferences | Drag-rank + toggles (UX only) |
| 11 | Personality Tone | Quick Big Five sliders (tone only) |
| 12 | Review & Generate | Summary + "Generate Core Model" CTA |

Fixed header with progress dots, headline, form fields, Next/Back/Save buttons.

---

## 10. Screen Specifications

### `/` -- Landing Page
Trust contract messaging, 4 commitments, "Start your baseline" CTA. Redirects authenticated users to /dashboard.

### `/login` -- Authentication
better-auth login. Dev mode: fake login button with email/password.

### `/dashboard` -- Project Grid
Filterable grid of projects (Notebook LM style). Cards: name, description, tags, file count, last updated. CRUD operations.

### `/dashboard/core-model` -- Core Model Editor
Three views:
1. **Node Graph** -- Interactive visualization, sidebar on select, grouped by category
2. **Form Wizard** -- 12-step typeform (see Section 9)
3. **JSON Panel** -- Read-only formatted Core Model JSON

### `/dashboard/tags` -- Tag CRUD
Grid with create form (name, color), inline edit, delete with confirm, shows referencing files/projects.

### `/dashboard/files` -- File Management
Filterable datatable. Drag-drop upload with progress spinners. Edit metadata (tags, projects, collections). Bulk operations. File preview. Collection CRUD.

### `/dashboard/profile` -- Learner Profile (3 Panes)
- **Pane A (Evidence):** Mastery map by concept with confidence intervals, calibration curve, retrieval stability, time-to-solution
- **Pane B (Inferences):** Construct estimates with uncertainty bands, fastest disambiguation suggestions
- **Pane C (Policy):** Active decisions with rationale links to audit events

### `/dashboard/guide` -- 7-Day Learning Guide
Calendar-ready blocks (20-45 min), concept sequence with mastery gates, metacognitive routine, motivation supports, risk flags. "Start Day 1" CTA.

### `/dashboard/session/[id]` -- Practice Session
Retrieval practice items, reflection loops, effort-aware pacing. Session wrap: mastery delta, calibration delta, policy changes with reasons.

### `/dashboard/audit` -- Audit Log
Per-recommendation audit (observation -> inference -> change). Model card: signals used, failure modes, CRT contamination controls, learning-styles disclaimer.

### `/dashboard/agents/[agentId]` -- Learning Agent
Split panel:
- **Sidebar:** Agent list (tile grid), create/configure form, settings (channels/commands/abilities), file/collection CRUD
- **Main:** Chat + Canvas. Streaming responses, tool calls with reasoning, loading spinners, attachments, model selection, thumbs up/down, copy/share. Canvas renders artifacts (flashcards, quizzes, text, video) with scroll-through.

---

## 11. Playwright E2E Tests

```
test("user can login with dev credentials")
test("user can complete 12-step training wizard")
test("user can upload materials to a project")
test("user can chat with a learning agent")
```

All tests run locally against the Vercel dev environment.

---

## 12. Zod Contracts

### Evidence Inputs
- `AttemptInput` -- sessionId, itemId, response, latencyMs, confidencePre/Post, errorType, repairOutcome, hintCount
- `AdherenceEventInput` -- guideId, blockId, eventType, meta
- `InstrumentResponseInput` -- instrumentRunId, itemKey, response

### Derived Outputs
- `ProfileSnapshotSchema` -- profileVersionId, createdAt, evidenceSummary (masteryMap, calibration), inferences[], policy[], guideRef
- `PolicyDecisionSchema` -- decisionKey, decisionValue, triggeredBy, rationale, policyVersionId

### AI Outputs (Schema-Constrained)
- `GuideSchema`, `FlashcardSetSchema`, `QuizSchema`, `TextContentSchema`

### Material Ingestion
- `FileUploadInput` -- filename, mimeType, sizeBytes, tags, projectId, collectionId
- `ExtractedConceptOutput` -- label, description, confidence, relatedConcepts[]

---

## 13. Event Taxonomy

All events stored in evidence layer with learner_id + timestamp.

| Event | Key Fields |
|-------|-----------|
| session.started | sessionId, sessionType, goalId, adaptiveAlgoVersion |
| session.ended | sessionId, endedAt |
| attempt.submitted | attemptId, sessionId, itemId, response, isCorrect, latencyMs, hintCount, errorType |
| confidence.pre | attemptId, confidencePre |
| confidence.post | attemptId, confidencePost |
| reflection.submitted | attemptId, errorType, reflectionText |
| repair.completed | attemptId, repairOutcome |
| hint.used | attemptId, hintIndex |
| guide.block.started | guideId, blockId, dayIndex |
| guide.block.completed | guideId, blockId, dayIndex |
| guide.block.skipped | guideId, blockId, dayIndex, reason |
| guide.block.rescheduled | guideId, blockId, fromDay, toDay |
| profile.recomputed | profileVersionId, parentProfileVersionId |
| policy.decision.applied | decisionId, decisionKey, policyVersionId |
| instrument.started | instrumentRunId, instrumentType |
| instrument.completed | instrumentRunId, instrumentType |
| crt.exposure.self_reported | itemId, selfReportPriorExposure |
| item_exposure.detected | exposureId, itemId, timesSeen, contaminationFlag |
