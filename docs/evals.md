# Evaluation Testing with Evalite

## Quick Start

```bash
# Run all evals once
bun run eval

# Watch mode (re-runs on file changes, launches UI at localhost:3006)
bun run eval:watch
```

Requires `OPENAI_API_KEY` in `.env.local`.

## Structure

```
evals/
  setup.ts                      # Loads .env.local
  fixtures.ts                   # Test learner profiles & mock data
  scorers/index.ts              # Reusable custom scorers
  profile.eval.ts               # Learning profile generation
  guide.eval.ts                 # 7-day learning guide generation
  artifact-quiz.eval.ts         # Quiz artifact generation
  artifact-flashcards.eval.ts   # Flashcard artifact generation
  artifact-mindmap.eval.ts      # Mind map artifact generation
  artifact-slides.eval.ts       # Slide deck artifact generation
  artifact-spatial.eval.ts      # 3D spatial artifact generation

src/lib/ai/
  schemas.ts                    # Zod schemas for all AI outputs
  generate-profile.ts           # Profile analysis generation
  generate-guide.ts             # 7-day guide generation
  generate-artifact.ts          # All artifact generators

evalite.config.ts               # Evalite configuration
```

## What We Test

### 1. Learning Profile Generation (`profile.eval.ts`)

Tests that AI correctly analyzes learner data across all dimensions.

**Scorers:**
- **Profile Covers All Dimensions** - Summary, strengths, risks, strategies, cognitive profile, coaching approach all present
- **CRT Score Alignment** - Reflectiveness level matches CRT performance (0/3=low, 1=medium, 2-3=high)
- **Calibration Accuracy Detection** - Over/under-confidence correctly identified from confidence + CRT + prior knowledge signals
- **SDT Motivation Focus** - Coaching targets the lowest Self-Determination Theory dimension

**Test profiles:** Beginner (over-confident, passive strategies), Advanced (well-calibrated, evidence-based), Career Changer (moderate, project-focused)

### 2. Learning Guide Generation (`guide.eval.ts`)

Tests that the 7-day study guide respects constraints and policy.

**Scorers:**
- **Time Budget Compliance** - Total minutes within 10% of weekly budget
- **7-Day Coverage** - All 7 days have summary entries
- **Block Type Diversity** - Uses 3+ block types (core_practice, metacog_routine, skill_builder, motivation_support)
- **Core Practice Every Day** - Every active study day has at least one core_practice block
- **Concept Coverage** - All input concepts appear in at least one block

### 3. Artifact Generation (5 eval files)

Tests structural validity and content quality for each artifact type.

**Quiz scorers:** Correct answer validity, explanation quality (>20 chars), concept coverage, difficulty progression

**Flashcard scorers:** Concept coverage, minimum card count (8+), question/answer quality

**Mind Map scorers:** Tree validity (one root, valid parents), concept coverage, tree depth (3+ levels)

**Slide scorers:** Concept coverage, structure (intro/content/summary), bullet quality (10-200 chars)

**Spatial scorers:** Object count (4-10), hex color validity, position bounds (-5 to 5), position spread, connection validity

## Adding New Evals

1. Create `evals/my-feature.eval.ts`
2. Define `data` (test cases), `task` (generation function), `scorers`
3. Run `bun run eval` to verify

```typescript
import { evalite } from "evalite"

evalite("My Feature", {
  data: () => [
    { input: { /* ... */ }, expected: undefined },
  ],
  task: async (input) => {
    return myGenerationFunction(input)
  },
  scorers: [
    {
      name: "My Scorer",
      description: "What it checks",
      scorer: ({ output }) => {
        return output.someField ? 1 : 0
      },
    },
  ],
})
```

## Configuration

See `evalite.config.ts`:
- `testTimeout`: 60s per eval case
- `maxConcurrency`: 5 parallel API calls
- `setupFiles`: loads `.env.local` via dotenv
