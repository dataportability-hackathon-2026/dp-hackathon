import { generateText, Output, tool } from "ai";
import { z } from "zod";
import {
  type CitationKey,
  getCitationBlock,
  getCitationGuardrails,
} from "./citations";
import { openai } from "./provider";
import {
  GuideBlockSchema,
  LearningGuideSchema,
  type LearningProfileAnalysis,
} from "./schemas";

// ── Guide-specific schemas ──

const SessionWrapSchema = z.object({
  sessionId: z.string(),
  summary: z.string().describe("What was practiced and achieved"),
  masteryDeltas: z
    .array(
      z.object({
        concept: z.string(),
        direction: z.enum(["improved", "stable", "declined"]),
        note: z.string(),
      }),
    )
    .min(1),
  calibrationNote: z
    .string()
    .describe("How well the learner predicted their performance"),
  nextSteps: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("What to focus on next"),
  encouragement: z
    .string()
    .describe("Evidence-grounded encouragement (not empty praise)"),
});

const AdaptiveGuideAdjustmentSchema = z.object({
  reason: z.string().describe("Why the guide is being adjusted"),
  evidenceBasis: z.string().describe("What evidence triggered this adjustment"),
  policyRule: z.string().describe("Which policy rule applies (R1-R7)"),
  adjustedBlocks: z
    .array(
      z.object({
        originalBlockId: z.string(),
        change: z.enum(["modified", "replaced", "removed", "added"]),
        newBlock: GuideBlockSchema.nullable(),
        rationale: z.string(),
      }),
    )
    .min(1),
  auditTrail: z.object({
    observed: z.string(),
    inferred: z.string(),
    acted: z.string(),
  }),
});

const PracticeSessionSchema = z.object({
  title: z.string(),
  warmup: z.object({
    description: z.string(),
    durationMinutes: z.number().int().min(2).max(10),
    technique: z.string(),
  }),
  mainPractice: z
    .array(
      z.object({
        id: z.string(),
        concept: z.string(),
        activity: z.string(),
        technique: z.enum([
          "active-recall",
          "spaced-repetition",
          "worked-examples",
          "elaboration",
          "interleaving",
          "prediction-reflection",
          "self-explanation",
        ]),
        durationMinutes: z.number().int().min(3).max(60),
        difficultyLevel: z.enum(["foundational", "standard", "challenging"]),
        confidenceCheck: z
          .boolean()
          .describe(
            "Whether to include a confidence prediction before this activity",
          ),
      }),
    )
    .min(1)
    .max(8),
  reflection: z.object({
    prompts: z
      .array(z.string())
      .min(1)
      .max(3)
      .describe("Metacognitive reflection prompts"),
    calibrationCheck: z
      .boolean()
      .describe("Whether to include accuracy vs. confidence comparison"),
  }),
  totalMinutes: z.number().int(),
});

// ── Guide input schema for tool ──

const guideGenerationInputSchema = z.object({
  fieldOfStudy: z.string(),
  primaryGoal: z.string(),
  goalDescription: z.string(),
  deadline: z.string(),
  minutesPerDay: z.number().int().min(5).max(480),
  daysPerWeek: z.number().int().min(1).max(7),
  sessionLength: z.enum(["short", "medium", "long"]),
  priorKnowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]),
  studyStrategies: z.array(z.string()),
  concepts: z.array(z.string()).min(1),
  profileSummary: z.string().describe("Summary from profile analysis"),
  strengths: z.array(z.string()),
  risks: z.array(
    z.object({
      area: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      mitigation: z.string(),
    }),
  ),
  cognitiveLoadRisk: z.enum(["low", "medium", "high"]),
  calibrationAccuracy: z.enum([
    "under-confident",
    "well-calibrated",
    "over-confident",
  ]),
  metacognitiveAwareness: z.enum(["low", "medium", "high"]),
  motivationalFocus: z.enum(["autonomy", "competence", "relatedness"]),
  coachingTone: z.string(),
});

type GuideGenerationInput = z.infer<typeof guideGenerationInputSchema>;

// ── Tools ──

export const guideTools = {
  generate_learning_guide: tool({
    description:
      "Generate a structured 7-day learning guide grounded in evidence-based techniques. Prioritizes retrieval practice [ROEDIGER_KARPICKE_2006], spaced repetition [CEPEDA_2006], and interleaving [ROHRER_TAYLOR_2007]. Adapts block types based on learner profile: metacognitive routines for poor calibration [SCHRAW_1994], skill-builders for strategy gaps [WEINSTEIN_2016], motivation support for SDT needs [RYAN_DECI_2000]. Adjusts cognitive load per expertise level [SWELLER_1988].",
    inputSchema: guideGenerationInputSchema,
    execute: async (input: GuideGenerationInput) => {
      const totalWeeklyMinutes = input.minutesPerDay * input.daysPerWeek;

      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: LearningGuideSchema }),
        prompt: buildGuidePrompt(input, totalWeeklyMinutes),
      });
      if (!result.output) {
        throw new Error("Failed to generate learning guide");
      }
      return { type: "learning_guide" as const, data: result.output };
    },
  }),

  generate_practice_session: tool({
    description:
      "Generate a single practice session with prediction-attempt-reflection-repair loop. Every session embeds retrieval practice [ROEDIGER_KARPICKE_2006], desirable difficulties [BJORK_2011], and metacognitive reflection [ZIMMERMAN_2002]. Includes confidence checks for calibration training [SCHRAW_1994].",
    inputSchema: z.object({
      concepts: z.array(z.string()).min(1),
      totalMinutes: z.number().int().min(10).max(120),
      priorKnowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]),
      calibrationAccuracy: z.enum([
        "under-confident",
        "well-calibrated",
        "over-confident",
      ]),
      cognitiveLoadRisk: z.enum(["low", "medium", "high"]),
      sessionNumber: z
        .number()
        .int()
        .min(1)
        .describe("Which session in the sequence"),
      dayInWeek: z.number().int().min(1).max(7),
      fieldOfStudy: z.string(),
    }),
    execute: async (input) => {
      const shouldInterleave =
        input.dayInWeek >= 4 && input.concepts.length > 1;
      const confidenceCheckFrequency =
        input.calibrationAccuracy === "over-confident"
          ? "every activity"
          : input.calibrationAccuracy === "under-confident"
            ? "every other activity"
            : "once at start";

      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: PracticeSessionSchema }),
        prompt: `You are an evidence-based learning guide generating a practice session.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock([
  "ROEDIGER_KARPICKE_2006",
  "CEPEDA_2006",
  "ROHRER_TAYLOR_2007",
  "SWELLER_1988",
  "BJORK_2011",
  "SCHRAW_1994",
  "ZIMMERMAN_2002",
])}

## Session Parameters
- Concepts: ${input.concepts.join(", ")}
- Total minutes: ${input.totalMinutes}
- Prior knowledge: ${input.priorKnowledgeLevel}
- Day in week: ${input.dayInWeek} (${shouldInterleave ? "interleave concepts" : "focus on depth"})
- Session number: ${input.sessionNumber}
- Calibration: ${input.calibrationAccuracy}
- Cognitive load risk: ${input.cognitiveLoadRisk}
- Field: ${input.fieldOfStudy}

## Session Structure Rules

### Warmup (2-5 minutes)
- Quick retrieval of previously learned material [ROEDIGER_KARPICKE_2006].
- Sets the learning context and activates prior knowledge.

### Main Practice
- ${input.cognitiveLoadRisk === "high" ? "Use worked examples first, then fade scaffolding [SWELLER_1988]. Small chunks (3-4 items)." : input.cognitiveLoadRisk === "medium" ? "Mix worked examples with independent practice. Standard chunks (5-6 items)." : "Challenge with desirable difficulties [BJORK_2011]. Larger chunks (6-8 items)."}
- ${shouldInterleave ? "INTERLEAVE concepts within the session [ROHRER_TAYLOR_2007]. Mix problem types." : "Block practice on focused concepts with depth."}
- Confidence checks: ${confidenceCheckFrequency} [SCHRAW_1994].
- Include at least one prediction-attempt-reflection cycle per concept.

### Reflection (3-5 minutes)
- Self-evaluation prompts aligned to Zimmerman's reflection phase [ZIMMERMAN_2002].
- ${input.calibrationAccuracy !== "well-calibrated" ? "Include calibration comparison: 'You predicted X% confidence but scored Y%.' [SCHRAW_1994]" : "Brief accuracy review."}
- Identify one thing learned and one thing to review next.

## Constraints
- Total minutes for all activities + warmup + reflection must equal ${input.totalMinutes} (+/- 2 min).
- Each activity must use an evidence-based technique.
- NEVER suggest passive rereading or highlighting as practice [DUNLOSKY_2013].
- Set difficulty based on prior knowledge: ${input.priorKnowledgeLevel === "beginner" ? "foundational → standard" : input.priorKnowledgeLevel === "advanced" ? "standard → challenging" : "mix all levels"}.`,
      });
      if (!result.output) {
        throw new Error("Failed to generate practice session");
      }
      return { type: "practice_session" as const, data: result.output };
    },
  }),

  generate_session_wrap: tool({
    description:
      "Generate a session wrap-up summarizing what was learned, mastery changes, calibration quality, and next steps. Implements Zimmerman's self-reflection phase [ZIMMERMAN_2002]. Provides evidence-grounded encouragement tied to specific achievements, not empty praise.",
    inputSchema: z.object({
      sessionId: z.string(),
      conceptsAttempted: z
        .array(
          z.object({
            concept: z.string(),
            itemsAttempted: z.number().int(),
            accuracy: z.number().min(0).max(1),
            avgConfidence: z.number().min(0).max(100),
          }),
        )
        .min(1),
      totalMinutesSpent: z.number(),
      sessionGoal: z.string(),
      learnerName: z.string(),
      coachingTone: z.string(),
    }),
    execute: async (input) => {
      const overallAccuracy =
        input.conceptsAttempted.reduce(
          (sum, c) => sum + c.accuracy * c.itemsAttempted,
          0,
        ) /
        input.conceptsAttempted.reduce((sum, c) => sum + c.itemsAttempted, 0);
      const overallConfidence =
        input.conceptsAttempted.reduce(
          (sum, c) => sum + c.avgConfidence * c.itemsAttempted,
          0,
        ) /
        input.conceptsAttempted.reduce((sum, c) => sum + c.itemsAttempted, 0);

      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: SessionWrapSchema }),
        prompt: `You are an evidence-based learning coach generating a session wrap-up.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["ZIMMERMAN_2002", "SCHRAW_1994", "RYAN_DECI_2000"])}

## Session Results
- Session ID: ${input.sessionId}
- Learner: ${input.learnerName}
- Goal: ${input.sessionGoal}
- Time spent: ${input.totalMinutesSpent} minutes
- Overall accuracy: ${(overallAccuracy * 100).toFixed(1)}%
- Overall confidence: ${overallConfidence.toFixed(1)}%
- Calibration gap: ${(Math.abs(overallConfidence / 100 - overallAccuracy) * 100).toFixed(1)} percentage points

## Per-Concept Results
${input.conceptsAttempted.map((c) => `- ${c.concept}: ${c.itemsAttempted} items, ${(c.accuracy * 100).toFixed(0)}% accuracy, ${c.avgConfidence.toFixed(0)}% confidence`).join("\n")}

## Instructions (Zimmerman's Reflection Phase [ZIMMERMAN_2002])
1. Summarize what was practiced in concrete terms (concepts, item counts).
2. For each concept, assess direction (improved/stable/declined) based on accuracy.
3. Note calibration quality: confidence vs accuracy gap.
   - Gap > 20pp: "Your confidence predictions didn't match your accuracy — this is normal and trainable [SCHRAW_1994]."
   - Gap < 10pp: "Your confidence predictions were well-calibrated — this is a strong metacognitive signal."
4. Provide 1-3 specific next steps grounded in the evidence (not generic "keep studying").
5. Encouragement must be tied to specific achievements (competence proof [RYAN_DECI_2000]):
   - Good: "You correctly solved 8 out of 10 integration items — that's a measurable improvement from last session."
   - Bad: "Great job! Keep it up!" (empty praise)
6. Use coaching tone: ${input.coachingTone}.`,
      });
      if (!result.output) {
        throw new Error("Failed to generate session wrap");
      }
      return { type: "session_wrap" as const, data: result.output };
    },
  }),

  adjust_guide: tool({
    description:
      "Adjust an existing learning guide based on new evidence. Implements the Observe → Analyze → Act audit chain. Every adjustment references a specific policy rule (R1-R7) and produces a full audit trail. Cognitive load adjustments follow Sweller [SWELLER_1988], metacognitive insertions follow Schraw [SCHRAW_1994], motivation shifts follow Ryan & Deci [RYAN_DECI_2000].",
    inputSchema: z.object({
      currentGuideTitle: z.string(),
      currentBlocks: z.array(
        z.object({
          id: z.string(),
          dayIndex: z.number(),
          blockType: z.string(),
          title: z.string(),
          plannedMinutes: z.number(),
          concepts: z.array(z.string()),
        }),
      ),
      triggerEvent: z.object({
        type: z.enum([
          "error_rate_spike",
          "calibration_degradation",
          "adherence_decline",
          "mastery_plateau",
          "cognitive_overload",
          "motivation_drop",
        ]),
        description: z.string(),
        severity: z.enum(["low", "medium", "high"]),
      }),
      affectedConcepts: z.array(z.string()),
      priorKnowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]),
    }),
    execute: async (input) => {
      const policyRuleMap: Record<string, string> = {
        cognitive_overload:
          "R1: Cognitive load risk >= 0.6 → smaller chunks, more worked examples [SWELLER_1988]",
        error_rate_spike:
          "R3: Mastery uncertainty high → shorter review intervals [CEPEDA_2006]",
        calibration_degradation:
          "R4: ECE >= 0.12 → prediction-reflection loops every 3rd item [SCHRAW_1994]",
        adherence_decline:
          "R6: Motivation support needed → autonomy-supportive mode [RYAN_DECI_2000]",
        mastery_plateau:
          "R7: Cross-concept mastery → mix problem types [ROHRER_TAYLOR_2007]",
        motivation_drop:
          "R6: Motivation support needed → shorter sessions, immediate wins [RYAN_DECI_2000]",
      };

      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: AdaptiveGuideAdjustmentSchema }),
        prompt: `You are an evidence-based adaptive learning system adjusting a learning guide.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock([
  "SWELLER_1988",
  "CEPEDA_2006",
  "SCHRAW_1994",
  "RYAN_DECI_2000",
  "ROHRER_TAYLOR_2007",
  "BJORK_2011",
])}

## Current Guide
Title: ${input.currentGuideTitle}
Blocks:
${input.currentBlocks.map((b) => `- [${b.id}] Day ${b.dayIndex}: ${b.title} (${b.blockType}, ${b.plannedMinutes}min, concepts: ${b.concepts.join(", ")})`).join("\n")}

## Trigger Event
Type: ${input.triggerEvent.type}
Description: ${input.triggerEvent.description}
Severity: ${input.triggerEvent.severity}
Affected concepts: ${input.affectedConcepts.join(", ")}

## Applicable Policy Rule
${policyRuleMap[input.triggerEvent.type] ?? "No direct rule match — use closest applicable rule."}

## Instructions (Observe → Analyze → Act)
1. OBSERVE: State what raw evidence triggered this adjustment.
2. ANALYZE: State what inference was drawn, with what confidence.
3. ACT: State what specific changes to the guide blocks are warranted.

4. For cognitive_overload:
   - Reduce chunk sizes, insert worked examples [SWELLER_1988].
   - For beginners: maximum 3-4 items per block.
   - For advanced: this may indicate conceptual complexity, not format issues.

5. For calibration_degradation:
   - Insert prediction-reflection loops [SCHRAW_1994].
   - Add metacog_routine blocks targeting affected concepts.

6. For adherence_decline / motivation_drop:
   - Shift to shorter blocks with more immediate wins [RYAN_DECI_2000].
   - Offer choice: "Pick which concept to practice next" (autonomy support).
   - Add motivation_support blocks.

7. For error_rate_spike:
   - Shorten review intervals [CEPEDA_2006].
   - Add retrieval practice blocks for affected concepts.

8. For mastery_plateau:
   - Introduce interleaving [ROHRER_TAYLOR_2007].
   - Mix problem types across concepts.

9. EVERY adjustment must have a complete audit trail (observed, inferred, acted).
10. Reference the block IDs being modified.
11. New blocks must conform to the GuideBlock schema.`,
      });
      if (!result.output) {
        throw new Error("Failed to adjust guide");
      }
      return { type: "guide_adjustment" as const, data: result.output };
    },
  }),

  recommend_study_strategies: tool({
    description:
      "Recommend evidence-ranked study strategies based on Dunlosky et al. (2013) utility analysis. High utility: practice testing, distributed practice. Moderate: elaborative interrogation, self-explanation, interleaving. Low: summarization, highlighting, rereading. Recommendations are context-specific to the learner's profile and subject.",
    inputSchema: z.object({
      currentStrategies: z.array(z.string()),
      fieldOfStudy: z.string(),
      priorKnowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]),
      primaryGoal: z.string(),
      metacognitiveAwareness: z.enum(["low", "medium", "high"]),
      availableMinutesPerDay: z.number().int(),
    }),
    execute: async (input) => {
      const StrategyRecommendationSchema = z.object({
        currentStrategyAssessment: z
          .array(
            z.object({
              strategy: z.string(),
              utilityRating: z.enum(["high", "moderate", "low"]),
              evidenceNote: z.string(),
            }),
          )
          .min(1),
        recommendedStrategies: z
          .array(
            z.object({
              strategy: z.string(),
              utilityRating: z.enum(["high", "moderate"]),
              whyForThisLearner: z.string(),
              howToImplement: z.string(),
              minutesPerSession: z.number().int(),
              priority: z.enum(["primary", "secondary", "supplementary"]),
            }),
          )
          .min(2)
          .max(5),
        strategiesToPhaseOut: z.array(
          z.object({
            strategy: z.string(),
            whyIneffective: z.string(),
            replacementStrategy: z.string(),
          }),
        ),
      });

      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: StrategyRecommendationSchema }),
        prompt: `You are an evidence-based learning scientist recommending study strategies.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["DUNLOSKY_2013", "ROEDIGER_KARPICKE_2006", "CEPEDA_2006", "ROHRER_TAYLOR_2007", "BJORK_2011"])}

## Learner Context
- Current strategies: ${input.currentStrategies.join(", ")}
- Field: ${input.fieldOfStudy}
- Prior knowledge: ${input.priorKnowledgeLevel}
- Goal: ${input.primaryGoal}
- Metacognitive awareness: ${input.metacognitiveAwareness}
- Available time: ${input.availableMinutesPerDay} min/day

## Dunlosky et al. (2013) Utility Rankings [DUNLOSKY_2013]
HIGH utility:
- Practice testing (self-quizzing, flashcards, practice problems)
- Distributed practice (spacing study over time)

MODERATE utility:
- Elaborative interrogation ("Why does this make sense?")
- Self-explanation ("How does this relate to what I already know?")
- Interleaved practice (mixing problem types)

LOW utility:
- Summarization
- Highlighting/underlining
- Keyword mnemonic
- Imagery for text
- Rereading

## Instructions
1. Rate each of the learner's current strategies using the Dunlosky framework.
2. Recommend 2-5 strategies, prioritizing high-utility techniques.
3. Adapt to context:
   - Beginners benefit most from worked examples + self-explanation [SWELLER_1988].
   - Advanced learners benefit from interleaving + desirable difficulties [BJORK_2011].
   - Low metacognition learners need prediction-reflection loops [SCHRAW_1994].
4. Phase out low-utility strategies with specific replacement recommendations.
5. Implementation instructions must be concrete and time-scoped to ${input.availableMinutesPerDay} min/day.
6. NEVER recommend "matching to learning style" [PASHLER_2008].`,
      });
      if (!result.output) {
        throw new Error("Failed to generate strategy recommendations");
      }
      return {
        type: "strategy_recommendations" as const,
        data: result.output,
      };
    },
  }),
};

// ── Prompt builder ──

function buildGuidePrompt(
  input: GuideGenerationInput,
  totalWeeklyMinutes: number,
): string {
  return `You are an evidence-based learning guide generator creating a structured 7-day plan.

${getCitationGuardrails()}

## Academic Citations
${getCitationBlock([
  "ROEDIGER_KARPICKE_2006",
  "CEPEDA_2006",
  "ROHRER_TAYLOR_2007",
  "SWELLER_1988",
  "BJORK_2011",
  "SCHRAW_1994",
  "DUNLOSKY_2013",
  "ZIMMERMAN_2002",
  "RYAN_DECI_2000",
  "WEINSTEIN_2016",
])}

## Learner Context
**Subject:** ${input.fieldOfStudy}
**Goal:** ${input.primaryGoal} — ${input.goalDescription}
**Deadline:** ${input.deadline}
**Prior Knowledge:** ${input.priorKnowledgeLevel}
**Concepts to Cover:** ${input.concepts.join(", ")}

## Time Budget
- ${input.minutesPerDay} minutes per day
- ${input.daysPerWeek} days per week
- Total weekly budget: ${totalWeeklyMinutes} minutes
- Session length: ${input.sessionLength}

## Profile Analysis
**Summary:** ${input.profileSummary}
**Strengths:** ${input.strengths.join("; ")}
**Risks:** ${input.risks.map((r) => `${r.area} (${r.severity}): ${r.mitigation}`).join("; ")}
**Cognitive Load Risk:** ${input.cognitiveLoadRisk}
**Calibration:** ${input.calibrationAccuracy}
**Metacognition:** ${input.metacognitiveAwareness}
**Coaching Tone:** ${input.coachingTone}
**Motivational Focus:** ${input.motivationalFocus} [RYAN_DECI_2000]

## Block Type Rules (with evidence basis)

1. **core_practice** (60-70% of time): Retrieval practice [ROEDIGER_KARPICKE_2006], spaced repetition [CEPEDA_2006], worked examples for beginners [SWELLER_1988].
2. **metacog_routine** (10-15% of time): Prediction-reflection-repair loops [SCHRAW_1994]. REQUIRED if calibration is over-confident or under-confident. REQUIRED if metacognitive awareness is low/medium.
3. **skill_builder** (10-15% of time): Strategy skill lessons [WEINSTEIN_2016, DUNLOSKY_2013]. REQUIRED if any risk severity is "high".
4. **motivation_support** (5-10% of time): Autonomy-supportive activities [RYAN_DECI_2000]. Include if motivational focus indicates unmet needs.

## Scheduling Rules

### Spacing [CEPEDA_2006]
- Introduce new concepts early in the week.
- Schedule review of each concept with increasing intervals (1, 2, 3 days).
- Don't review everything every day — distribute practice.

### Interleaving [ROHRER_TAYLOR_2007]
- Days 1-3: focus blocks (1-2 concepts per session) for initial encoding.
- Days 4-7: interleave previously introduced concepts within sessions.

### Cognitive Load Management [SWELLER_1988]
- ${input.cognitiveLoadRisk === "high" ? "Small blocks (15-20 min). Worked examples before independent practice. Maximum 3 new concepts per day." : input.cognitiveLoadRisk === "medium" ? "Standard blocks (25-35 min). Mix worked examples and independent practice." : "Larger blocks okay (30-45 min). Desirable difficulties encouraged [BJORK_2011]."}

### Desirable Difficulties [BJORK_2011]
- Include retrieval (not rereading), spacing (not massing), interleaving (not blocking), variation (not repetition).
- These feel harder but produce better long-term retention.
- Learners often misjudge effective strategies as less effective — the guide should explain why.

### Self-Regulation [ZIMMERMAN_2002]
- Each day should include a brief forethought moment ("Today I will focus on...").
- Each session ends with reflection ("What did I learn? What's still unclear?").

## Constraints
- EVERY day must have at least 1 core_practice block.
- Total minutes across ALL blocks ≈ ${totalWeeklyMinutes} (±10%).
- Each block: 5-120 minutes.
- Use preferred strategies: ${input.studyStrategies.join(", ")}.
- Rest days (if daysPerWeek < 7): dailySummary with 0 minutes, "Rest day" focus.
- Harder/newer concepts earlier in the week.
- Each block id: "b1", "b2", etc.
- NEVER suggest passive rereading or highlighting as primary activities [DUNLOSKY_2013].`;
}
