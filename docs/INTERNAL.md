# Internal Design Doc + PRD: Core Model

**Version:** 1.0
**Date:** 2026-03-04
**Status:** Draft
**Classification:** Internal

---

## 1. Executive Summary

The Core Model is an evidence-based, uncertainty-native adaptive learning platform for Masters-level autodidacts that measures behavioral evidence, derives inferences with explicit uncertainty, and generates actionable learning guides through auditable policy decisions.

The system is built on a strict **three-layer architecture**:

1. **Evidence Layer:**  
   - Collects and stores all behavioral data, like attempts, sessions, responses to assessments, events showing how engaged someone is, and what content they’ve seen.  
   - This data is saved as an unchangeable, running log—nothing gets deleted or overwritten.

2. **Inference Layer:**  
   - Uses the evidence to calculate learning insights, such as how much you’ve mastered, how well-calibrated you are, and other skill estimates.  
   - Every calculation includes a measure of uncertainty—so you always know how confident the system is in what it’s showing.

3. **Policy Layer:**  
   - Applies a set of transparent, versioned rules based on those insights.  
   - These rules decide what learning recommendations and guides you receive.  
   - Every decision can be checked and traced back to the evidence and reasoning behind it.

**Key Principle:** We only use AI to generate written explanations or guides in clear, structured language. Every score, skill estimate, and decision about your learning progress is calculated by reliable, transparent algorithms—not by AI. The system always keeps a record of how these scores and decisions are made, and AI is never allowed to make up numbers or rules on its own.

**v1 scope:**

- Domain mastery baseline and ongoing practice loop with full attempt telemetry
- Profile panes: Evidence / Inference / Policy (v1.0 snapshot with diffs)
- 7-day learning guide generation (AI SDK structured output)
- Audit log ("what changed today and why")
- Optional measurement modules (MAI, LASSI, MSLQ, SDT, CRT, Big Five, Preferences)
- Content ingestion pipeline with knowledge graph construction
- Learning agent with chat + canvas interface

---

## 2. Problem Statement & Vision

### The Gap

Self-directed learners at the Masters level lack tools that are simultaneously:

- **Scientifically grounded** in validated psychometric and learning-science constructs
- **Honest about uncertainty** rather than presenting false precision
- **Intervention-primary** rather than identity-labeling
- **Auditable** so the learner can inspect why any recommendation was made

Most existing adaptive learning platforms either rely on discredited learning-styles matching, present point estimates without uncertainty, or use opaque AI-driven personalization that cannot be inspected or reproduced.

### "Truth Over Personalization" Thesis

The product thesis is that learners are better served by a system that:

1. Measures what actually predicts learning outcomes (mastery state, calibration, self-regulation, cognitive load)
2. Stores all estimates with error bars and confidence bands
3. Makes every adaptive decision traceable from observation through inference to policy
4. Never claims to know more than the data supports

This produces trust as a product feature and makes the methodology publishable.

### Target Persona

**Who is this for?**

This product is designed for someone who:

- Is pursuing a Masters-level education on their own (self-taught)
- Sets clear goals—like preparing for exams, mastering projects, becoming fluent in a subject, or being able to teach others
- Is open to spending 10–15 minutes at the beginning to set a behavioral baseline
- Prefers transparency and open explanations over “black box” or magical answers
- Might be learning more than one subject or skill at a time

### Anti-Patterns Avoided

| Anti-Pattern | Why It Is Rejected | Citation |
|---|---|---|
| Learning-styles meshing (VARK/Kolb as pedagogy) | Evidence does not support matching instruction to style inventories | [1] |
| Personality-gated difficulty | Traits predict tendencies, not outcomes; Big Five affects tone only | [7] |
| Opaque AI scoring | Mastery and construct estimates must be deterministic and reproducible | -- |
| Point estimates without uncertainty | Storing only means without standard deviations produces false precision | -- |
| Uncontrolled psychometric instruments | CRT items are contaminated by prior exposure; must rotate forms | [2], [8] |

---

## 3. Scientific Framework

### 3.1 Construct Inventory

The system measures the following constructs, each grounded in validated instruments and research. Constructs are included only if they change a policy decision -- if a construct does not alter an intervention, it is not measured.

| Construct | Instrument / Source | What It Captures | Validity Basis | Required / Optional |
|---|---|---|---|---|
| **Domain Mastery** | Adaptive item bank (retrieval, application, near-transfer) | Knowledge state per concept with uncertainty | Bayesian updating on behavioral evidence | Required |
| **Calibration** | Confidence ratings vs. actual accuracy | Metacognitive accuracy (overconfidence/underconfidence) | ECE and Brier score computation | Required |
| **Cognitive Reflection** | CRT (rotated forms) | Reflective vs. intuitive thinking tendency | Frederick (2005) | Optional |
| **Bloom's Level** | Diagnostic item classification | Current cognitive engagement level per concept | Bloom's Taxonomy diagnostic tools | Required (embedded in items) |
| **Metacognitive Awareness** | MAI (Metacognitive Awareness Inventory) | Planning, monitoring, evaluating awareness | Schraw & Dennison (1994) | Optional |
| **Study Strategies** | LASSI (Learning and Study Strategies Inventory) | Time management, test strategies, concentration, information processing | LASSI 3rd Ed validation | Optional |
| **Motivation** | MSLQ (Motivated Strategies for Learning Questionnaire) | Motivation, learning strategies, meta-cognitive self-regulation | Pintrich et al. (1991) | Optional |
| **Self-Determination** | SDT Mini-Scale | Autonomy, competence, relatedness needs | Ryan & Deci (2000) | Optional |
| **Personality Traits** | Big Five / OCEAN | Openness, conscientiousness, extraversion, agreeableness, neuroticism | Costa & McCrae; meta-analyses | Optional |
| **Presentation Preferences** | VARK-like preference survey | Visual, auditory, reading/writing, kinesthetic preferences | UX-only; no pedagogy claims | Optional |

### 3.2 Intervention Map

This is the core artifact that connects research to product decisions. Every row represents a testable hypothesis: if we measure this construct and it crosses this threshold, we change this decision, deliver this intervention, and measure this outcome.

| Construct Measured | Evidence Source | Inference Output (with uncertainty) | Decision It Changes | Intervention Library | Evaluation Metric |
|---|---|---|---|---|---|
| Domain mastery | Attempts (correctness, latency, error type, hints) | P(mastery) posterior + SD per concept | item selection, concept sequencing, spacing intervals | Retrieval practice, spacing, interleaving, worked examples | Mastery retention (7/14/30d) |
| Calibration | Confidence pre/post vs. correctness | ECE, Brier score, bin curve | metacognitive routine insertion | Prediction-attempt-reflection-repair loops | ECE improvement over time |
| Cognitive load risk | Latency on multi-step items + error rate under complexity | cognitive_load_risk (mu, sigma) | pacing, chunk size, example ratio | Shorter sets, worked examples before problem sets, enforced focus blocks | Latency normalization, error rate reduction |
| Self-regulation risk | LASSI/MAI scores + spacing adherence telemetry | self_regulation_risk (mu, sigma) | scaffolding level, study-skill lessons | Study-skill micro-lessons, planning scaffolds, time management modules | Adherence, spacing compliance |
| Reflective reasoning | CRT (rotated) + exposure detection | reflective_tendency (mu, sigma) | reflective prompt insertion | Reflective pauses, intuitive-trap warnings | CRT improvement (exposure-controlled) |
| Motivation supports needed | SDT / MSLQ optional + dropout signals | support_needed (mu, sigma) | autonomy-supportive policy | Choice sets, competence proofs, relatedness features | Adherence, persistence |
| Coaching tone preference | Big Five (opt-in) | tone_profile | feedback style | Autonomy-supportive vs. directive feedback language | Engagement metrics |
| Presentation preference | VARK-like survey | modality_preference | presentation mix (UX only) | Multimodal content selection | Engagement (not learning outcomes) |

### 3.3 Product Invariants

These are non-negotiable rules enforced at the architecture level.

**Invariant 1: Behavior-First Measurement.**
Surveys are optional and only used if they change decisions. Primary signals are retrieval performance, latency, error type, calibration (confidence vs. accuracy), and spacing adherence. ([1])

**Invariant 2: No Learning-Styles Efficacy Claims.**
Preferences (e.g., VARK-like) are UX-only, never used to alter pedagogy claims. "Preference does not equal effectiveness." Evidence does not support meshing instruction to style inventories. ([1])

**Invariant 3: Uncertainty-Native Modeling.**
Every estimate must store `posterior_mean`, `posterior_sd`, credible interval, and confidence band. Point estimates alone are never stored. ([3])

**Invariant 4: Auditability by Construction.**
Every adaptation must answer: What did we observe? What did we infer (with what uncertainty)? What did we change? How will we evaluate the change? This is enforced by the `audit_event` table and triggered automatically inside the policy engine. ([5])

**Invariant 5: Trait Use Is Constrained.**
Big Five affects coaching tone only, never difficulty gating. Traits predict tendencies, not destiny. ([7])

**Invariant 6: Construct Integrity (CRT Contamination Controls).**
CRT-like tasks must rotate form families, detect prior exposure, and flag contamination. The adaptive selector must exclude contaminated items from scoring constructs. ([2], [8])

**Invariant 7: Motivation Support Is Policy-Based.**
Motivation personalization equals support structures (autonomy, competence, relatedness), not personality typing. Grounded in SDT. ([5])

### 3.4 Citations Registry

All citations are preserved exactly as provided in the research foundation.

| ID | Title | URL |
|---|---|---|
| [1] | Learning Styles: Concepts and Evidence | <https://journals.sagepub.com/doi/10.1111/j.1539-6053.2009.01038.x> |
| [2] | Cognitive Reflection and Decision Making | <https://www.aeaweb.org/articles?id=10.1257%2F089533005775196732> |
| [3] | Assessing Metacognitive Awareness | <https://www.sciencedirect.com/science/article/pii/S0361476X84710332> |
| [4] | LASSI 3rd Ed User's Manual | <https://www.hhpublishing.com/LASSImanual.pdf> |
| [5] | Self-Determination Theory and the Facilitation of Intrinsic Motivation | <https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf> |
| [6] | Motivated Strategies for Learning Questionnaire | <https://files.eric.ed.gov/fulltext/ED338122.pdf> |
| [7] | Big Five personality traits and academic performance | <https://pubmed.ncbi.nlm.nih.gov/34265097/> |
| [8] | Has the Standard Cognitive Reflection Test Become a Victim of Its Own Success? | <https://pmc.ncbi.nlm.nih.gov/articles/PMC5225989/> |

---

## 4. System Architecture

### 4.1 Three-Layer Domain Model

The system enforces a strict separation between evidence, inference, and policy. Each layer has different mutability rules.

```
UI (Next.js App Router)
    |
Application Layer (Server Actions / Route Handlers)
    |
Domain Layer
    |--- Layer 1: Evidence (Immutable, Append-Only)
    |       attempts, sessions, instrument responses,
    |       adherence events, item exposure
    |
    |--- Layer 2: Inference (Versioned, Derived)
    |       mastery estimates (posterior + sd),
    |       calibration summary, construct inferences,
    |       dropout risk, cognitive load risk
    |
    |--- Layer 3: Policy & Guide (Versioned Decisions)
    |       policy_decisions, learning_guide, guide_blocks,
    |       audit_events, profile_version snapshots
    |
Postgres (Drizzle ORM)
    |
AI SDK (Structured Output Only -- Guide Narratives)
```

**Mutability Rules:**

| Layer | Mutability | Rule |
|---|---|---|
| Evidence | Append-only | No updates, no deletes. Only inserts. All timestamps required. |
| Inference | Versioned snapshots | New rows created per profile version. Old rows are never modified. Each row includes `model_version_id`, `profile_version_id`, `computed_at`. |
| Policy | Versioned snapshots | Decisions are immutable once written. New policy versions create new decision rows. Audit events generated automatically. |

### 4.2 Deterministic vs. AI Boundary

This boundary is enforced architecturally. No exceptions.

**Deterministic (versioned, reproducible):**

- Scoring: mastery estimates from attempt data (Bayesian beta updating)
- Calibration metrics: ECE, Brier score computation from confidence/accuracy pairs
- Construct inference: cognitive load risk, self-regulation risk, motivation support needed
- Policy engine: rule firing, threshold evaluation, pacing/spacing decisions
- Audit log generation from structured data
- Item selection algorithm (mastery + spacing queue)
- Profile version creation and diffing
- Review queue state computation

**AI SDK (structured output only, Zod-constrained):**

- Learning guide narrative text (daily plan descriptions, summaries)
- User-facing explanation text for already-computed policy decisions
- Optional reflection feedback prose
- Learning artifact content generation (flashcards, quizzes, text content, video scripts)

**AI is never allowed to:**

- Produce scores or thresholds
- Make construct estimates
- Fire policy rules
- Determine mastery levels
- Influence item selection

### 4.3 Next.js App Router Route Tree

```
app/
  (marketing)/
    page.tsx                    # Landing / splash -- redirects to /dashboard if authenticated
  (auth)/
    login/page.tsx              # Login (dev: fake email/password button)
    register/page.tsx
  dashboard/
    page.tsx                    # Main: filterable grid of projects (Notebook LLM style)
    profile/
      page.tsx                  # Evidence / Inference / Policy panes
    guide/
      page.tsx                  # 7-day learning guide
    session/
      [sessionId]/
        page.tsx                # In-session learning experience
    audit/
      page.tsx                  # Audit log + model card
    core-model/
      page.tsx                  # Node graph + form wizard (12 screens)
      [modelId]/
        page.tsx                # View/edit specific core model
    tags/
      page.tsx                  # Tags CRUD grid
    files/
      page.tsx                  # Files CRUD datatable (filterable, bulk editable)
    agents/
      page.tsx                  # Learning agents tile grid
      [agentId]/
        page.tsx                # Chat + canvas screen
  api/
    sessions/
      route.ts
    attempts/
      route.ts
    instruments/
      route.ts
    profile/
      route.ts
    guide/
      route.ts
    core-model/
      route.ts                  # Generates core model JSON on mutation
    files/
      route.ts
    tags/
      route.ts
    agents/
      route.ts
```

### 4.4 Deployment Architecture

| Component | Technology | Notes |
|---|---|---|
| Web application | Vercel (Next.js App Router) | Edge runtime only for read-heavy guide rendering |
| Database | Postgres (Neon or Supabase) | Drizzle ORM, ULID primary keys |
| AI gateway | AI SDK with `AI_GATEWAY_API_KEY` | Single API key for all model access |
| Inference recompute | Background job (queue or server action) | Never synchronous on every attempt |
| File storage | Vercel Blob or equivalent | Source materials, uploaded files |
| Evals | evalite library | Core model generations, content ingestion, agent generations |

### 4.5 Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| Framework | Next.js (App Router) | Full-stack web application |
| Language | TypeScript (strict) | Type safety throughout |
| ORM | Drizzle | Postgres access with strong typing |
| Validation | Zod | API boundaries, AI outputs, policy decisions |
| AI | Vercel AI SDK (`generateObject`) | Structured output generation only |
| Auth | better-auth | Authentication and session management |
| Forms | React Hook Form | Form state management with loading spinners |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Components | shadcn/ui | Component library |
| UI Rendering | JSON Render | Dynamic component rendering from JSON |
| Package Manager | bun / bunx | Fast package management |
| Linting | Biome | Code formatting and linting |
| Evals | evalite | Evaluation framework for AI outputs |
| Agent Framework | AGENTS.md + just-bash + bash-tools | Agent configuration as markdown |
| IDs | ULID (UUIDv7 compatible) | Sortable by time, globally unique |

---

## 5. Data Model

### 5.1 ID and Versioning Conventions

- All primary keys use **ULID** (Universally Unique Lexicographically Sortable Identifier), which is sortable by creation time.
- Every derived record (inference, policy) includes:
  - `model_version_id` -- which model/algorithm version produced this output
  - `profile_version_id` -- which profile snapshot this belongs to
  - `computed_at` -- timestamp of computation
- Profiles are immutable snapshots. Diffs are computed between versions by comparing `parent_profile_version_id`.
- Evidence tables never update rows. Only inserts.
- JSONB is used only where schema flexibility is genuinely required (payloads, metadata, queue state).

### 5.2 Layer A -- Evidence Tables (Append-Only)

#### learner

Stores the core identity for each user. Minimal fields by design (data minimization principle).

```sql
CREATE TABLE learner (
  learner_id           TEXT PRIMARY KEY,
  created_at           TIMESTAMPTZ NOT NULL,
  locale               TEXT,
  timezone             TEXT
);
```

#### consent_bundle

Granular opt-in tracking per learner. Each consent bundle is immutable once created; revocation creates a new event via `revoked_at`.

```sql
CREATE TABLE consent_bundle (
  consent_id           TEXT PRIMARY KEY,
  learner_id           TEXT NOT NULL REFERENCES learner(learner_id),
  created_at           TIMESTAMPTZ NOT NULL,
  required_telemetry   BOOLEAN NOT NULL DEFAULT TRUE,
  opt_in_mai           BOOLEAN NOT NULL DEFAULT FALSE,
  opt_in_lassi         BOOLEAN NOT NULL DEFAULT FALSE,
  opt_in_motivation    BOOLEAN NOT NULL DEFAULT FALSE,
  opt_in_big5_tone     BOOLEAN NOT NULL DEFAULT FALSE,
  opt_in_crt_rotated   BOOLEAN NOT NULL DEFAULT FALSE,
  opt_in_preferences_ux BOOLEAN NOT NULL DEFAULT FALSE,
  policy_text_version  TEXT NOT NULL,
  revoked_at           TIMESTAMPTZ
);
```

#### learning_goal

Captures the learner's domain, goal type, time constraints, and deadline. Prior exposure is stored as low-weight self-report in JSONB.

```sql
CREATE TABLE learning_goal (
  goal_id          TEXT PRIMARY KEY,
  learner_id       TEXT NOT NULL REFERENCES learner(learner_id),
  created_at       TIMESTAMPTZ NOT NULL,
  domain_label     TEXT NOT NULL,
  goal_type        TEXT NOT NULL,          -- exam | project | fluency | teach
  deadline         DATE,
  minutes_per_day  INT NOT NULL,
  days_per_week    INT NOT NULL,
  prior_exposure_self_report JSONB
);
```

#### concept and concept_prereq

The content ontology. Concepts form a directed acyclic graph with weighted prerequisite edges.

```sql
CREATE TABLE concept (
  concept_id       TEXT PRIMARY KEY,
  domain_label     TEXT NOT NULL,
  name             TEXT NOT NULL,
  description      TEXT,
  difficulty_rank  REAL,
  tags             TEXT[]
);

CREATE TABLE concept_prereq (
  concept_id       TEXT NOT NULL REFERENCES concept(concept_id),
  prereq_concept_id TEXT NOT NULL REFERENCES concept(concept_id),
  weight           REAL NOT NULL DEFAULT 1.0,
  PRIMARY KEY (concept_id, prereq_concept_id)
);
```

#### item and item_exposure

The item bank for adaptive assessment, with form-family grouping for CRT-like rotation and exposure tracking for contamination control.

```sql
CREATE TABLE item (
  item_id          TEXT PRIMARY KEY,
  domain_label     TEXT NOT NULL,
  prompt_type      TEXT NOT NULL,     -- retrieval | application | near_transfer | reflection
  stem             JSONB NOT NULL,
  correct_answer   JSONB,
  concept_ids      TEXT[] NOT NULL,
  difficulty       REAL,
  discrimination   REAL,
  form_family_id   TEXT,              -- for rotated forms (CRT-like)
  is_sensitive     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE item_exposure (
  exposure_id      TEXT PRIMARY KEY,
  learner_id       TEXT NOT NULL REFERENCES learner(learner_id),
  item_id          TEXT NOT NULL REFERENCES item(item_id),
  first_seen_at    TIMESTAMPTZ NOT NULL,
  times_seen       INT NOT NULL DEFAULT 1,
  self_report_prior_exposure BOOLEAN,
  contamination_flag BOOLEAN NOT NULL DEFAULT FALSE
);
```

#### assessment_session and attempt

The backbone evidence tables. Sessions group attempts; attempts capture full behavioral telemetry including confidence ratings, error types, and repair outcomes.

```sql
CREATE TABLE assessment_session (
  session_id       TEXT PRIMARY KEY,
  learner_id       TEXT NOT NULL REFERENCES learner(learner_id),
  goal_id          TEXT REFERENCES learning_goal(goal_id),
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ,
  session_type     TEXT NOT NULL,   -- baseline | practice | weekly_update | module
  adaptive_algo_version TEXT
);

CREATE TABLE attempt (
  attempt_id       TEXT PRIMARY KEY,
  session_id       TEXT NOT NULL REFERENCES assessment_session(session_id),
  learner_id       TEXT NOT NULL REFERENCES learner(learner_id),
  item_id          TEXT NOT NULL REFERENCES item(item_id),
  shown_at         TIMESTAMPTZ NOT NULL,
  answered_at      TIMESTAMPTZ,
  response         JSONB,
  is_correct       BOOLEAN,
  latency_ms       INT,
  hint_count       INT NOT NULL DEFAULT 0,
  confidence_pre   REAL,            -- 0..1
  confidence_post  REAL,
  error_type       TEXT,            -- taxonomy label
  repair_outcome   TEXT,            -- pass | fail | skipped
  attempt_meta     JSONB            -- device, UI context, etc.
);
```

#### Instrument tables (Optional Modules)

Normalized but flexible tables for MAI, LASSI, MSLQ, SDT, Big Five, CRT, and Preferences instruments.

```sql
CREATE TABLE instrument_run (
  instrument_run_id TEXT PRIMARY KEY,
  learner_id        TEXT NOT NULL REFERENCES learner(learner_id),
  session_id        TEXT REFERENCES assessment_session(session_id),
  instrument_type   TEXT NOT NULL,     -- MAI | LASSI | MSLQ | SDT_MINI | BIG5_TONE | CRT_ROTATED | PREFS_UX
  instrument_version TEXT NOT NULL,
  started_at        TIMESTAMPTZ NOT NULL,
  ended_at          TIMESTAMPTZ,
  scoring_status    TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE instrument_response (
  instrument_response_id TEXT PRIMARY KEY,
  instrument_run_id TEXT NOT NULL REFERENCES instrument_run(instrument_run_id),
  item_key          TEXT NOT NULL,
  response          JSONB NOT NULL,
  responded_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE instrument_score (
  instrument_score_id TEXT PRIMARY KEY,
  instrument_run_id TEXT NOT NULL REFERENCES instrument_run(instrument_run_id),
  scale_key         TEXT NOT NULL,     -- e.g., LASSI_time_management
  score             REAL NOT NULL,
  stderr            REAL,
  percentile        REAL,
  score_meta        JSONB
);
```

#### adherence_event

Tracks whether learners follow their learning guides -- sessions started, blocks completed, skips, and reschedules. Required for SDT-based motivation support policy.

```sql
CREATE TABLE adherence_event (
  adherence_id     TEXT PRIMARY KEY,
  learner_id       TEXT NOT NULL REFERENCES learner(learner_id),
  guide_id         TEXT REFERENCES learning_guide(guide_id),
  block_id         TEXT REFERENCES guide_block(block_id),
  event_type       TEXT NOT NULL,  -- started | completed | skipped | rescheduled
  occurred_at      TIMESTAMPTZ NOT NULL,
  meta             JSONB
);
```

### 5.3 Layer B -- Inference Tables (Versioned, Uncertainty-Aware)

#### model_version

Tracks which algorithm version produced each derived output. Enables reproducibility and A/B testing of model families.

```sql
CREATE TABLE model_version (
  model_version_id TEXT PRIMARY KEY,
  created_at       TIMESTAMPTZ NOT NULL,
  model_family     TEXT NOT NULL,   -- mastery | calibration | dropout | load
  version_label    TEXT NOT NULL,
  params_ref       JSONB            -- hyperparams, training data hash
);
```

#### profile_version

Immutable snapshot of a learner's full profile at a point in time. Parent pointer enables diffing between versions.

```sql
CREATE TABLE profile_version (
  profile_version_id TEXT PRIMARY KEY,
  learner_id         TEXT NOT NULL REFERENCES learner(learner_id),
  created_at         TIMESTAMPTZ NOT NULL,
  parent_profile_version_id TEXT,
  summary_payload    JSONB NOT NULL      -- Pane A/B/C compiled view
);
```

#### mastery_estimate

Per-concept mastery with full Bayesian posterior, credible intervals, and evidence window reference.

```sql
CREATE TABLE mastery_estimate (
  mastery_id       TEXT PRIMARY KEY,
  learner_id       TEXT NOT NULL REFERENCES learner(learner_id),
  concept_id       TEXT NOT NULL REFERENCES concept(concept_id),
  profile_version_id TEXT NOT NULL,
  model_version_id TEXT NOT NULL REFERENCES model_version(model_version_id),
  posterior_mean   REAL NOT NULL,
  posterior_sd     REAL NOT NULL,
  credible_low     REAL,
  credible_high    REAL,
  last_updated_at  TIMESTAMPTZ NOT NULL,
  evidence_window  JSONB               -- last N attempts, time range
);
```

#### calibration_summary

Per-learner calibration metrics: expected calibration error, Brier score, and the full bin curve.

```sql
CREATE TABLE calibration_summary (
  calibration_id   TEXT PRIMARY KEY,
  learner_id       TEXT NOT NULL REFERENCES learner(learner_id),
  profile_version_id TEXT NOT NULL,
  model_version_id TEXT NOT NULL REFERENCES model_version(model_version_id),
  ece              REAL,               -- expected calibration error
  brier_score      REAL,
  curve_points     JSONB,              -- bins: confidence -> accuracy
  computed_at      TIMESTAMPTZ NOT NULL
);
```

#### construct_inference

Risk and support constructs with explicit uncertainty, confidence bands, provenance pointers, and "fastest disambiguation" recommendations.

```sql
CREATE TABLE construct_inference (
  inference_id     TEXT PRIMARY KEY,
  learner_id       TEXT NOT NULL REFERENCES learner(learner_id),
  profile_version_id TEXT NOT NULL,
  construct_key    TEXT NOT NULL,  -- cognitive_load_risk | self_regulation_risk | motivation_support_needed | ...
  estimate         REAL NOT NULL,  -- 0..1 risk or standardized score
  uncertainty_sd   REAL NOT NULL,
  confidence_band  TEXT NOT NULL,  -- low | medium | high
  model_version_id TEXT NOT NULL REFERENCES model_version(model_version_id),
  evidence_refs    JSONB NOT NULL, -- pointers to attempts, instrument scores
  fastest_disambiguation JSONB,    -- recommended next measurement
  computed_at      TIMESTAMPTZ NOT NULL
);
```

#### review_queue_state

Explicit, reproducible queue state for spacing and interleaving. Snapshotted per profile version so the queue can be audited and reproduced.

```sql
CREATE TABLE review_queue_state (
  queue_state_id   TEXT PRIMARY KEY,
  learner_id       TEXT NOT NULL REFERENCES learner(learner_id),
  profile_version_id TEXT NOT NULL,
  algorithm_version TEXT NOT NULL,
  state_payload    JSONB NOT NULL,   -- due items, intervals, ease factors
  computed_at      TIMESTAMPTZ NOT NULL
);
```

### 5.4 Layer C -- Policy & Guide Tables (Versioned, Auditable)

#### policy_version

A versioned ruleset reference. The complete rules, thresholds, and explanations are stored in `ruleset_ref` JSONB so policy evaluation is reproducible.

```sql
CREATE TABLE policy_version (
  policy_version_id TEXT PRIMARY KEY,
  created_at        TIMESTAMPTZ NOT NULL,
  version_label     TEXT NOT NULL,
  ruleset_ref       JSONB NOT NULL
);
```

#### policy_decision

Each fired rule produces a decision row with its trigger inference IDs, the decision value, and a human-readable rationale.

```sql
CREATE TABLE policy_decision (
  decision_id      TEXT PRIMARY KEY,
  learner_id       TEXT NOT NULL REFERENCES learner(learner_id),
  profile_version_id TEXT NOT NULL,
  policy_version_id TEXT NOT NULL REFERENCES policy_version(policy_version_id),
  decision_key     TEXT NOT NULL,     -- pacing | spacing | feedback_style | study_skill_lesson | interleaving_level
  decision_value   JSONB NOT NULL,
  triggered_by     JSONB NOT NULL,    -- inference_ids + thresholds fired
  rationale        TEXT NOT NULL,
  computed_at      TIMESTAMPTZ NOT NULL
);
```

#### learning_guide and guide_block

The 7-day learning plan output. The guide stores the full structured payload; guide blocks are calendar-ready primitives.

```sql
CREATE TABLE learning_guide (
  guide_id         TEXT PRIMARY KEY,
  learner_id       TEXT NOT NULL REFERENCES learner(learner_id),
  profile_version_id TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL,
  horizon_days     INT NOT NULL DEFAULT 7,
  guide_payload    JSONB NOT NULL
);

CREATE TABLE guide_block (
  block_id         TEXT PRIMARY KEY,
  guide_id         TEXT NOT NULL REFERENCES learning_guide(guide_id),
  day_index        INT NOT NULL,       -- 1..7
  block_type       TEXT NOT NULL,      -- core_practice | skill_builder | metacog_routine | motivation_support
  planned_minutes  INT NOT NULL,
  concept_ids      TEXT[],
  item_selector    JSONB,              -- how to pick items (spaced queue, interleaving mix)
  completion_criteria JSONB,
  ordering         INT NOT NULL
);
```

#### audit_event

Automatic audit trail for every policy decision. Stores the observation, inference change (before/after with uncertainty), policy change, and a user-visible summary.

```sql
CREATE TABLE audit_event (
  audit_id         TEXT PRIMARY KEY,
  learner_id       TEXT NOT NULL REFERENCES learner(learner_id),
  occurred_at      TIMESTAMPTZ NOT NULL,
  observation      TEXT NOT NULL,
  observation_refs JSONB NOT NULL,
  inference_change JSONB,
  policy_change    JSONB,
  user_visible_summary TEXT NOT NULL
);
```

#### measurement_plan

Stores what the system plans to measure next and why, as a first-class object. Uncertainty drives the measurement plan -- high-uncertainty constructs that affect decisions get priority.

```sql
CREATE TABLE measurement_plan (
  plan_id          TEXT PRIMARY KEY,
  learner_id       TEXT NOT NULL REFERENCES learner(learner_id),
  profile_version_id TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL,
  target_construct_key TEXT NOT NULL,
  reason           TEXT NOT NULL,
  proposed_actions JSONB NOT NULL,
  expected_info_gain REAL
);
```

### 5.5 Content Ingestion Tables

These tables support the material upload, extraction, and knowledge graph construction pipeline.

```sql
CREATE TABLE source_file (
  file_id          TEXT PRIMARY KEY,
  uploaded_by      TEXT NOT NULL REFERENCES learner(learner_id),
  filename         TEXT NOT NULL,
  mime_type        TEXT NOT NULL,
  size_bytes       INT NOT NULL,
  storage_url      TEXT NOT NULL,
  uploaded_at      TIMESTAMPTZ NOT NULL,
  extraction_status TEXT NOT NULL DEFAULT 'pending',  -- pending | processing | completed | failed
  metadata         JSONB
);

CREATE TABLE source_collection (
  collection_id    TEXT PRIMARY KEY,
  created_by       TEXT NOT NULL REFERENCES learner(learner_id),
  name             TEXT NOT NULL,
  description      TEXT,
  created_at       TIMESTAMPTZ NOT NULL,
  updated_at       TIMESTAMPTZ NOT NULL
);

-- Junction: files belong to collections (many-to-many)
CREATE TABLE collection_file (
  collection_id    TEXT NOT NULL REFERENCES source_collection(collection_id),
  file_id          TEXT NOT NULL REFERENCES source_file(file_id),
  added_at         TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (collection_id, file_id)
);

CREATE TABLE extracted_concept (
  extracted_concept_id TEXT PRIMARY KEY,
  file_id          TEXT NOT NULL REFERENCES source_file(file_id),
  concept_id       TEXT REFERENCES concept(concept_id),   -- links to the ontology
  label            TEXT NOT NULL,
  description      TEXT,
  confidence       REAL NOT NULL,
  extraction_model_version TEXT NOT NULL,
  extracted_at     TIMESTAMPTZ NOT NULL
);

CREATE TABLE knowledge_graph_edge (
  edge_id          TEXT PRIMARY KEY,
  source_concept_id TEXT NOT NULL,
  target_concept_id TEXT NOT NULL,
  relation_type    TEXT NOT NULL,       -- prerequisite | related | contains | extends
  weight           REAL NOT NULL DEFAULT 1.0,
  provenance_file_id TEXT REFERENCES source_file(file_id),
  created_at       TIMESTAMPTZ NOT NULL
);

CREATE TABLE tag (
  tag_id           TEXT PRIMARY KEY,
  name             TEXT NOT NULL UNIQUE,
  color            TEXT,
  created_at       TIMESTAMPTZ NOT NULL
);

CREATE TABLE file_tag (
  file_id          TEXT NOT NULL REFERENCES source_file(file_id),
  tag_id           TEXT NOT NULL REFERENCES tag(tag_id),
  PRIMARY KEY (file_id, tag_id)
);

CREATE TABLE project (
  project_id       TEXT PRIMARY KEY,
  created_by       TEXT NOT NULL REFERENCES learner(learner_id),
  name             TEXT NOT NULL,
  description      TEXT,
  created_at       TIMESTAMPTZ NOT NULL,
  updated_at       TIMESTAMPTZ NOT NULL
);

CREATE TABLE project_file (
  project_id       TEXT NOT NULL REFERENCES project(project_id),
  file_id          TEXT NOT NULL REFERENCES source_file(file_id),
  added_at         TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (project_id, file_id)
);
```

---

## 6. Zod Schema Contracts

Zod schemas protect all boundaries: API inputs, AI outputs, policy decisions, and guide payloads. No data crosses a boundary without Zod validation.

### Evidence Ingestion Contracts

```typescript
import { z } from "zod";

// Attempt submission from client
export const AttemptInput = z.object({
  sessionId: z.string(),
  itemId: z.string(),
  response: z.unknown(),
  latencyMs: z.number().int().positive(),
  confidencePre: z.number().min(0).max(1).optional(),
  confidencePost: z.number().min(0).max(1).optional(),
  errorType: z.string().optional(),
  repairOutcome: z.enum(["pass", "fail", "skipped"]).optional(),
  hintCount: z.number().int().min(0).default(0),
});

// Adherence event from client
export const AdherenceEventInput = z.object({
  guideId: z.string(),
  blockId: z.string(),
  eventType: z.enum(["started", "completed", "skipped", "rescheduled"]),
  meta: z.record(z.unknown()).optional(),
});

// Instrument response from client
export const InstrumentResponseInput = z.object({
  instrumentRunId: z.string(),
  itemKey: z.string(),
  response: z.unknown(),
});
```

### Derived Output Contracts

```typescript
// Profile snapshot envelope (Pane A/B/C)
export const ProfileSnapshotSchema = z.object({
  profileVersionId: z.string(),
  createdAt: z.string().datetime(),
  evidenceSummary: z.object({
    masteryMap: z.array(
      z.object({
        conceptId: z.string(),
        posteriorMean: z.number(),
        posteriorSd: z.number(),
        credibleInterval: z.tuple([z.number(), z.number()]),
        evidenceWindow: z.object({
          attemptCount: z.number(),
          since: z.string(),
        }),
      })
    ),
    calibration: z.object({
      ece: z.number(),
      brierScore: z.number(),
      bins: z.array(
        z.object({
          confidence: z.number(),
          accuracy: z.number(),
          n: z.number(),
        })
      ),
    }),
  }),
  inferences: z.array(
    z.object({
      constructKey: z.string(),
      estimate: z.number(),
      uncertaintySd: z.number(),
      confidenceBand: z.enum(["low", "medium", "high"]),
      fastestDisambiguation: z
        .object({
          type: z.string(),
          conceptIds: z.array(z.string()).optional(),
          minutes: z.number().optional(),
        })
        .optional(),
      provenance: z.object({
        modelVersionId: z.string(),
        evidenceRefs: z.record(z.unknown()),
      }),
    })
  ),
  policy: z.array(
    z.object({
      decisionKey: z.string(),
      decisionValue: z.record(z.unknown()),
      rationale: z.string(),
      provenance: z.object({
        policyVersionId: z.string(),
        triggeredByInferenceIds: z.array(z.string()),
      }),
    })
  ),
  guideRef: z.object({ guideId: z.string() }).optional(),
});

// Policy decision schema
export const PolicyDecisionSchema = z.object({
  decisionKey: z.string(),
  decisionValue: z.record(z.unknown()),
  triggeredBy: z.array(z.string()),
  rationale: z.string(),
  policyVersionId: z.string(),
});
```

### AI Output Contracts (Structured Only)

The AI must conform to these schemas. It never outputs scores, thresholds, construct estimates, or policy values.

```typescript
// Guide generation schema
export const GuideSchema = z.object({
  summary: z.string(),
  dailyPlan: z.array(
    z.object({
      dayIndex: z.number(),
      blocks: z.array(
        z.object({
          type: z.enum(["core_practice", "skill_builder", "metacog"]),
          minutes: z.number(),
          description: z.string(),
        })
      ),
    })
  ),
});

// Flashcard set generation
export const FlashcardSetSchema = z.object({
  setId: z.string(),
  title: z.string(),
  conceptIds: z.array(z.string()),
  cards: z.array(
    z.object({
      cardId: z.string(),
      front: z.string(),
      back: z.string(),
      difficulty: z.enum(["recall", "understand", "apply"]),
      conceptId: z.string(),
    })
  ),
});

// Quiz generation
export const QuizSchema = z.object({
  quizId: z.string(),
  title: z.string(),
  conceptIds: z.array(z.string()),
  questions: z.array(
    z.object({
      questionId: z.string(),
      stem: z.string(),
      options: z.array(
        z.object({
          optionId: z.string(),
          text: z.string(),
          isCorrect: z.boolean(),
          explanation: z.string().optional(),
        })
      ),
      conceptId: z.string(),
      bloomLevel: z.enum([
        "remember",
        "understand",
        "apply",
        "analyze",
        "evaluate",
        "create",
      ]),
    })
  ),
});

// Text content generation
export const TextContentSchema = z.object({
  contentId: z.string(),
  title: z.string(),
  conceptIds: z.array(z.string()),
  sections: z.array(
    z.object({
      heading: z.string(),
      body: z.string(),
      keyTerms: z.array(z.string()).optional(),
    })
  ),
});
```

### Material Ingestion Contracts

```typescript
// File upload input
export const FileUploadInput = z.object({
  filename: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive(),
  tags: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  collectionId: z.string().optional(),
});

// Extracted concept from file processing
export const ExtractedConceptOutput = z.object({
  label: z.string(),
  description: z.string().optional(),
  confidence: z.number().min(0).max(1),
  relatedConcepts: z
    .array(
      z.object({
        label: z.string(),
        relationType: z.enum([
          "prerequisite",
          "related",
          "contains",
          "extends",
        ]),
        weight: z.number(),
      })
    )
    .optional(),
});
```

---

## 7. Material Ingestion Pipeline

### Supported Input Types and Extraction Strategies

| Input Type | MIME Types | Extraction Strategy |
|---|---|---|
| PDF documents | `application/pdf` | Text extraction, section parsing, concept identification via AI structured output |
| Markdown / text | `text/markdown`, `text/plain` | Direct parsing, heading-based section splitting |
| Video (link) | URL reference | Transcript extraction, timestamp-based concept mapping |
| Code files | `text/x-*`, `application/*` | AST parsing where applicable, comment extraction, function/class identification |
| Slide decks | `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-*` | Slide-by-slide text extraction, image description |
| Web pages | URL reference | Content scraping, structured data extraction |

### Extraction Pipeline

1. **Upload and storage** -- File is stored (Vercel Blob or equivalent), metadata written to `source_file` table with `extraction_status = 'pending'`.
2. **Content extraction** -- Background job extracts text content based on MIME type. Status moves to `'processing'`.
3. **Concept identification** -- AI SDK (`generateObject`) identifies concepts from extracted text, constrained by `ExtractedConceptOutput` Zod schema. Each concept stored in `extracted_concept` with confidence score and extraction model version.
4. **Knowledge graph construction** -- Identified concepts are linked via `knowledge_graph_edge` with relation types (prerequisite, related, contains, extends). Edges reference the source file for provenance.
5. **Ontology integration** -- Extracted concepts are matched to existing `concept` table entries or create new ones. Matching uses semantic similarity with a confidence threshold.
6. **Status update** -- `extraction_status` moves to `'completed'` (or `'failed'` with error metadata).

### Knowledge Graph Construction

The knowledge graph is built incrementally as files are ingested:

- **Nodes** = concepts (from the `concept` table, populated by extraction and manual curation)
- **Edges** = relationships stored in `knowledge_graph_edge` with typed relations and weights
- The graph supports prerequisite ordering for concept sequencing in learning guides
- Edge provenance tracks which source file(s) contributed each relationship

### Tags and Collections System

- **Tags** are global, reusable labels with optional color. Tags can be applied to files via `file_tag`.
- **Collections** group files logically (e.g., "Linear Algebra Textbook Chapters"). Many-to-many via `collection_file`.
- **Projects** group files by learning context. Many-to-many via `project_file`.
- The UI supports CRUD for all three, with the files screen providing filterable, bulk-editable datatable access.

---

## 8. Learning Profile DNA (Inference Engine)

### Module Structure

The inference engine is a deterministic domain module. No AI is used. All computation is versioned and reproducible.

```
/lib/inference/
    mastery.ts         -- Bayesian beta updating per concept
    calibration.ts     -- ECE and Brier score computation
    constructs.ts      -- Risk/support construct inference
    dropout.ts         -- Dropout risk estimation from adherence
    index.ts           -- recomputeProfile orchestrator
```

### Orchestrator

```typescript
export async function recomputeProfile(learnerId: string) {
  const evidence = await loadEvidence(learnerId);
  const mastery = await computeMastery(evidence);
  const calibration = computeCalibration(evidence);
  const constructs = computeConstructs(evidence, mastery);
  const dropoutRisk = computeDropoutRisk(evidence);
  const profileVersion = await persistProfile(
    learnerId,
    mastery,
    calibration,
    constructs,
    dropoutRisk
  );
  return profileVersion;
}
```

Each function:

1. Takes `learnerId` (and relevant evidence subset)
2. Queries the evidence layer
3. Produces versioned results with uncertainty
4. Writes derived tables with `model_version_id`, `profile_version_id`, and `computed_at`
5. Returns results for the profile snapshot

### Mastery Model (Bayesian Beta)

The v1 mastery model uses Bayesian updating with a Beta distribution for P(correct) per concept.

- **Prior:** Beta(alpha=1, beta=1) -- uniform prior (no prior knowledge assumed)
- **Update rule:** On each attempt, if correct: alpha += 1; if incorrect: beta += 1
- **Posterior mean:** `alpha / (alpha + beta)`
- **Posterior SD:** `sqrt(alpha * beta / ((alpha + beta)^2 * (alpha + beta + 1)))`
- **Credible interval:** Computed from the Beta distribution (e.g., 90% credible interval)

The schema supports future upgrades to IRT (Item Response Theory) or BKT (Bayesian Knowledge Tracing) without migration -- `posterior_mean` and `posterior_sd` are model-agnostic fields.

### Calibration Model

Calibration measures metacognitive accuracy -- how well a learner's confidence predicts actual correctness.

- **ECE (Expected Calibration Error):** Mean absolute difference between confidence and accuracy across bins
- **Brier Score:** Mean squared error of probabilistic predictions vs. outcomes
- **Bin curve:** Confidence values bucketed into bins; each bin stores average confidence, average accuracy, and count

Computed from `(confidence_pre, is_correct)` pairs across the learner's attempt history.

### Construct Inference

Each construct (cognitive load risk, self-regulation risk, motivation support needed) is inferred from a combination of behavioral signals and optional instrument scores:

- **cognitive_load_risk**: Derived from latency patterns on multi-step items + error rate under complexity
- **self_regulation_risk**: Derived from spacing adherence telemetry + optional LASSI/MAI scores
- **motivation_support_needed**: Derived from SDT/MSLQ scores + dropout/adherence signals

Each inference stores `estimate`, `uncertainty_sd`, `confidence_band`, `evidence_refs`, and `fastest_disambiguation` (what measurement would reduce uncertainty most efficiently).

### Profile Versioning

When `recomputeProfile` runs:

1. Create a new `profile_version` row with `parent_profile_version_id` pointing to the previous version
2. Attach all new mastery estimates, calibration summary, and construct inferences to this version
3. Generate `audit_event` entries for any changes
4. Snapshot the review queue state
5. The `summary_payload` JSONB contains the compiled Pane A/B/C view

Profiles are immutable snapshots. Diffs between versions are computed by comparing the current and parent snapshots.

**JSON Envelope Example (Profile Version):**

```json
{
  "profile_version_id": "01J...ULID",
  "created_at": "2026-03-03T18:22:11Z",
  "evidence_summary": {
    "mastery_map": [
      {
        "concept_id": "concept.linear_algebra.gaussian_elim",
        "posterior_mean": 0.62,
        "posterior_sd": 0.11,
        "credible_interval": [0.41, 0.81],
        "evidence_window": { "attempt_count": 18, "since": "2026-02-24" }
      }
    ],
    "calibration": {
      "ece": 0.08,
      "brier_score": 0.17,
      "bins": [{ "confidence": 0.7, "accuracy": 0.62, "n": 24 }]
    }
  },
  "inferences": [
    {
      "construct_key": "cognitive_load_risk",
      "estimate": 0.66,
      "uncertainty_sd": 0.14,
      "confidence_band": "medium",
      "fastest_disambiguation": {
        "type": "targeted_items",
        "concept_ids": ["concept.linear_algebra.matrix_multistep"],
        "minutes": 6
      },
      "provenance": {
        "model_version_id": "model.load.v0.4.2",
        "evidence_refs": { "attempt_ids": ["01J..", "01J.."] }
      }
    }
  ],
  "policy": [
    {
      "decision_key": "pacing",
      "decision_value": { "chunk_size": 4, "worked_example_ratio": 0.5 },
      "rationale": "Latency rose on multi-step items; load risk increased (medium confidence).",
      "provenance": {
        "policy_version_id": "policy.v1.3",
        "triggered_by_inference_ids": ["01J.."]
      }
    }
  ],
  "guide_ref": { "guide_id": "01J..." }
}
```

---

## 9. Policy Engine

### Architecture and Module Structure

The policy engine is a deterministic rule system. No AI is used. Rules are defined as data, not code, enabling versioning and A/B testing of rulesets.

```
/lib/policy/
    rules.ts       -- Rule definitions as typed data
    evaluate.ts    -- Rule evaluation against inferences
    audit.ts       -- Audit event generation
    index.ts       -- Policy evaluation orchestrator
```

### Policy Rules v1

Rules are structured objects with conditions, actions, and rationale templates.

```typescript
type PolicyRule = {
  decisionKey: string;
  condition: {
    construct: string;
    operator: "gte" | "lte" | "between";
    threshold: number;
    confidenceRequired: "low" | "medium" | "high";
  };
  action: Record<string, unknown>;
  rationaleTemplate: string;
};
```

**v1 Ruleset:**

| Rule | Decision Key | Construct | Threshold | Confidence Required | Action | Rationale |
|---|---|---|---|---|---|---|
| R1 | `pacing` | `cognitive_load_risk` | >= 0.6 | medium | `{ chunkSize: 4, workedExampleRatio: 0.5 }` | "Latency increased on multi-step items; reducing chunk size and adding worked examples." |
| R2 | `pacing` | `cognitive_load_risk` | < 0.3 | medium | `{ chunkSize: 8, workedExampleRatio: 0.1 }` | "Low cognitive load risk; increasing chunk size for efficiency." |
| R3 | `spacing` | mastery `posterior_sd` | > 0.15 | low | `{ intervalMultiplier: 0.7 }` | "High mastery uncertainty; shortening spacing intervals for more data." |
| R4 | `metacog_insertion` | calibration `ece` | >= 0.12 | medium | `{ insertPredictionLoop: true, frequency: "every_3rd_item" }` | "Calibration error is high; inserting prediction-reflection loops." |
| R5 | `study_skill_lesson` | `self_regulation_risk` | >= 0.5 | medium | `{ lessonType: "time_management", durationMinutes: 5 }` | "Self-regulation risk elevated; adding study-skill micro-lesson." |
| R6 | `feedback_style` | `motivation_support_needed` | >= 0.6 | medium | `{ style: "autonomy_supportive", choiceSets: 3 }` | "Motivation support needed; switching to autonomy-supportive feedback with choice sets." |
| R7 | `interleaving_level` | mastery `posterior_mean` (cross-concept) | >= 0.5 | medium | `{ interleavingRatio: 0.4 }` | "Sufficient mastery across multiple concepts; introducing interleaving." |

### Evaluation

```typescript
export function evaluatePolicy(
  inferences: ConstructInference[],
  masteryEstimates: MasteryEstimate[],
  calibration: CalibrationSummary,
  policyVersion: PolicyVersion
): PolicyDecision[] {
  const rules = policyVersion.ruleset_ref as PolicyRule[];
  const decisions: PolicyDecision[] = [];

  for (const rule of rules) {
    const inference = findMatchingInference(rule.condition, inferences, masteryEstimates, calibration);
    if (inference && meetsConfidenceGate(inference, rule.condition.confidenceRequired)) {
      if (meetsThreshold(inference, rule.condition)) {
        decisions.push({
          decisionKey: rule.decisionKey,
          decisionValue: rule.action,
          triggeredBy: [inference.inferenceId],
          rationale: interpolateRationale(rule.rationaleTemplate, inference),
          policyVersionId: policyVersion.policyVersionId,
        });
      }
    }
  }

  return decisions;
}
```

**Confidence gating:** If a construct's `confidence_band` does not meet the rule's `confidenceRequired` level, the rule does not fire. This prevents premature policy changes when uncertainty is high. The fallback behavior when uncertainty is too high is to maintain the previous decision (or use conservative defaults).

### Audit Log Generation

Every policy decision automatically generates an audit event. This is triggered inside the policy engine, not as an afterthought.

```typescript
function createAuditEvent(
  learnerId: string,
  observation: string,
  observationRefs: Record<string, unknown>,
  inferenceChange: { before: unknown; after: unknown } | null,
  policyChange: { decisionIds: string[] } | null,
  userVisibleSummary: string
): AuditEvent {
  return {
    auditId: generateULID(),
    learnerId,
    occurredAt: new Date().toISOString(),
    observation,
    observationRefs,
    inferenceChange,
    policyChange,
    userVisibleSummary,
  };
}
```

### Policy Versioning

Policy versions are immutable. When rules change (thresholds adjusted, new rules added), a new `policy_version` row is created. All decisions reference the version that produced them, enabling:

- Reproducibility: re-run any policy version against any profile version
- A/B testing: run different policy versions for different learner cohorts
- Rollback: revert to a previous policy version if metrics degrade

---

## 10. AI Generation Pipeline

### AI SDK Integration Pattern

All AI usage goes through the Vercel AI SDK `generateObject` function with strict Zod schema validation. The AI never receives raw evidence or inference data -- it receives only the computed policy decisions and constraints.

```typescript
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

export async function generateLearningGuide(
  policyDecisions: PolicyDecision[],
  masteryMap: MasteryEstimate[],
  timeConstraints: { minutesPerDay: number; daysPerWeek: number },
  goalType: string
) {
  const structuredPrompt = buildGuidePrompt(
    policyDecisions,
    masteryMap,
    timeConstraints,
    goalType
  );

  const result = await generateObject({
    model: openai("gpt-4.1"),
    schema: GuideSchema,
    prompt: structuredPrompt,
  });

  return result.object;
}
```

All models use the `AI_GATEWAY_API_KEY` environment variable for access.

### Guide Generation

The guide generation pipeline:

1. Policy engine produces decisions (pacing, spacing, metacog insertion, study-skill lessons, feedback style)
2. Mastery map provides concept priorities and uncertainty
3. Time constraints come from the learner's `learning_goal`
4. These inputs are assembled into a structured prompt
5. AI SDK generates the guide narrative constrained by `GuideSchema`
6. The output is persisted to `learning_guide` and `guide_block` tables

The AI generates descriptions and summaries only. It does not determine which concepts to teach, how to pace them, or what spacing intervals to use -- those are policy decisions.

### Learning Artifact Types

The learning agent generates four types of artifacts, each constrained by a Zod schema:

| Artifact Type | Schema | Description |
|---|---|---|
| Flashcards | `FlashcardSetSchema` | Front/back cards with difficulty level and concept mapping |
| Quizzes | `QuizSchema` | Multiple-choice questions with Bloom's level classification |
| Text Content | `TextContentSchema` | Structured explanations with headings, body text, and key terms |
| Video | URL reference + transcript | Video content referenced by URL with AI-generated transcript summaries |

### Agent System (AGENTS.md Pattern)

Learning agents are configured using markdown files (AGENTS.md pattern) combined with `just-bash` and `bash-tools`. Each agent:

- Consumes the Core Model as JSON input
- Has configured channels, commands, and abilities
- References source materials (files and collections)
- Outputs structured JSON conforming to artifact Zod schemas
- Maintains a progress markdown file (created if not present)
- Stores internal evals and operational data in the database
- Saves its configuration as a markdown file that can be edited later

### Content Evals (evalite)

The system uses the `evalite` library to run evaluations on three pipelines:

1. **Core Model generations** -- Validate that generated guides conform to policy decisions and are scientifically grounded
2. **Content file ingestion** -- Validate concept extraction quality, knowledge graph edge accuracy
3. **Learning agent generations** -- Validate artifact quality, schema conformance, concept coverage

---

## 11. User Flows

### Flow 0 -- Entry and Positioning (Trust Contract)

**Screen 0.1 -- Landing / Product Promise**

Primary message: "We don't label you. We measure what helps you learn next -- with confidence intervals."

Key bullets:

- "Scores are estimates with error bars."
- "We personalize primarily on mastery evidence, not preference surveys."
- "We will show why we recommend each next step (audit trail)."

CTA: "Start your baseline"

If authenticated, redirects to `/dashboard`. If not, redirects to login.

### Flow 1 -- Consent + Data Minimization

**Screen 1.1 -- Data and Consent**

User choices (granular):

1. **Required:** Learning telemetry for mastery (quiz/task performance, response time)
2. **Optional modules** (each explained by decision impact):
   - Metacognition (MAI) -- changes whether prediction/reflection loops are inserted ([3])
   - Study strategies (LASSI) -- unlocks targeted study-skill micro-lessons ([4])
   - Motivation supports (MSLQ / SDT mini-scale) -- changes coaching style, autonomy supports, dropout prevention ([5], [6])
   - Coaching tone (Big Five) -- adjusts feedback language only ([7])
   - CRT reasoning check (rotated) -- changes reflective prompt insertion; includes exposure detection ([2], [8])
   - Preferences (UX only) -- changes presentation mix only; no pedagogy claims ([1])

Microcopy: "Preference does not equal effectiveness. We will not 'mesh' instruction to learning styles." ([1])

CTA: "Continue to baseline"

### Flow 2 -- Baseline Setup (Domain + Goal)

**Screen 2.1 -- Choose domain(s):**
User selects a domain (e.g., "Linear Algebra," "Intro Programming") or "Build your own syllabus" (paste topics).

**Screen 2.2 -- Define goal + constraints:**

- Goal type: Exam, Project, General fluency, Teach it
- Time budget slider: minutes/day + days/week
- Deadline (optional)
- Prior exposure quick check (self-report, low-weight)

CTA: "Run baseline assessment"

### Flow 3 -- Behavior-First Assessment (Backbone)

**Screen 3.1 -- Adaptive mastery baseline (10-15 minutes):**
Short mixed diagnostic with retrieval questions, application, and near-transfer items. Tracks correctness, error types, latency, hint usage, and confidence pre/post.

**Screen 3.2 -- Metacognitive loop embedded:**
After a subset of items: (1) "How confident are you?" (prediction), (2) Attempt, (3) "What went wrong?" (error type), (4) Repair (micro-explanation + near-transfer).

This directly operationalizes metacognition in a way that changes intervention. ([3])

CTA: "See your initial learner map"

### Flow 4 -- Optional Modules

**Screen 4.1 -- Module selector ("Add accuracy to your profile"):**

Card-based chooser that explains the decision impact before asking questions. Each card shows what policy decisions the module affects and how many minutes it takes.

CTA: "Add modules" / "Skip for now"

### Flow 5 -- Profile Generation (Evidence, Inference, Policy)

**Screen 5.1 -- "Your Learner Profile (Version 1.0)":**

Three panes:

- **Pane A (Evidence):** Mastery map by concept with confidence, error taxonomy highlights, retrieval stability indicators, time-to-solution distribution, calibration curve
- **Pane B (Inferences):** Each inference shows estimate, uncertainty, confidence band, and what would reduce uncertainty fastest
- **Pane C (Policy):** Next actions expressed as rules + rationale (spacing adjustments, pacing rules, feedback style, study-skill lessons)

CTA: "Generate my learning guide"

### Flow 6 -- Learning Guide (Main Output)

**Screen 6.1 -- "Your Learning Guide: next 7 days":**

A concrete, goal-linked, time-budgeted plan with:

1. Daily plan (calendar-ready 20-45 minute blocks)
2. Concept sequence with mastery gates
3. Metacognitive routine (2 minutes: prediction, attempt, reflection, repair)
4. Motivation supports (if opted/inferred): autonomy choices, competence proof checks
5. Risk flags and countermeasures

CTA: "Start Day 1"

### Flow 7 -- In-Session Learning Experience

**Screen 7.1 -- Lesson / practice session:**
Retrieval practice items, short reflection loops at strategic points, effort-aware pacing (chunking, worked examples when load is high).

**Screen 7.2 -- Session wrap ("What changed because of today?"):**
Shows updated mastery delta, updated calibration delta, and 1-2 policy changes (if any) each with a reason.

CTA: "Continue tomorrow" / "Adjust plan"

### Flow 8 -- Audit Log + Model Card

**Screen 8.1 -- Audit log (per recommendation):**
For each adaptive decision: Observation, Inference, Change.

**Screen 8.2 -- Profiler model card:**
Signals used, known failure modes, fairness considerations. CRT exposure contamination + rotation ([2], [8]). Learning styles disclaimer ([1]). Personality use limited to tone ([7]).

### Flow 9 -- Re-Assessment + Profile Versioning

**Screen 9.1 -- Weekly "Profile update":**
"Profile v1.1" with diffs: what improved, what remains uncertain, which measurement will reduce uncertainty fastest next week.

**Screen 9.2 -- Optional re-takes (targeted, not repetitive):**
If uncertainty is high on a construct that affects decisions, prompt a short targeted measure.

---

## 12. Screen Specifications

### Dashboard (`/dashboard`)

The main screen after authentication. A filterable grid of projects in a Notebook LM-style layout. Each project card shows name, description, tags, file count, and last updated. Supports create, edit, delete operations.

Blocked by auth -- unauthenticated users are redirected to login. For development, a button allows login with a fake email and password.

### Core Model Editor (`/dashboard/core-model`)

Two views for creating and editing the Core Model (one per persona):

**View 1: Node Graph**

- Interactive node graph visualization grouped by category model attributes
- Sidebar panel appears when selecting nodes or edges
- Nodes represent constructs, concepts, and policy rules
- Edges represent relationships (prerequisite, influence, dependency)
- Real-time updates to the underlying model JSON

**View 2: Form Wizard**

- Type-form style, snap-scroll, vertical swipe form wizard
- 12 screens, each with:
  - Placeholder headline
  - Form field(s) (React Hook Form with loading spinners)
  - Next/Save button and Back button
  - Fixed header with pagination indicators
- Endpoint generates the Core Model JSON on mutation (happens on save)

**View 3: JSON Panel**

- Full-panel view of the Core Model as formatted JSON
- Read-only display of the complete model state

### Tags CRUD (`/dashboard/tags`)

Grid of tags with:

- Create new tag form (name, color)
- Edit existing tags inline
- Delete with confirmation
- Each tag shows which files and projects reference it
- Search/filter capability

### Files CRUD (`/dashboard/files`)

Filterable, searchable, bulk-editable datatable of files with:

- Upload new files (drag and drop, file picker)
- Edit individual file metadata (tags, projects, collections)
- CRUD for collections of files
- Edit collection metadata
- File preview capability
- Bulk operations (tag, move to collection, delete)
- Column sorting and filtering

### Learning Agent (`/dashboard/agents/[agentId]`)

Split-panel interface:

**Sidebar:**

- List of learning agents (tile grid navigation)
- Create and configure new agent form
- Settings: channels, commands, abilities
- CRUD for files and collections assigned to the agent
- Agent metadata (tags, projects)

**Main Panel: Canvas + Chat**

The chat conversation renders custom UI components (via JSON Render) and supports:

- Tool calls with reasoning display
- Loading spinners on load
- MCP UI integration
- Attachments
- Model selection
- Deep research mode
- Off-the-record mode
- Permissions
- Copy, share, thumbs up/down

**Artifacts** are modules for learning subject matter, rendered in the canvas area:

- Flash cards
- Quizzes
- Text content
- Video

The canvas supports scrolling through generated resources (similar to scrolling through form fields in the Core Model wizard).

The agent consumes the Core Model as JSON, checks for a current progress markdown file (creates one if missing), and outputs structured JSON for learning materials. Its internal evals and data are stored in the database.

---

## 13. Event Taxonomy

The canonical event list for telemetry. All events are stored in the evidence layer. Every event includes a timestamp and learner ID.

| Event Name | Fields | Description |
|---|---|---|
| `session.started` | `sessionId`, `sessionType`, `goalId`, `adaptiveAlgoVersion` | Learner begins an assessment or practice session |
| `session.ended` | `sessionId`, `endedAt` | Session concludes |
| `attempt.submitted` | `attemptId`, `sessionId`, `itemId`, `response`, `isCorrect`, `latencyMs`, `hintCount`, `errorType` | Learner submits an answer to an item |
| `confidence.pre` | `attemptId`, `confidencePre` | Learner rates confidence before attempting |
| `confidence.post` | `attemptId`, `confidencePost` | Learner rates confidence after attempting |
| `reflection.submitted` | `attemptId`, `errorType`, `reflectionText` | Learner submits error attribution |
| `repair.completed` | `attemptId`, `repairOutcome` | Learner completes repair micro-explanation |
| `hint.used` | `attemptId`, `hintIndex` | Learner requests a hint |
| `guide.block.started` | `guideId`, `blockId`, `dayIndex` | Learner begins a guide block |
| `guide.block.completed` | `guideId`, `blockId`, `dayIndex` | Learner finishes a guide block |
| `guide.block.skipped` | `guideId`, `blockId`, `dayIndex`, `reason` | Learner skips a guide block |
| `guide.block.rescheduled` | `guideId`, `blockId`, `fromDay`, `toDay` | Learner reschedules a guide block |
| `profile.recomputed` | `profileVersionId`, `parentProfileVersionId` | New profile version created |
| `policy.decision.applied` | `decisionId`, `decisionKey`, `policyVersionId` | Policy decision fires and is applied |
| `instrument.started` | `instrumentRunId`, `instrumentType` | Learner begins an optional instrument |
| `instrument.completed` | `instrumentRunId`, `instrumentType` | Learner completes an optional instrument |
| `crt.exposure.self_reported` | `itemId`, `selfReportPriorExposure` | Learner reports prior exposure to a CRT item |
| `item_exposure.detected` | `exposureId`, `itemId`, `timesSeen`, `contaminationFlag` | System detects item exposure |

---

## 14. Success Metrics & Evaluation Plan

### Primary Metrics

Because of the schema design, the following metrics are computable from the evidence and inference layers without additional instrumentation:

| Metric | Definition | Source |
|---|---|---|
| **Mastery retention** | Posterior mean at 7, 14, and 30 days after initial mastery threshold | `mastery_estimate` over time |
| **Calibration improvement** | ECE and Brier score change over profile versions | `calibration_summary` diffs |
| **Mastery posterior contraction** | Reduction in `posterior_sd` over time (uncertainty shrinkage) | `mastery_estimate.posterior_sd` |
| **Adherence rate** | Percentage of guide blocks completed vs. planned | `adherence_event` / `guide_block` |
| **Persistence** | Days active / days planned over 30-day window | `assessment_session` timestamps |
| **Time-to-mastery** | Sessions from first exposure to mastery threshold per concept | `attempt` + `mastery_estimate` |
| **Policy stability** | Number of policy decision changes per profile version | `policy_decision` diffs |
| **Information gain per measurement** | Expected information gain realized vs. predicted | `measurement_plan.expected_info_gain` vs. actual uncertainty reduction |

### A/B Testing Strategy

Policy versioning enables rigorous A/B testing:

1. Create two `policy_version` entries (control and treatment)
2. Assign learners to cohorts
3. Run both policy versions for a defined period
4. Compare primary metrics between cohorts
5. Statistical significance testing before promoting a policy version

### Rollback Rules

- If policy X does not outperform baseline Y on metric Z for cohort C after the defined evaluation period, revert to the previous policy version.
- Motivation support features are evaluated via adherence and persistence changes and goal completion, consistent with SDT framing. ([5])
- Rollback is automatic if a policy version shows statistically significant degradation on any primary metric.

---

## 15. Open Questions & Risks

| # | Question / Risk | Impact | Mitigation |
|---|---|---|---|
| 1 | How many items are needed in the item bank per domain for reliable mastery estimation? | Insufficient items produce high-uncertainty estimates that prevent policy rules from firing | Start with a minimum of 30 items per concept covering retrieval, application, and near-transfer types |
| 2 | What is the minimum number of attempts before the Beta posterior is informative? | Too few attempts means high posterior SD, which gates all policy decisions | Set a "cold start" threshold (e.g., 5 attempts per concept) with explicit fallback to conservative defaults |
| 3 | CRT form rotation inventory size | Small form families exhaust quickly with repeated learners | Maintain at least 3 form variants per CRT item; track contamination aggressively |
| 4 | Inference recompute latency | Background jobs may lag behind the learner's session pace | Define maximum acceptable latency (e.g., < 30 seconds); batch at session end, not per attempt |
| 5 | AI model reliability for structured output | Schema violations or hallucinated content in guide generation | Zod validation catches malformed output; retry with exponential backoff; fallback to template-based generation |
| 6 | LASSI and MAI licensing for production use | Some instruments have commercial licensing requirements | Verify licensing terms before launch; budget for licensing fees or develop equivalent validated instruments |
| 7 | Learner trust in uncertainty display | Showing error bars may confuse or discourage some learners | User test the uncertainty UX; provide progressive disclosure (simple view vs. detailed view) |
| 8 | Cold-start for new domains | No item bank, no concept graph, no baseline data | Content ingestion pipeline must produce a usable concept graph and initial item bank from uploaded materials |

---

## 16. Glossary

| Term | Definition |
|---|---|
| **Attempt** | A single learner response to a single item, with associated behavioral telemetry (latency, confidence, error type, repair outcome) |
| **Bayesian Beta** | A probability distribution (Beta distribution) used to model mastery as P(correct), updated with each attempt |
| **BKT** | Bayesian Knowledge Tracing -- a more sophisticated mastery model that can replace the Beta model in future versions |
| **Brier Score** | Mean squared error of probabilistic predictions vs. binary outcomes; measures calibration quality |
| **Calibration** | The degree to which a learner's confidence ratings match their actual accuracy |
| **Confidence Band** | Categorical uncertainty level (low / medium / high) derived from posterior SD |
| **Construct** | A measurable psychological or cognitive attribute (e.g., cognitive load risk, self-regulation risk) |
| **Core Model** | The complete configuration of a learner's profile, policy rules, and learning plan |
| **CRT** | Cognitive Reflection Test -- measures reflective vs. intuitive thinking; subject to contamination from prior exposure |
| **ECE** | Expected Calibration Error -- mean absolute difference between confidence and accuracy across bins |
| **Evidence Layer** | The immutable, append-only data layer containing all raw behavioral observations |
| **Form Family** | A group of item variants that test the same construct but with different surface features, used for rotation to prevent contamination |
| **Inference Layer** | The versioned, deterministic layer that derives estimates from evidence |
| **IRT** | Item Response Theory -- a statistical framework for item and ability estimation |
| **LASSI** | Learning and Study Strategies Inventory -- measures study strategy use and self-regulation |
| **MAI** | Metacognitive Awareness Inventory -- measures awareness and control over planning, monitoring, and evaluating |
| **Mastery Estimate** | A Bayesian posterior estimate of P(mastery) for a specific concept, with uncertainty |
| **MSLQ** | Motivated Strategies for Learning Questionnaire -- measures motivation, learning strategies, and metacognitive self-regulation |
| **Policy Decision** | A specific adaptive action (e.g., change pacing, insert metacognitive loop) produced by the policy engine with full provenance |
| **Policy Engine** | The deterministic rule system that converts inferences into actionable decisions |
| **Policy Version** | An immutable snapshot of the complete ruleset used for policy evaluation |
| **Posterior SD** | Standard deviation of the posterior distribution; represents uncertainty in an estimate |
| **Profile Version** | An immutable snapshot of a learner's complete profile (evidence summary + inferences + policy decisions) |
| **SDT** | Self-Determination Theory -- framework for intrinsic motivation based on autonomy, competence, and relatedness |
| **ULID** | Universally Unique Lexicographically Sortable Identifier -- time-sortable unique IDs used for all primary keys |

---

## 17. Appendices

### Appendix A: JSON API Envelope

The portable JSON envelope used across services while keeping the database normalized. This is the primary response format for the `/api/profile` endpoint.

```json
{
  "profile_version_id": "01J...ULID",
  "created_at": "2026-03-03T18:22:11Z",
  "evidence_summary": {
    "mastery_map": [
      {
        "concept_id": "concept.linear_algebra.gaussian_elim",
        "posterior_mean": 0.62,
        "posterior_sd": 0.11,
        "credible_interval": [0.41, 0.81],
        "evidence_window": {
          "attempt_count": 18,
          "since": "2026-02-24"
        }
      }
    ],
    "calibration": {
      "ece": 0.08,
      "brier_score": 0.17,
      "bins": [
        {
          "confidence": 0.7,
          "accuracy": 0.62,
          "n": 24
        }
      ]
    }
  },
  "inferences": [
    {
      "construct_key": "cognitive_load_risk",
      "estimate": 0.66,
      "uncertainty_sd": 0.14,
      "confidence_band": "medium",
      "fastest_disambiguation": {
        "type": "targeted_items",
        "concept_ids": ["concept.linear_algebra.matrix_multistep"],
        "minutes": 6
      },
      "provenance": {
        "model_version_id": "model.load.v0.4.2",
        "evidence_refs": {
          "attempt_ids": ["01J..", "01J.."]
        }
      }
    }
  ],
  "policy": [
    {
      "decision_key": "pacing",
      "decision_value": {
        "chunk_size": 4,
        "worked_example_ratio": 0.5
      },
      "rationale": "Latency rose on multi-step items; load risk increased (medium confidence).",
      "provenance": {
        "policy_version_id": "policy.v1.3",
        "triggered_by_inference_ids": ["01J.."]
      }
    }
  ],
  "guide_ref": {
    "guide_id": "01J..."
  }
}
```

### Appendix B: Review Queue State Example

```json
{
  "due": ["item_01J_abc", "item_01J_def"],
  "intervals": {
    "item_01J_abc": 3.2,
    "item_01J_def": 7.1
  },
  "easeFactors": {
    "item_01J_abc": 2.5,
    "item_01J_def": 2.1
  },
  "algorithmVersion": "spaced_v1"
}
```

### Appendix C: Drizzle ORM Pattern

All tables follow this Drizzle pattern for consistency:

```typescript
import {
  pgTable,
  text,
  timestamp,
  jsonb,
  boolean,
  real,
  integer,
} from "drizzle-orm/pg-core";

export const learner = pgTable("learner", {
  learnerId: text("learner_id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  locale: text("locale"),
  timezone: text("timezone"),
});
```

Critical rules for Drizzle schema implementation:

- Strong typing throughout (no `any` casts)
- JSONB only where flexibility is genuinely required
- ULID for all primary keys (sortable by time)
- Evidence tables never have update operations
- Inference tables always include `modelVersionId`, `profileVersionId`, `computedAt`

### Appendix D: UX Copy Guardrails

These lines must appear in multiple places (consent, profile, preferences) to prevent pseudoscience:

- "We do not optimize for 'learning styles' effectiveness; evidence does not support meshing instruction to style inventories." ([1])
- "Traits can predict tendencies, not determine outcomes; we don't lock you into tracks." ([7])
- "Some tasks can be contaminated by prior exposure; we rotate item forms." ([2], [8])
