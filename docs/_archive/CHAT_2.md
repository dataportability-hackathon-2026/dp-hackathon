Perfect — let’s turn this into a **working, high-level technical spec** that is directly implementable with:

* **Next.js (App Router)**
* **Zod (schema validation)**
* **Drizzle (Postgres ORM)**
* **Vercel AI SDK (AISDK) where needed**
* Event-sourced + uncertainty-native
* Fully auditable by construction

This will stay high-level but executable.

---

# 1. System Architecture Overview

## Core Principle

Three-layer architecture:

```
UI (Next.js)
    ↓
Application Layer (Server Actions / Route Handlers)
    ↓
Domain Layer (Evidence → Inference → Policy)
    ↓
Postgres (Drizzle)
```

AI SDK is used only for:

* Generating learning guides (structured output)
* Producing user-facing explanations from policy decisions
* Optional reflection feedback
* NOT for scoring mastery or core inference math

All scoring logic is deterministic + versioned.

---

# 2. Domain Model (Conceptual)

You already defined the right conceptual layers. We formalize them as:

### Layer 1 — Evidence (Immutable, Append-Only)

* attempts
* sessions
* instrument responses
* adherence events
* item exposure

### Layer 2 — Inference (Versioned, Derived)

* mastery estimates (posterior + sd)
* calibration summary
* construct inferences
* dropout risk
* cognitive load risk

### Layer 3 — Policy & Guide (Versioned Decisions)

* policy_decisions
* learning_guide
* guide_blocks
* audit_events
* profile_version snapshots

This separation is non-negotiable.

---

# 3. Next.js Architecture

## App Router Structure

```
app/
  (marketing)/
  (auth)/
  dashboard/
    profile/
    guide/
    session/[sessionId]/
    audit/
  api/
    sessions/
    attempts/
    instruments/
    profile/
    guide/
```

### Rendering Strategy

* Baseline + session experience → Server Components + streaming
* Attempts submission → Server Actions
* Guide generation → Route handler (calls inference + policy + AISDK)

---

# 4. Drizzle Schema Strategy

Use:

* Strong typing
* JSONB only where flexibility is required
* ULID (sortable IDs)

Example pattern:

```ts
import { pgTable, text, timestamp, jsonb, boolean, real } from "drizzle-orm/pg-core";

export const learner = pgTable("learner", {
  learnerId: text("learner_id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  locale: text("locale"),
  timezone: text("timezone"),
});
```

Follow this pattern for all core tables you designed.

Critical rules:

* Evidence tables NEVER update rows.
* Inference tables always include:

  * modelVersionId
  * profileVersionId
  * computedAt

---

# 5. Zod Schemas (Boundary Contracts)

Zod protects:

* API boundaries
* AI outputs
* Policy decisions
* Guide payload structure

## Example: Attempt Submission

```ts
import { z } from "zod";

export const AttemptInput = z.object({
  sessionId: z.string(),
  itemId: z.string(),
  response: z.any(),
  latencyMs: z.number().int().positive(),
  confidencePre: z.number().min(0).max(1).optional(),
  confidencePost: z.number().min(0).max(1).optional(),
});
```

Never trust client telemetry without Zod validation.

---

# 6. Inference Engine Design

## Implementation Strategy

Inference is NOT AI-driven.
It is a deterministic domain module.

```
/lib/inference/
    mastery.ts
    calibration.ts
    constructs.ts
    dropout.ts
```

Each function:

* Takes learnerId
* Queries evidence
* Produces versioned results
* Writes derived tables
* Returns profileVersionId

### Example Signature

```ts
export async function recomputeProfile(learnerId: string) {
  const evidence = await loadEvidence(learnerId);
  const mastery = await computeMastery(evidence);
  const calibration = computeCalibration(evidence);
  const constructs = computeConstructs(evidence, mastery);
  const profileVersion = await persistProfile(...);
  return profileVersion;
}
```

---

# 7. Mastery Model (High-Level)

Start simple:

* Bayesian updating per concept
* Beta distribution for P(correct)
* Posterior mean + variance stored

```ts
posteriorMean = alpha / (alpha + beta)
posteriorSd = ...
```

Later you can move to IRT or BKT, but schema supports both.

---

# 8. Policy Engine (Deterministic Rule System)

This is a critical layer.

## Structure

```
/lib/policy/
    rules.ts
    evaluate.ts
```

Rules are pure data:

```ts
{
  decisionKey: "pacing",
  condition: {
    construct: "cognitive_load_risk",
    threshold: 0.6,
    confidence: "medium"
  },
  action: {
    chunkSize: 4,
    workedExampleRatio: 0.5
  },
  rationaleTemplate: "Latency increased on multi-step items..."
}
```

Evaluation:

```ts
export function evaluatePolicy(inferences, policyVersion) {
  // returns policy decisions
}
```

Policy decisions get persisted in `policy_decision`.

No AI allowed here.

---

# 9. AISDK Usage (Structured Only)

Use AI only where language generation is appropriate.

### 1. Guide Text Generation

Input:

* policy decisions
* mastery map
* time constraints

Output:
Strict Zod schema:

```ts
const GuideSchema = z.object({
  summary: z.string(),
  dailyPlan: z.array(
    z.object({
      dayIndex: z.number(),
      blocks: z.array(
        z.object({
          type: z.enum(["core_practice", "skill_builder", "metacog"]),
          minutes: z.number(),
          description: z.string()
        })
      )
    })
  )
});
```

Use:

```ts
import { generateObject } from "ai";

const result = await generateObject({
  model: openai("gpt-4.1"),
  schema: GuideSchema,
  prompt: structuredPrompt
});
```

Never allow free-text output.

---

# 10. Session Engine (Adaptive Loop)

During a session:

1. Select next item (based on mastery + spacing queue)
2. Record attempt
3. Update ephemeral mastery state (in memory)
4. At session end → persist → recompute profile

Adaptive algorithm lives in:

```
/lib/adaptive/selectItem.ts
```

It uses:

* review_queue_state
* mastery_estimate
* recent error streaks

---

# 11. Review Queue Design

You need reproducibility.

Queue stored as JSON:

```json
{
  "due": ["item1", "item2"],
  "intervals": {
    "item1": 3.2,
    "item2": 7.1
  },
  "easeFactors": {...}
}
```

Every profile update snapshots queue state.

---

# 12. Profile Versioning Strategy

When recomputeProfile runs:

1. Create new profile_version row
2. Attach:

   * mastery_estimates
   * calibration_summary
   * construct_inferences
   * policy_decisions
3. Generate audit_event entries
4. Link parent_profile_version_id

Profiles are immutable snapshots.

---

# 13. Audit System (Automatic)

Every policy decision generates:

```ts
createAuditEvent({
  observation: "...",
  inferenceChange: {...},
  policyChange: {...},
  userVisibleSummary: "We reduced chunk size because..."
});
```

Audit is not optional.
It is triggered inside policy engine.

---

# 14. Security + Test Contamination Handling

For CRT-like items:

* form_family_id groups rotated variants
* item_exposure table tracks:

  * timesSeen
  * self_report_prior_exposure
  * contamination_flag

Adaptive selector must exclude contaminated items from scoring constructs.

---

# 15. Event Taxonomy (Telemetry Contract)

Define explicit event names:

* session.started
* attempt.submitted
* confidence.logged
* reflection.submitted
* repair.completed
* guide.block.started
* guide.block.completed
* profile.recomputed
* policy.decision.applied

Store in evidence layer.

---

# 16. Deployment Model

* Vercel (Next.js)
* Postgres (Neon / Supabase)
* Edge runtime only for read-heavy guide rendering
* Inference recompute → background job (queue or server action)

Never recompute profile synchronously on every attempt.

---

# 17. Success Metrics (Built Into Schema)

Because of your schema, you can measure:

* Calibration improvement over time
* Mastery posterior contraction (uncertainty shrinkage)
* Adherence vs dropout risk
* Policy stability vs churn
* Information gain per measurement plan

This is what makes it academically defensible.

---

# 18. What Makes This “Most Successful”

1. Evidence-first, append-only telemetry
2. Deterministic inference layer
3. Versioned policy engine
4. AI only for structured language output
5. Uncertainty stored everywhere
6. Exposure-aware construct handling
7. Full auditability
8. Profile version diffs

This supports:

* Reproducibility
* Research publication
* A/B testing policies
* Trust as a product feature

---

If you'd like, next I can:

* Produce a **concrete Drizzle schema file (complete TypeScript)**
* Or write the **policy ruleset v1.0** with threshold math
* Or design the **adaptive item selection algorithm spec**

Your move.
