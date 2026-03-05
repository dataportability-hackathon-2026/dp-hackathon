# Architecture Redesign: Implementation Guidance

> A modular, composable, beginner-friendly architecture for an AI-powered adaptive learning platform where agents use tools to build artifacts, evaluated by evals to continuously improve.

## Current State Assessment

The codebase is a Next.js 16 app with:
- **Monolithic UI**: `single-page-app.tsx` is a ~1000+ line mega-component containing all views, state, and logic
- **Hardcoded mock data**: `topics.ts` (530 lines) and `artifact-store.ts` (690 lines) embed all domain data as constants
- **No persisted artifacts**: AI-generated artifacts (quiz, flashcards, etc.) are returned but never saved to DB
- **Duplicated tool definitions**: `tools.ts` and `api/agent-tools/route.ts` define the same generators with copy-pasted profile stubs
- **Flat schema**: DB has auth + billing tables but no tables for topics, projects, artifacts, mastery, or guide blocks
- **No artifact-profile connection**: Generated artifacts don't reference the learner profile that shaped them
- **Eval system is isolated**: Evals test generators but results don't feed back into prompt tuning or artifact quality tracking

---

## 12 Critical Changes

### 1. Break the Monolith: Extract Domain Components

**Problem**: `single-page-app.tsx` contains topic navigation, chat, guide view, mastery charts, file management, artifact browsing, profile editing, and settings all in one file. This is impossible for new contributors to navigate and makes every change risky.

**Solution**: Split into focused route segments and feature components:

```
src/
  app/
    dashboard/
      page.tsx                        # Topic grid overview
      [topicSlug]/
        page.tsx                      # Topic detail (guide + mastery + chat)
        [projectSlug]/
          page.tsx                    # Project-scoped view
  features/
    topics/
      topic-grid.tsx                  # Grid of topic cards
      topic-detail.tsx                # Single topic view shell
    guide/
      guide-timeline.tsx              # 7-day guide with blocks
      guide-block-card.tsx            # Individual block card
    mastery/
      mastery-chart.tsx               # Bayesian mastery visualization
      mastery-table.tsx               # Tabular mastery data
    chat/
      chat-panel.tsx                  # Chat interface
      chat-message.tsx                # Single message bubble
      chat-tool-result.tsx            # Renders tool call results inline
    artifacts/
      artifact-canvas.tsx             # Already extracted, keep and extend
      artifact-card.tsx               # Generic artifact renderer
      renderers/                      # One renderer per artifact type
        quiz-renderer.tsx
        flashcard-renderer.tsx
        mindmap-renderer.tsx
        slides-renderer.tsx
        spatial-renderer.tsx
        geo-renderer.tsx
    profile/
      profile-form.tsx                # Learning profile questionnaire
      profile-summary.tsx             # Analysis display
    billing/
      billing-dialog.tsx              # Already exists
      usage-dialog.tsx                # Already exists
```

Each feature folder is self-contained: its own components, hooks, and types. No feature imports from another feature's internals.

### 2. Persist Everything: Full Domain Schema

**Problem**: Topics, projects, artifacts, mastery, and guide blocks exist only as TypeScript constants or ephemeral API responses. Nothing the AI generates is saved. Users lose all work on refresh.

**Solution**: Extend the Drizzle schema to model the full domain:

```typescript
// src/db/schema.ts - additions

export const topic = sqliteTable("topic", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  parentGroup: text("parent_group").notNull(),
  icon: text("icon"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const project = sqliteTable("project", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  topicId: text("topic_id").notNull().references(() => topic.id),
  userId: text("user_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  goalType: text("goal_type").notNull(), // exam | project | fluency | teach
  deadline: text("deadline"),
  minutesPerDay: integer("minutes_per_day"),
  daysPerWeek: integer("days_per_week"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const concept = sqliteTable("concept", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  topicId: text("topic_id").notNull().references(() => topic.id),
  name: text("name").notNull(),
  orderIndex: integer("order_index").default(0),
});

export const mastery = sqliteTable("mastery", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => user.id),
  conceptId: text("concept_id").notNull().references(() => concept.id),
  posteriorMean: integer("posterior_mean").notNull(), // stored as 0-1000 (multiply by 0.001)
  posteriorSd: integer("posterior_sd").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const artifact = sqliteTable("artifact", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => user.id),
  projectId: text("project_id").references(() => project.id),
  topicId: text("topic_id").references(() => topic.id),
  type: text("type").notNull(), // quiz | flashcards | mindmap | slidedeck | spatial | ...
  title: text("title").notNull(),
  description: text("description"),
  data: text("data").notNull(), // JSON blob matching the Zod schema for this type
  generationModel: text("generation_model"),
  generationPromptHash: text("generation_prompt_hash"),
  evalScores: text("eval_scores"), // JSON: { scorerName: number }
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const learnerProfile = sqliteTable("learner_profile", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => user.id).unique(),
  rawInput: text("raw_input").notNull(), // JSON of LearningProfileInput
  analysis: text("analysis").notNull(), // JSON of LearningProfileAnalysis
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const guideBlock = sqliteTable("guide_block", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => project.id),
  dayIndex: integer("day_index").notNull(),
  blockType: text("block_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  plannedMinutes: integer("planned_minutes").notNull(),
  concepts: text("concepts"), // JSON array of concept names
  techniques: text("techniques"), // JSON array
  completed: integer("completed", { mode: "boolean" }).default(false),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});
```

**Migration path**: Seed the new tables from the existing mock data so current UI works immediately against real data.

### 3. Unified Tool Registry with Artifact Persistence

**Problem**: Tools are defined twice (in `tools.ts` for chat streaming and `api/agent-tools/route.ts` for direct API calls). Neither persists the generated artifacts to the database. The profile stub in `tools.ts` is hardcoded.

**Solution**: Create a single tool registry that generates, validates, persists, and returns artifacts:

```typescript
// src/lib/ai/tool-registry.ts

import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { artifact } from "@/db/schema";

type ToolContext = {
  userId: string;
  topicId?: string;
  projectId?: string;
  profileAnalysis?: LearningProfileAnalysis;
};

export function createToolsWithContext(ctx: ToolContext) {
  return {
    create_quiz: tool({
      description: "Create a multiple-choice quiz...",
      inputSchema: artifactInputSchema,
      execute: async (input) => {
        const result = await generateQuiz(input);
        // Persist to DB
        const saved = await db.insert(artifact).values({
          userId: ctx.userId,
          topicId: ctx.topicId,
          projectId: ctx.projectId,
          type: "quiz",
          title: result.title,
          description: result.description,
          data: JSON.stringify(result),
          generationModel: "gpt-4o-mini",
        }).returning();
        return { type: "quiz", data: result, artifactId: saved[0].id };
      },
    }),
    // ... same pattern for all tools
  };
}
```

The chat route and agent-tools route both call `createToolsWithContext()` with the authenticated user's context. One definition, consistent behavior.

### 4. Connect Learner Profile to All Generation

**Problem**: When the chat agent generates artifacts, it uses a hardcoded profile stub (`"Learner seeking a structured study plan."`, `strengths: ["Motivated", "Goal-oriented"]`). The actual learner profile analysis is never used. This defeats the entire purpose of the profile questionnaire.

**Solution**: Load the persisted `learnerProfile` at the start of every generation pipeline:

```typescript
// In the chat route and tool context
const profile = await db.select()
  .from(learnerProfile)
  .where(eq(learnerProfile.userId, userId))
  .get();

const tools = createToolsWithContext({
  userId,
  topicId,
  projectId,
  profileAnalysis: profile ? JSON.parse(profile.analysis) : undefined,
});
```

Every artifact generator receives the real profile analysis, enabling personalized difficulty, strategy alignment, and coaching tone. The system prompt should also incorporate the profile summary so conversational responses adapt to the learner.

### 5. Data Access Layer (DAL)

**Problem**: Database queries are scattered across route handlers and lib files with no consistent pattern. Adding a new feature means writing raw Drizzle queries inline.

**Solution**: Create a thin data access layer organized by domain entity:

```
src/db/
  schema.ts          # Table definitions (already exists)
  index.ts           # DB connection (already exists)
  dal/
    topics.ts        # CRUD for topics + concepts
    projects.ts      # CRUD for projects
    artifacts.ts     # CRUD for artifacts + queries by type/topic
    mastery.ts       # Read/update mastery scores
    profiles.ts      # Read/write learner profiles
    guides.ts        # CRUD for guide blocks
    credits.ts       # Already exists as src/lib/credits.ts, move here
    usage.ts         # Already exists as src/lib/usage.ts, move here
```

Each DAL module exports simple functions (`getTopicsByUser`, `createArtifact`, `updateMastery`) that encapsulate queries. Components and API routes call DAL functions instead of writing queries directly. This makes the codebase predictable for beginners: "where does data come from?" -> always `db/dal/`.

### 6. Eval-Driven Feedback Loop

**Problem**: The eval system (evalite) runs as a separate CI/dev process. Results don't feed back into the product. There's no way to know if a particular artifact was high or low quality after generation.

**Solution**: Run lightweight scorers inline after every artifact generation, persist the scores, and use them to improve:

```typescript
// src/lib/ai/post-generation-eval.ts

import { quizCorrectAnswerValidity, quizExplanationQuality } from "./scorers";

export async function scoreArtifact(type: string, input: any, output: any): Promise<Record<string, number>> {
  const scorerMap: Record<string, Array<{ name: string; scorer: Function }>> = {
    quiz: [quizCorrectAnswerValidity, quizExplanationQuality],
    flashcards: [flashcardConceptCoverage],
    mindmap: [mindMapTreeValidity],
    spatial: [spatialPositionSpread, spatialConnectionValidity],
    // ...
  };

  const scorers = scorerMap[type] || [];
  const scores: Record<string, number> = {};

  for (const s of scorers) {
    scores[s.name] = s.scorer({ input, output });
  }

  return scores;
}
```

After generation: score the artifact, save scores to `artifact.evalScores`, and if any score falls below a threshold, automatically regenerate with an adjusted prompt. This creates a self-improving loop visible to developers and learners alike.

### 7. Type-Safe Artifact Data with Discriminated Unions

**Problem**: The artifact store defines TypeScript types (`QuizArtifact`, `FlashcardArtifact`, etc.) and the AI schemas define Zod schemas (`QuizArtifactSchema`, etc.) separately. The two sets of types don't reference each other and diverge (e.g., `SpatialArtifact` in the store uses `position: [number, number, number]` but the Zod schema uses `x`, `y`, `z` fields).

**Solution**: Derive all types from Zod schemas as the single source of truth:

```typescript
// src/lib/ai/schemas.ts - already has Zod schemas
// Add: a discriminated union for all artifact data

export const ArtifactDataSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("quiz"), ...QuizArtifactSchema.shape }),
  z.object({ type: z.literal("flashcards"), ...FlashcardArtifactSchema.shape }),
  z.object({ type: z.literal("mindmap"), ...MindMapArtifactSchema.shape }),
  z.object({ type: z.literal("slidedeck"), ...SlideArtifactSchema.shape }),
  z.object({ type: z.literal("spatial"), ...SpatialArtifactSchema.shape }),
]);

export type ArtifactData = z.infer<typeof ArtifactDataSchema>;
```

Delete the parallel type definitions in `artifact-store.ts`. The renderers accept `ArtifactData` and narrow via the `type` discriminant. One schema, one type, zero drift.

### 8. Server Actions for Mutations

**Problem**: Client-side state changes (completing a guide block, saving profile, updating mastery) have no persistence layer. Some API routes exist for billing but not for domain operations.

**Solution**: Use Next.js Server Actions for all write operations:

```typescript
// src/features/guide/actions.ts
"use server";

import { db } from "@/db";
import { guideBlock } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth";

export async function completeGuideBlock(blockId: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  await db.update(guideBlock)
    .set({ completed: true, completedAt: new Date() })
    .where(eq(guideBlock.id, blockId));

  revalidatePath("/dashboard");
}
```

This pattern is trivially understandable for beginners: "call a function, it writes to DB and refreshes the page." No manual fetch calls, no optimistic updates to manage, no stale cache.

### 9. Composable AI Pipeline

**Problem**: Each generator function (`generateQuiz`, `generateFlashcards`, etc.) has the same boilerplate: call `generateText` with OpenAI, extract output, throw if null. Adding a new artifact type requires copy-pasting ~20 lines.

**Solution**: Create a generic generation pipeline:

```typescript
// src/lib/ai/pipeline.ts

import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import type { z } from "zod";

type PipelineOptions<T extends z.ZodType> = {
  schema: T;
  prompt: string;
  model?: string;
  context?: {
    profile?: LearningProfileAnalysis;
    topic?: string;
    concepts?: string[];
  };
};

export async function generate<T extends z.ZodType>(
  opts: PipelineOptions<T>
): Promise<z.infer<T>> {
  const result = await generateText({
    model: openai(opts.model ?? "gpt-4o-mini"),
    output: Output.object({ schema: opts.schema }),
    prompt: opts.prompt,
  });

  if (!result.output) {
    throw new Error("Generation failed: no output returned");
  }

  return result.output;
}
```

Each artifact generator becomes a thin wrapper: schema + prompt template. Adding a new artifact type is: define a Zod schema, write a prompt string, call `generate()`. Three things, each obvious.

### 10. Replace Mock Data with Seed Script

**Problem**: `topics.ts` has 530 lines of hardcoded mock topics, projects, mastery data, chat history, and files. `artifact-store.ts` has 690 lines of mock artifacts. These are imported at runtime, bloating the client bundle and making it impossible to distinguish real from fake data.

**Solution**: Create a seed script that populates the new database tables:

```typescript
// scripts/seed.ts
import { db } from "../src/db";
import { topic, project, concept, mastery, artifact, guideBlock } from "../src/db/schema";

async function seed() {
  // Insert topics
  await db.insert(topic).values([
    { id: "topic-1", userId: "demo-user", name: "Linear Algebra", domain: "Mathematics", parentGroup: "Mathematics", icon: "Table2" },
    // ... converted from TOPICS constant
  ]);

  // Insert concepts
  await db.insert(concept).values([
    { id: "c-1", topicId: "topic-1", name: "Matrix Operations", orderIndex: 0 },
    // ... extracted from masteryData
  ]);

  // Insert artifacts from MOCK_QUIZZES, MOCK_FLASHCARDS, etc.
  // ...
}

seed().then(() => console.log("Seeded")).catch(console.error);
```

Run with `bun scripts/seed.ts`. Delete `TOPICS` and `MOCK_*` constants entirely. The UI reads from the database, the seed script provides demo data, and the separation is clean.

### 11. Agent-Artifact Protocol

**Problem**: The voice agent (`agent/index.ts`) and chat agent (`api/chat/route.ts`) operate independently. The voice agent has no access to tools and can't create artifacts. There's no protocol for an agent to request artifact creation and get results back.

**Solution**: Define a standard protocol for agent-to-artifact communication:

```typescript
// src/lib/ai/agent-protocol.ts

// What an agent sends when it wants to create an artifact
export type ArtifactRequest = {
  tool: string;               // e.g. "create_quiz"
  input: Record<string, unknown>;
  userId: string;
  topicId?: string;
  projectId?: string;
};

// What comes back after creation + eval
export type ArtifactResponse = {
  artifactId: string;
  type: string;
  title: string;
  data: unknown;
  evalScores: Record<string, number>;
  passedThreshold: boolean;
};

// Central function both agents call
export async function executeArtifactTool(req: ArtifactRequest): Promise<ArtifactResponse> {
  // 1. Load user profile
  // 2. Generate artifact via pipeline
  // 3. Run inline scorers
  // 4. Persist to DB with scores
  // 5. If below threshold, regenerate once
  // 6. Return response
}
```

The voice agent can call `executeArtifactTool` via HTTP to the `agent-tools` route. The chat agent calls it directly. Same code path, same persistence, same eval scoring.

### 12. Environment and Configuration Cleanup

**Problem**: Environment variables are accessed inconsistently. `src/lib/env.ts` exists but isn't used everywhere. The AI gateway URL is hardcoded in `agent/index.ts`. There's no validation that required env vars are present at startup.

**Solution**: Centralize all configuration with runtime validation:

```typescript
// src/lib/env.ts (rewrite)

import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  DATABASE_URL: z.string().default("file:local.db"),
  BETTER_AUTH_SECRET: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
  LIVEKIT_URL: z.string().optional(),
  AI_GATEWAY_BASE_URL: z.string().default("https://api.openai.com/v1"),
  AI_GATEWAY_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = envSchema.parse(process.env);
```

Import `env` everywhere instead of reading `process.env` directly. The app fails fast with a clear error message if a required variable is missing.

---

## 12 Nice-to-Have Changes

### 1. Artifact Version History

Track every regeneration of an artifact. Store a `parentArtifactId` on the `artifact` table so you can see how a quiz evolved across generations. Show a "version history" in the UI with eval score trends. Helps learners see improvement and helps developers debug prompt regressions.

### 2. Concept Prerequisite Graph

Add a `conceptPrerequisite` table linking concepts with `prerequisiteId -> conceptId`. Use this to auto-order guide blocks (teach prerequisites first) and to show a visual dependency graph in the topic detail view. The mind map artifact could be seeded from this graph.

### 3. Spaced Repetition Engine

Build a lightweight SM-2 or FSRS scheduler for flashcard artifacts. Track `lastReviewedAt`, `interval`, `easeFactor` per card per user. Surface "due" cards in the dashboard. This turns generated flashcards from a one-time artifact into a living study tool.

### 4. Streaming Artifact Rendering

Currently artifacts are generated server-side and returned as a complete JSON blob. Use AI SDK's streaming with `streamObject` to progressively render artifacts as they generate. Show quiz questions appearing one by one, mind map nodes growing, slides building. This dramatically improves perceived performance.

### 5. Multi-Model Support with Fallbacks

The codebase is locked to `gpt-4o-mini` everywhere. Add model configuration per artifact type and per user tier. Premium users could get `gpt-4o` for higher quality. Add automatic fallback: if the primary model fails or scores below threshold, retry with a different model.

### 6. Collaborative Learning Spaces

Add a `learningGroup` table and `groupMembership`. Allow users to share artifacts, compare mastery, and study together. The chat agent could facilitate group quiz sessions. Addresses the SDT "relatedness" dimension that the profile system already tracks.

### 7. File Processing Pipeline

The schema tracks uploaded files (`MockFile`) but there's no processing. Build an ingestion pipeline: upload PDF/markdown -> extract text -> chunk -> embed -> store in a vector table. The AI generators could then use RAG to create artifacts grounded in the user's actual study materials instead of general knowledge.

### 8. Mastery Update from Artifact Interaction

When a user completes a quiz, update their mastery scores based on which questions they got right/wrong. Use a simple Bayesian update: correct answer on a hard question increases posterior mean more than correct on an easy question. The mastery chart then reflects real learning, not just AI estimates.

### 9. Prompt Template Library

Extract all prompt strings from generator functions into a `src/lib/ai/prompts/` directory with one file per artifact type. Add a prompt versioning scheme (`quiz-v1.ts`, `quiz-v2.ts`) so you can A/B test prompts via evals without changing generator code. This makes prompt iteration a first-class workflow.

### 10. Component Storybook / Playground

Add a `/playground` route (dev only) that renders each artifact renderer with sample data. New contributors can see all artifact types visually, test styling changes, and understand the component API without running the full app flow. Use the seed data as fixtures.

### 11. Webhook-Based Agent Orchestration

When a guide block is marked complete, fire an internal event that triggers the agent to suggest the next study action. "Great job finishing eigenvalue practice! Based on your quiz score of 73%, I'd recommend reviewing eigenvector properties next. Want me to create flashcards?" This makes the system proactive rather than reactive.

### 12. Export and Portability

Add export functionality for artifacts: quiz as PDF, flashcards as Anki deck, mind map as SVG, slides as PDF. The `html2pdf.js` dependency already exists. Add a "share" feature that generates a public link to a read-only artifact view. This gives learners tangible outputs they can use outside the platform.

---

## Recommended Implementation Order

**Phase 1 - Foundation (Critical 1-5)**
1. Domain schema (Critical #2) - everything depends on real data
2. Data access layer (Critical #5) - clean query interface
3. Seed script (Critical #10) - populate from mock data
4. Break the monolith (Critical #1) - extract components reading from DB
5. Server actions (Critical #8) - mutations against real data

**Phase 2 - AI Pipeline (Critical 6-9)**
6. Composable AI pipeline (Critical #9) - simplify generators
7. Type-safe artifact data (Critical #7) - single source of truth
8. Unified tool registry (Critical #3) - one definition, persistence
9. Profile connection (Critical #4) - personalized generation

**Phase 3 - Quality Loop (Critical 10-12)**
10. Eval feedback loop (Critical #6) - inline scoring + regen
11. Agent protocol (Critical #11) - voice + chat unified
12. Environment cleanup (Critical #12) - fail-fast config

**Phase 4 - Polish (Nice-to-haves)**
Prioritize based on user feedback. Recommended first: Streaming (#4), Mastery updates (#8), Spaced repetition (#3).

---

## Guiding Principles

1. **Zod schemas are the source of truth** - DB shape, API contracts, AI output validation, and TypeScript types all derive from Zod. Change the schema, everything follows.
2. **Every AI output is persisted and scored** - No ephemeral generation. If the AI made it, it's in the database with quality scores.
3. **Features are folders, not files** - Each domain concept gets a directory with its components, actions, hooks, and types. Import boundaries are enforced by convention.
4. **The profile shapes everything** - The learner profile analysis should influence artifact difficulty, coaching tone, strategy selection, and UI emphasis. It's the DNA of the experience.
5. **Evals are continuous, not periodic** - Inline scoring after every generation, not just in CI. Developers see quality metrics in the database. The system self-corrects below threshold.
6. **Beginners can trace any feature** - From UI click -> server action -> DAL function -> DB table. No magic, no indirection. Each layer does one thing.
