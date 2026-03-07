import { generateText, Output, tool } from "ai";
import { z } from "zod";
import {
  type CitationKey,
  getCitationBlock,
  getCitationGuardrails,
} from "./citations";
import { openai } from "./provider";
import { LearningProfileAnalysisSchema } from "./schemas";

// ── Shared citation sets for profile generation ──

const PROFILE_CITATIONS: CitationKey[] = [
  "PASHLER_2008",
  "FREDERICK_2005",
  "SCHRAW_1994",
  "WEINSTEIN_2016",
  "RYAN_DECI_2000",
  "PINTRICH_1991",
  "VEDEL_2014",
  "PRIMI_2016",
  "SWELLER_1988",
  "DUNLOSKY_2013",
  "ZIMMERMAN_2002",
];

// ── Schema for profile assessment input ──

const profileAssessmentInputSchema = z.object({
  displayName: z.string().describe("Learner's display name"),
  educationLevel: z.string().describe("Current education level"),
  fieldOfStudy: z.string().describe("Primary field of study"),
  primaryGoal: z
    .enum([
      "exam_prep",
      "deep_understanding",
      "project_fluency",
      "teaching",
      "career_switch",
    ])
    .describe("Primary learning goal type"),
  goalDescription: z.string().describe("Detailed goal description"),
  deadline: z.string().describe("Target completion date or 'open-ended'"),
  minutesPerDay: z
    .number()
    .int()
    .min(5)
    .max(480)
    .describe("Available study minutes per day"),
  daysPerWeek: z.number().int().min(1).max(7).describe("Study days per week"),
  sessionLength: z
    .enum(["short", "medium", "long"])
    .describe(
      "Preferred session length: short (15-25min), medium (30-45min), long (60-90min)",
    ),
  priorKnowledgeLevel: z
    .enum(["beginner", "intermediate", "advanced"])
    .describe("Self-assessed prior knowledge level"),
  priorKnowledgeDetails: z.string().describe("What the learner already knows"),
  studyStrategies: z
    .array(z.string())
    .min(1)
    .describe("Study strategies the learner currently uses"),
  crtScore: z
    .number()
    .int()
    .min(0)
    .max(3)
    .nullable()
    .describe("Cognitive Reflection Test score (0-3), null if not taken"),
  crtExposureFlagged: z
    .boolean()
    .describe("Whether the learner reported prior CRT exposure"),
  metacogPlanningFrequency: z
    .enum(["rarely", "sometimes", "often", "always"])
    .describe("How often the learner plans before studying"),
  metacogMonitoring: z
    .enum(["rarely", "sometimes", "often", "always"])
    .describe("How often the learner monitors comprehension during study"),
  metacogSelfEvaluation: z
    .enum(["rarely", "sometimes", "often", "always"])
    .describe("How often the learner evaluates after studying"),
  motivationAutonomy: z
    .number()
    .min(0)
    .max(100)
    .describe("SDT autonomy need score (0-100)"),
  motivationCompetence: z
    .number()
    .min(0)
    .max(100)
    .describe("SDT competence need score (0-100)"),
  motivationRelatedness: z
    .number()
    .min(0)
    .max(100)
    .describe("SDT relatedness need score (0-100)"),
  calibrationConfidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Self-rated confidence percentage (0-100)"),
  biggestChallenge: z.string().describe("Learner's biggest study challenge"),
  procrastinationFrequency: z
    .enum(["rarely", "sometimes", "often", "always"])
    .describe("How often the learner procrastinates"),
  preferredFormats: z
    .array(z.string())
    .describe(
      "Preferred content formats (for UX only, never for pedagogical claims)",
    ),
  coachingTone: z
    .enum(["direct", "encouraging", "socratic", "collaborative"])
    .describe("Preferred coaching tone"),
});

type ProfileAssessmentInput = z.infer<typeof profileAssessmentInputSchema>;

// ── Calibration analysis schema ──

const CalibrationAnalysisSchema = z.object({
  calibrationAccuracy: z
    .enum(["under-confident", "well-calibrated", "over-confident"])
    .describe("Overall calibration assessment"),
  evidenceBasis: z
    .string()
    .describe("What evidence was used to determine calibration"),
  confidenceInAssessment: z
    .enum(["low", "medium", "high"])
    .describe("How confident the system is in this calibration assessment"),
  recommendedIntervention: z
    .string()
    .describe("What to do about calibration gaps, if any"),
});

// ── Cognitive load risk schema ──

const CognitiveLoadRiskSchema = z.object({
  riskLevel: z
    .enum(["low", "medium", "high"])
    .describe("Cognitive load risk level"),
  evidenceBasis: z.string().describe("What evidence indicates this risk level"),
  chunkSizeRecommendation: z
    .enum(["small", "standard", "large"])
    .describe("Recommended content chunk size"),
  workedExamplesNeeded: z
    .boolean()
    .describe("Whether worked examples should be included"),
});

// ── Dropout risk schema ──

const DropoutRiskSchema = z.object({
  riskLevel: z.enum(["low", "moderate", "high", "critical"]),
  signals: z
    .array(z.string())
    .min(1)
    .describe("Observable signals contributing to dropout risk"),
  protectiveFactors: z
    .array(z.string())
    .describe("Factors that reduce dropout risk"),
  sdtIntervention: z.object({
    primaryNeed: z
      .enum(["autonomy", "competence", "relatedness"])
      .describe("The lowest SDT need to target first [RYAN_DECI_2000]"),
    strategy: z.string().describe("Specific SDT-grounded intervention"),
  }),
});

// ── Tools ──

export const profileTools = {
  assess_learning_profile: tool({
    description:
      "Generate a comprehensive learning profile analysis from intake data. Uses validated constructs (CRT, MAI, SDT, LASSI) with uncertainty quantification. NEVER labels learners by style — measures what predicts outcomes [PASHLER_2008]. Returns structured analysis with strengths, risks, strategies, and coaching approach.",
    inputSchema: profileAssessmentInputSchema,
    execute: async (input: ProfileAssessmentInput) => {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: LearningProfileAnalysisSchema }),
        prompt: buildProfileAnalysisPrompt(input),
      });
      if (!result.output) {
        throw new Error("Failed to generate profile analysis");
      }
      return { type: "profile_analysis" as const, data: result.output };
    },
  }),

  assess_calibration: tool({
    description:
      "Analyze a learner's metacognitive calibration — the gap between confidence and actual accuracy. Poor calibration is one of the strongest predictors of ineffective study [SCHRAW_1994]. Returns calibration accuracy, evidence basis, confidence level, and recommended intervention.",
    inputSchema: z.object({
      confidencePredictions: z
        .array(
          z.object({
            itemId: z.string(),
            predictedConfidence: z.number().min(0).max(100),
            wasCorrect: z.boolean(),
          }),
        )
        .min(3)
        .describe("Confidence predictions paired with actual outcomes"),
      selfRatedConfidence: z
        .number()
        .min(0)
        .max(100)
        .describe("Learner's overall self-rated confidence"),
      priorKnowledgeLevel: z
        .enum(["beginner", "intermediate", "advanced"])
        .describe("Self-assessed prior knowledge"),
      crtScore: z.number().int().min(0).max(3).nullable(),
    }),
    execute: async (input) => {
      const avgConfidence =
        input.confidencePredictions.reduce(
          (sum, p) => sum + p.predictedConfidence,
          0,
        ) / input.confidencePredictions.length;
      const accuracy =
        input.confidencePredictions.filter((p) => p.wasCorrect).length /
        input.confidencePredictions.length;
      const calibrationGap = Math.abs(avgConfidence / 100 - accuracy);

      // Deterministic Brier score calculation
      const brierScore =
        input.confidencePredictions.reduce((sum, p) => {
          const predicted = p.predictedConfidence / 100;
          const actual = p.wasCorrect ? 1 : 0;
          return sum + (predicted - actual) ** 2;
        }, 0) / input.confidencePredictions.length;

      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: CalibrationAnalysisSchema }),
        prompt: `You are an evidence-based learning scientist analyzing metacognitive calibration.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["SCHRAW_1994", "DUNLOSKY_2013", "BJORK_2011"])}

## Computed Metrics (deterministic — do not recalculate)
- Average predicted confidence: ${(avgConfidence).toFixed(1)}%
- Actual accuracy: ${(accuracy * 100).toFixed(1)}%
- Calibration gap (|confidence - accuracy|): ${(calibrationGap * 100).toFixed(1)} percentage points
- Brier score: ${brierScore.toFixed(4)} (0 = perfect, 1 = worst)
- Number of items: ${input.confidencePredictions.length}
- Self-rated overall confidence: ${input.selfRatedConfidence}%
- Prior knowledge level: ${input.priorKnowledgeLevel}
- CRT score: ${input.crtScore !== null ? `${input.crtScore}/3` : "not taken"}

## Instructions
1. Assess calibration accuracy based on the computed gap and Brier score.
2. If calibration gap > 15pp or Brier > 0.25, classify as over-confident or under-confident.
3. If CRT score is low (0-1) AND confidence is high, this is a strong over-confidence signal [FREDERICK_2005].
4. Set confidenceInAssessment based on sample size: <5 items = low, 5-15 = medium, >15 = high.
5. Recommend prediction-reflection-repair loops for poor calibration [SCHRAW_1994].
6. NEVER claim the learner "should feel" a certain confidence — calibration is empirical.`,
      });
      if (!result.output) {
        throw new Error("Failed to assess calibration");
      }
      return {
        type: "calibration_analysis" as const,
        data: {
          ...result.output,
          metrics: {
            avgConfidence,
            accuracy: accuracy * 100,
            calibrationGap: calibrationGap * 100,
            brierScore,
            sampleSize: input.confidencePredictions.length,
          },
        },
      };
    },
  }),

  assess_cognitive_load_risk: tool({
    description:
      "Assess cognitive load risk based on learner performance signals. High cognitive load impairs learning — worked examples reduce extraneous load for novices, but become redundant as expertise grows (expertise reversal effect) [SWELLER_1988]. Returns risk level, evidence basis, and chunk size recommendation.",
    inputSchema: z.object({
      priorKnowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]),
      averageResponseTimeMs: z
        .number()
        .describe("Average response time in milliseconds"),
      errorRate: z.number().min(0).max(1).describe("Error rate (0-1)"),
      errorRateTrend: z
        .enum(["decreasing", "stable", "increasing"])
        .describe("Whether error rate is trending up or down"),
      latencyTrend: z
        .enum(["decreasing", "stable", "increasing"])
        .describe("Whether response latency is trending up or down"),
      fieldOfStudy: z.string(),
      recentConcepts: z
        .array(z.string())
        .describe("Concepts attempted recently"),
    }),
    execute: async (input) => {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: CognitiveLoadRiskSchema }),
        prompt: `You are an evidence-based learning scientist assessing cognitive load risk.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["SWELLER_1988", "BJORK_2011"])}

## Learner Performance Data
- Prior knowledge: ${input.priorKnowledgeLevel}
- Average response time: ${input.averageResponseTimeMs}ms
- Error rate: ${(input.errorRate * 100).toFixed(1)}%
- Error rate trend: ${input.errorRateTrend}
- Latency trend: ${input.latencyTrend}
- Field: ${input.fieldOfStudy}
- Recent concepts: ${input.recentConcepts.join(", ")}

## Instructions
1. Rising error rate + rising latency = strong cognitive overload signal.
2. Beginners need worked examples and small chunks [SWELLER_1988].
3. Advanced learners experiencing overload likely face conceptual complexity, not format issues.
4. Error rate > 50% with increasing trend = high risk.
5. Error rate 30-50% with stable trend = medium risk.
6. DO NOT recommend "matching to learning style" — this is not evidence-based [PASHLER_2008].
7. Recommend desirable difficulties only when load is manageable [BJORK_2011].`,
      });
      if (!result.output) {
        throw new Error("Failed to assess cognitive load risk");
      }
      return { type: "cognitive_load_risk" as const, data: result.output };
    },
  }),

  assess_dropout_risk: tool({
    description:
      "Assess dropout risk using SDT-grounded motivational analysis and adherence signals. Motivation is the strongest predictor of persistence [RYAN_DECI_2000]. Returns risk level, signals, protective factors, and SDT-based intervention targeting the lowest motivational need.",
    inputSchema: z.object({
      motivationAutonomy: z.number().min(0).max(100),
      motivationCompetence: z.number().min(0).max(100),
      motivationRelatedness: z.number().min(0).max(100),
      sessionsCompleted: z.number().int().min(0),
      sessionsSkipped: z.number().int().min(0),
      averageSessionCompletionRate: z
        .number()
        .min(0)
        .max(1)
        .describe("Proportion of session blocks completed (0-1)"),
      daysSinceLastSession: z.number().int().min(0),
      procrastinationFrequency: z.enum([
        "rarely",
        "sometimes",
        "often",
        "always",
      ]),
      biggestChallenge: z.string(),
      goalType: z.string(),
    }),
    execute: async (input) => {
      const adherenceRate =
        input.sessionsCompleted + input.sessionsSkipped > 0
          ? input.sessionsCompleted /
            (input.sessionsCompleted + input.sessionsSkipped)
          : 1;
      const lowestSdtNeed = [
        { need: "autonomy" as const, score: input.motivationAutonomy },
        { need: "competence" as const, score: input.motivationCompetence },
        { need: "relatedness" as const, score: input.motivationRelatedness },
      ].sort((a, b) => a.score - b.score)[0];

      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: DropoutRiskSchema }),
        prompt: `You are an evidence-based learning scientist assessing dropout risk using Self-Determination Theory.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["RYAN_DECI_2000", "PINTRICH_1991", "ZIMMERMAN_2002"])}

## Adherence Data
- Sessions completed: ${input.sessionsCompleted}
- Sessions skipped: ${input.sessionsSkipped}
- Adherence rate: ${(adherenceRate * 100).toFixed(1)}%
- Average session completion: ${(input.averageSessionCompletionRate * 100).toFixed(1)}%
- Days since last session: ${input.daysSinceLastSession}
- Procrastination: ${input.procrastinationFrequency}

## Motivation (SDT, 0-100)
- Autonomy: ${input.motivationAutonomy}
- Competence: ${input.motivationCompetence}
- Relatedness: ${input.motivationRelatedness}
- Lowest need: ${lowestSdtNeed.need} (${lowestSdtNeed.score})

## Context
- Goal: ${input.goalType}
- Biggest challenge: ${input.biggestChallenge}

## Instructions
1. Dropout risk is primarily driven by unmet SDT needs [RYAN_DECI_2000].
2. Adherence rate < 50% = high risk. < 30% = critical.
3. Days since last session > 7 with declining adherence = escalation signal.
4. The primary SDT intervention MUST target the lowest-scoring need.
5. For low autonomy: offer choice-based paths, not fixed sequences.
6. For low competence: increase mastery-proof checkpoints and explicit progress evidence.
7. For low relatedness: this is hardest for autodidacts — suggest community, study groups, or progress sharing.
8. NEVER use personality to gate difficulty [VEDEL_2014].
9. Motivational support is policy, not vibe [RYAN_DECI_2000].`,
      });
      if (!result.output) {
        throw new Error("Failed to assess dropout risk");
      }
      return {
        type: "dropout_risk" as const,
        data: {
          ...result.output,
          metrics: {
            adherenceRate: adherenceRate * 100,
            lowestSdtNeed: lowestSdtNeed.need,
            lowestSdtScore: lowestSdtNeed.score,
          },
        },
      };
    },
  }),

  assess_self_regulation: tool({
    description:
      "Assess self-regulation capacity based on metacognitive self-reports and behavioral signals. Self-regulated learning involves forethought, performance monitoring, and self-reflection — all trainable [ZIMMERMAN_2002]. Returns regulation level, deficits, and targeted skill modules.",
    inputSchema: z.object({
      metacogPlanningFrequency: z.enum([
        "rarely",
        "sometimes",
        "often",
        "always",
      ]),
      metacogMonitoring: z.enum(["rarely", "sometimes", "often", "always"]),
      metacogSelfEvaluation: z.enum(["rarely", "sometimes", "often", "always"]),
      studyStrategies: z.array(z.string()),
      procrastinationFrequency: z.enum([
        "rarely",
        "sometimes",
        "often",
        "always",
      ]),
      adherencePattern: z
        .enum(["consistent", "irregular", "declining", "absent"])
        .describe("Overall pattern of session adherence"),
      fieldOfStudy: z.string(),
    }),
    execute: async (input) => {
      const SelfRegulationSchema = z.object({
        overallLevel: z.enum(["low", "medium", "high"]),
        forethoughtPhase: z.object({
          level: z.enum(["weak", "developing", "strong"]),
          deficit: z.string().nullable(),
        }),
        performancePhase: z.object({
          level: z.enum(["weak", "developing", "strong"]),
          deficit: z.string().nullable(),
        }),
        reflectionPhase: z.object({
          level: z.enum(["weak", "developing", "strong"]),
          deficit: z.string().nullable(),
        }),
        strategyQuality: z.object({
          highUtilityCount: z.number().int(),
          lowUtilityDetected: z.array(z.string()),
          recommendation: z.string(),
        }),
        skillModules: z
          .array(
            z.object({
              module: z.string(),
              targetPhase: z.enum(["forethought", "performance", "reflection"]),
              rationale: z.string(),
              priority: z.enum(["required", "recommended", "optional"]),
            }),
          )
          .min(1)
          .max(5),
      });

      const highUtilityStrategies = [
        "practice testing",
        "active recall",
        "retrieval practice",
        "spaced repetition",
        "distributed practice",
        "interleaving",
        "elaborative interrogation",
        "self-explanation",
      ];
      const lowUtilityStrategies = [
        "rereading",
        "highlighting",
        "summarization",
        "keyword mnemonic",
        "imagery",
      ];
      const detectedHighUtility = input.studyStrategies.filter((s) =>
        highUtilityStrategies.some((h) => s.toLowerCase().includes(h)),
      );
      const detectedLowUtility = input.studyStrategies.filter((s) =>
        lowUtilityStrategies.some((l) => s.toLowerCase().includes(l)),
      );

      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: SelfRegulationSchema }),
        prompt: `You are an evidence-based learning scientist assessing self-regulation capacity.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["ZIMMERMAN_2002", "SCHRAW_1994", "DUNLOSKY_2013", "WEINSTEIN_2016"])}

## Self-Report Data
- Planning frequency: ${input.metacogPlanningFrequency}
- Monitoring frequency: ${input.metacogMonitoring}
- Self-evaluation frequency: ${input.metacogSelfEvaluation}
- Procrastination: ${input.procrastinationFrequency}
- Adherence pattern: ${input.adherencePattern}

## Strategy Analysis
- Reported strategies: ${input.studyStrategies.join(", ")}
- High-utility strategies detected: ${detectedHighUtility.length > 0 ? detectedHighUtility.join(", ") : "none"}
- Low-utility strategies detected: ${detectedLowUtility.length > 0 ? detectedLowUtility.join(", ") : "none"}

## Zimmerman's 3-Phase Model [ZIMMERMAN_2002]
1. FORETHOUGHT: goal setting, strategic planning, self-efficacy beliefs. Map to planning frequency + procrastination.
2. PERFORMANCE: self-monitoring, attention focusing, strategy use. Map to monitoring frequency + strategy quality.
3. REFLECTION: self-evaluation, causal attribution, adaptive responses. Map to self-evaluation frequency + adherence pattern.

## Dunlosky Strategy Utility Rankings [DUNLOSKY_2013]
- HIGH utility: practice testing, distributed practice
- MODERATE utility: elaborative interrogation, self-explanation, interleaving
- LOW utility: summarization, highlighting, rereading, keyword mnemonic, imagery

## Instructions
1. Assess each phase independently based on mapped indicators.
2. Count high-utility strategies used: ${detectedHighUtility.length} detected.
3. Flag low-utility strategies with evidence-based alternatives [DUNLOSKY_2013].
4. Recommend skill modules targeting the weakest phase [ZIMMERMAN_2002].
5. If procrastination is "often" or "always" with declining adherence, forethought is weak.
6. If monitoring is "rarely", performance phase is weak — recommend self-testing prompts.
7. Strategy quality: learners often prefer ineffective strategies [BJORK_2011] — guide toward high-utility alternatives.`,
      });
      if (!result.output) {
        throw new Error("Failed to assess self-regulation");
      }
      return { type: "self_regulation" as const, data: result.output };
    },
  }),
};

// ── Prompt builder ──

export function buildProfileAnalysisPrompt(
  input: ProfileAssessmentInput,
): string {
  const metacogScore = {
    rarely: 1,
    sometimes: 2,
    often: 3,
    always: 4,
  };
  const avgMetacog =
    (metacogScore[input.metacogPlanningFrequency] +
      metacogScore[input.metacogMonitoring] +
      metacogScore[input.metacogSelfEvaluation]) /
    3;

  const lowestSdt = [
    { need: "autonomy", score: input.motivationAutonomy },
    { need: "competence", score: input.motivationCompetence },
    { need: "relatedness", score: input.motivationRelatedness },
  ].sort((a, b) => a.score - b.score)[0];

  let crtInterpretation: string;
  if (input.crtScore === null) {
    crtInterpretation = "CRT not taken — reflectiveness unknown.";
  } else if (input.crtExposureFlagged) {
    crtInterpretation = `CRT score ${input.crtScore}/3 BUT prior exposure flagged — score may be inflated [PRIMI_2016]. Reduce confidence in reflectiveness assessment.`;
  } else {
    crtInterpretation =
      input.crtScore >= 2
        ? `CRT score ${input.crtScore}/3 — high reflectiveness [FREDERICK_2005]. Can handle less scaffolded presentations.`
        : input.crtScore === 1
          ? `CRT score ${input.crtScore}/3 — moderate reflectiveness. May need structured reasoning on intuitive-trap problems.`
          : `CRT score ${input.crtScore}/3 — low reflectiveness [FREDERICK_2005]. Needs explicit reflective pauses and scaffolded reasoning.`;
  }

  return `You are an evidence-based learning scientist producing a structured learner profile analysis.

${getCitationGuardrails()}

## Academic Citations
${getCitationBlock(PROFILE_CITATIONS)}

## Learner Data

**Identity:** ${input.displayName}, ${input.educationLevel}, studying ${input.fieldOfStudy}
**Goal:** ${input.primaryGoal} — ${input.goalDescription}
**Deadline:** ${input.deadline}

**Study Schedule:** ${input.minutesPerDay} min/day, ${input.daysPerWeek} days/week, sessions: ${input.sessionLength}

**Cognitive Reflection:** ${crtInterpretation}

**Metacognition (self-report):**
- Planning: ${input.metacogPlanningFrequency}
- Monitoring: ${input.metacogMonitoring}
- Self-evaluation: ${input.metacogSelfEvaluation}
- Average metacognitive score: ${avgMetacog.toFixed(1)}/4.0

**Study Strategies:** ${input.studyStrategies.join(", ")}

**Motivation (SDT, 0-100):** Autonomy=${input.motivationAutonomy}, Competence=${input.motivationCompetence}, Relatedness=${input.motivationRelatedness}
- Lowest SDT need: ${lowestSdt.need} (${lowestSdt.score}) — target this first [RYAN_DECI_2000]

**Self-Rated Confidence:** ${input.calibrationConfidence}%
**Prior Knowledge:** ${input.priorKnowledgeLevel} — ${input.priorKnowledgeDetails}

**Challenges:** ${input.biggestChallenge}. Procrastination: ${input.procrastinationFrequency}
**Preferences (UX only, NOT pedagogy [PASHLER_2008]):** ${input.preferredFormats.join(", ")}
**Coaching tone:** ${input.coachingTone}

## Analysis Instructions

1. Analyze ALL dimensions: cognitive [FREDERICK_2005], metacognitive [SCHRAW_1994], motivational [RYAN_DECI_2000], strategic [WEINSTEIN_2016, DUNLOSKY_2013], and self-regulatory [ZIMMERMAN_2002].

2. Map CRT + self-reported confidence against prior knowledge level to assess calibration:
   - High confidence + low CRT + beginner knowledge = likely over-confident.
   - Low confidence + high CRT + advanced knowledge = likely under-confident.
   - Both are actionable signals for calibration training [SCHRAW_1994].

3. Identify strategy gaps using Dunlosky (2013) utility rankings:
   - If the learner uses ONLY low-utility strategies (rereading, highlighting), flag this as a risk.
   - Recommend high-utility replacements: retrieval practice [ROEDIGER_KARPICKE_2006], spaced practice [CEPEDA_2006].

4. Map SDT scores to interventions:
   - Lowest need = primary motivational focus [RYAN_DECI_2000].
   - Low autonomy → choice-based paths.
   - Low competence → mastery-proof checkpoints.
   - Low relatedness → community/accountability features.

5. Recommend coaching approach based on stated tone preference AND identified needs:
   - If needs conflict with preference (e.g., learner wants "direct" but has low competence), note both and explain the trade-off.
   - Personality modulates tone ONLY [VEDEL_2014].

6. Set feedback frequency based on metacognitive level:
   - Low metacognition → after-each-block feedback.
   - Medium → daily feedback.
   - High → end-of-week feedback.

7. NEVER claim that format preferences improve learning outcomes [PASHLER_2008].`;
}

export type { ProfileAssessmentInput };
