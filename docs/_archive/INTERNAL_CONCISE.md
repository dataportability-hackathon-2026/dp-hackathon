# Core Model (Internal) - Concise Spec

**Version:** 1.0  
**Date:** 2026-03-04  
**Status:** Draft  
**Classification:** Internal

---

## 1) Executive Summary

Core Model is an evidence-based, uncertainty-native adaptive learning system for Masters-level self-directed learners.

It is built on 3 strict layers:

1. **Evidence (append-only):** raw learner behavior (attempts, latency, confidence, adherence, instrument responses).
2. **Inference (versioned):** deterministic estimates with uncertainty (mastery, calibration, construct risks/support needs).
3. **Policy (versioned + auditable):** deterministic rules that choose interventions and produce a 7-day guide.

**AI boundary:** AI is used only for structured text/content generation. AI never scores learners, computes inferences, or fires policy rules.

### v1 Scope

- Baseline + ongoing practice loop with full attempt telemetry.
- Profile panes: Evidence / Inference / Policy with version diffs.
- 7-day learning guide generation.
- Audit log for every recommendation ("what changed and why").
- Optional modules: MAI, LASSI, MSLQ, SDT, CRT (rotated), Big Five, preference survey (UX only).
- Material ingestion pipeline + knowledge graph.
- Learning agent (chat + canvas) for artifacts.

---

## 2) Problem, Vision, Persona

### Problem

Most adaptive systems fail one or more of these:

- weak science,
- fake precision (no uncertainty),
- opaque personalization,
- no auditable chain from evidence to recommendation.

### Product Thesis ("Truth over personalization")

1. Measure signals that predict outcomes.
2. Store estimates with uncertainty.
3. Make every adaptation traceable.
4. Never over-claim certainty.

### Target User

Masters-level autodidact who wants transparent, evidence-based guidance and can do a short baseline setup.

### Anti-patterns explicitly rejected

- Learning-styles meshing as pedagogy.
- Personality-gated difficulty.
- Opaque AI scoring.
- Point estimates without uncertainty.
- Uncontrolled CRT usage without contamination controls.

---

## 3) Scientific Framework

### Construct inventory (what we measure)

- **Required:** domain mastery, calibration, Bloom-level behavior signals.
- **Optional:** CRT, MAI, LASSI, MSLQ, SDT, Big Five, preference survey.
- **Rule:** if a construct does not change a decision, it is not measured.

### Intervention map (evidence -> inference -> decision -> intervention)

- **Mastery evidence** -> mastery posterior -> pacing/spacing/item selection -> retrieval/spacing/interleaving/worked examples.
- **Calibration evidence** -> ECE/Brier -> metacognitive loop insertion -> prediction/attempt/reflection/repair.
- **Load and self-regulation signals** -> risk estimates -> chunking/scaffold/study-skill modules.
- **Motivation signals** -> support-needed estimate -> autonomy-supportive policy, competence proofs.
- **Big Five (opt-in)** -> tone profile -> coaching language only.
- **Preference survey (opt-in)** -> presentation mix only (UX, not pedagogy).

### Product invariants (non-negotiable)

1. Behavior-first measurement.
2. No learning-styles efficacy claims.
3. Uncertainty-native storage for all estimates.
4. Auditability by construction.
5. Traits affect tone only.
6. CRT contamination controls are required.
7. Motivation support is policy-based (SDT framing).

---

## 4) System Architecture

### Layered model and mutability

- **Evidence:** insert-only, immutable history.
- **Inference:** immutable snapshots keyed by model/profile versions.
- **Policy:** immutable decisions keyed by policy/profile versions, with auto audit events.

### Deterministic vs AI

**Deterministic:** scoring, calibration, construct inference, policy evaluation, item selection, queue state, profile versioning, audit generation.  
**AI (schema-constrained):** guide wording, explanation wording, artifact content.

### App and platform

- Next.js App Router (dashboard/profile/guide/session/audit/core-model/tags/files/agents + API routes).
- Postgres + Drizzle.
- AI SDK via `AI_GATEWAY_API_KEY`.
- Background recompute jobs.
- Blob storage for source files.
- `evalite` for evaluations.

---

## 5) Data Model (Condensed)

### Conventions

- ULID primary keys.
- Derived rows include `model_version_id`, `profile_version_id`, `computed_at`.
- Profile snapshots are immutable with `parent_profile_version_id`.
- JSONB used only where flexibility is needed.

### Layer A: Evidence tables (append-only)

- `learner`
- `consent_bundle`
- `learning_goal`
- `concept`, `concept_prereq`
- `item`, `item_exposure`
- `assessment_session`, `attempt`
- `instrument_run`, `instrument_response`, `instrument_score`
- `adherence_event`

### Layer B: Inference tables (versioned)

- `model_version`
- `profile_version`
- `mastery_estimate` (posterior + uncertainty)
- `calibration_summary` (ECE, Brier, curve)
- `construct_inference` (estimate + uncertainty + provenance + disambiguation hint)
- `review_queue_state`

### Layer C: Policy + guide tables (versioned/auditable)

- `policy_version`
- `policy_decision`
- `learning_guide`, `guide_block`
- `audit_event`
- `measurement_plan`

### Content ingestion tables

- `source_file`
- `source_collection`, `collection_file`
- `extracted_concept`
- `knowledge_graph_edge`
- `tag`, `file_tag`
- `project`, `project_file`

---

## 6) Zod Contracts

All boundaries are validated with Zod.

- **Evidence inputs:** `AttemptInput`, `AdherenceEventInput`, `InstrumentResponseInput`.
- **Derived outputs:** `ProfileSnapshotSchema`, `PolicyDecisionSchema`.
- **AI outputs:** `GuideSchema`, `FlashcardSetSchema`, `QuizSchema`, `TextContentSchema`.
- **Ingestion outputs:** `FileUploadInput`, `ExtractedConceptOutput`.

---

## 7) Material Ingestion Pipeline

### Supported inputs

PDF, markdown/text, slide decks, code files, web pages, and video links.

### Pipeline

1. Upload + metadata write (`pending`).
2. Background extraction (`processing`).
3. Schema-constrained concept extraction.
4. Knowledge-graph edge creation with provenance.
5. Ontology mapping/creation in `concept`.
6. Final status (`completed` or `failed`).

Tags, collections, and projects provide organization and filtering.

---

## 8) Inference Engine (Learning Profile DNA)

### Module responsibilities

- `mastery.ts`: Bayesian beta updates by concept.
- `calibration.ts`: ECE and Brier.
- `constructs.ts`: load/self-regulation/motivation inferences.
- `dropout.ts`: adherence-based risk.
- `index.ts`: `recomputeProfile` orchestration.

### Core model choices

- v1 mastery uses Beta posterior updates.
- Calibration derives from confidence vs correctness pairs.
- Construct outputs always include uncertainty, confidence band, evidence refs, and "fastest disambiguation."

### Versioning behavior

Each recompute creates a new immutable `profile_version`, writes all derived rows, snapshots queue state, and emits audits for meaningful changes.

---

## 9) Policy Engine

Policy is deterministic rules-as-data (no AI).

### v1 rule families

- Pacing by cognitive load risk.
- Spacing by mastery uncertainty.
- Metacognitive loop insertion by calibration error.
- Study-skill lesson insertion by self-regulation risk.
- Feedback style by motivation support need.
- Interleaving level by cross-concept mastery.

### Evaluation behavior

- Rule fires only if threshold and confidence gate are satisfied.
- If confidence is too low, keep previous or conservative defaults.
- Every applied decision produces an `audit_event`.

### Versioning

Policy versions are immutable; supports reproducibility, A/B tests, and rollback.

---

## 10) AI Generation Pipeline

All AI calls use `generateObject` + strict Zod schemas.

### Guide generation inputs

- policy decisions,
- mastery map + uncertainty,
- learner time constraints,
- goal type.

### Outputs

- Guide narrative + structured blocks.
- Learning artifacts: flashcards, quizzes, text, video references.

### Agent pattern

Agents are configured via markdown (`AGENTS.md` style), consume Core Model JSON, output schema-valid artifacts, track progress files, and store eval/ops data.

### Eval coverage (`evalite`)

1. Guide quality + policy alignment.
2. Ingestion quality + graph accuracy.
3. Agent artifact quality + schema conformance + concept coverage.

---

## 11) User Flows (0-9)

0. **Entry/positioning:** trust contract + baseline CTA.  
1. **Consent:** required telemetry + optional modules with clear decision impact.  
2. **Baseline setup:** domain, goals, time budget, deadline, prior exposure check.  
3. **Behavior-first baseline:** adaptive diagnostic + confidence/reflection/repair loop.  
4. **Optional modules:** add precision where it changes decisions.  
5. **Profile generation:** Evidence / Inference / Policy panes.  
6. **7-day guide:** time-budgeted daily blocks + supports + risk countermeasures.  
7. **In-session:** practice + strategic reflection + wrap with "what changed."  
8. **Audit + model card:** transparent rationale and model limitations.  
9. **Reassessment/versioning:** weekly diffs and targeted re-measures.

---

## 12) Screen Specs (Condensed)

- **`/dashboard`:** auth-gated project grid with CRUD.
- **`/dashboard/core-model`:** node graph + 12-step form wizard + read-only JSON panel.
- **`/dashboard/tags`:** tag CRUD with usage visibility.
- **`/dashboard/files`:** file CRUD, upload, bulk edit, metadata, collections, preview.
- **`/dashboard/agents/[agentId]`:** split panel (agent config sidebar + chat/canvas artifact workspace).

---

## 13) Event Taxonomy (Canonical)

Core event families:

- session lifecycle,
- attempts and confidence telemetry,
- reflection/repair/hints,
- guide block lifecycle,
- profile recompute + policy applied,
- instrument lifecycle,
- CRT exposure + contamination detection.

All events include learner ID and timestamp and are stored in the evidence layer.

---

## 14) Success Metrics and Evaluation

### Primary metrics

- Mastery retention (7/14/30d).
- Calibration improvement (ECE/Brier deltas).
- Uncertainty contraction (`posterior_sd` reduction).
- Adherence and persistence.
- Time-to-mastery.
- Policy stability.
- Information gain vs measurement plan predictions.

### Experimental strategy

- A/B test by `policy_version` cohorts.
- Compare primary metrics with significance testing.
- Auto rollback when a policy version degrades key outcomes.

---

## 15) Open Risks

Key risks and mitigations:

- Item-bank depth by domain.
- Cold-start uncertainty thresholds.
- CRT form inventory exhaustion.
- Recompute latency.
- AI schema failure/hallucination risk.
- Instrument licensing constraints.
- Learner interpretation of uncertainty UI.
- New-domain bootstrapping quality.

---

## 16) Glossary (Short)

- **Attempt:** one response + telemetry.
- **Calibration:** confidence vs accuracy alignment.
- **Confidence band:** low/medium/high uncertainty category.
- **Construct:** measurable risk/support variable.
- **Evidence/Inference/Policy layers:** immutable signals -> derived estimates -> decisions.
- **Profile version:** immutable snapshot with parent diffing.
- **Policy version:** immutable ruleset snapshot.
- **Posterior SD:** uncertainty magnitude for an estimate.

---

## 17) Appendices (What to Keep)

- **A: API envelope** for profile responses (portable JSON view).
- **B: Review queue state** example for spacing reproducibility.
- **C: Drizzle pattern** and schema implementation constraints.
- **D: UX guardrail copy** (no learning-styles claims, no trait determinism, CRT contamination warning).

---

## References

[1] Learning styles evidence review  
<https://journals.sagepub.com/doi/10.1111/j.1539-6053.2009.01038.x>

[2] Cognitive Reflection Test (CRT)  
<https://www.aeaweb.org/articles?id=10.1257%2F089533005775196732>

[3] Metacognitive Awareness Inventory (MAI)  
<https://www.sciencedirect.com/science/article/pii/S0361476X84710332>

[4] LASSI 3rd Edition  
<https://www.hhpublishing.com/LASSImanual.pdf>

[5] Self-Determination Theory (SDT)  
<https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf>

[6] MSLQ manual  
<https://files.eric.ed.gov/fulltext/ED338122.pdf>

[7] Big Five and academic performance  
<https://pubmed.ncbi.nlm.nih.gov/34265097/>

[8] CRT contamination / exposure effects  
<https://pmc.ncbi.nlm.nih.gov/articles/PMC5225989/>
