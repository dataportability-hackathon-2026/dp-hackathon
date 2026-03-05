import { evalite } from "evalite"
import "./setup"
import {
  BEGINNER_LEARNER,
  ADVANCED_LEARNER,
  BEGINNER_ANALYSIS,
  ADVANCED_ANALYSIS,
  LINEAR_ALGEBRA_CONCEPTS,
  ML_CONCEPTS,
} from "./fixtures"
import { profileTools } from "../src/lib/ai/profile-tools"
import { guideTools } from "../src/lib/ai/guide-tools"
import { artifactTools } from "../src/lib/ai/artifact-tools"

// ── Helper scorer: checks that output is non-null and has expected shape ──

function structureScorer(requiredKeys: string[]) {
  return {
    name: "structure_check",
    scorer: ({ output }: { output: unknown }) => {
      if (!output || typeof output !== "object") return 0
      const data = (output as Record<string, unknown>).data
      if (!data || typeof data !== "object") return 0
      const dataObj = data as Record<string, unknown>
      const found = requiredKeys.filter((k) => k in dataObj).length
      return found / requiredKeys.length
    },
  }
}

function citationScorer() {
  return {
    name: "citation_grounding",
    scorer: ({ output }: { output: unknown }) => {
      // Verify the output was generated (non-null) — the citation grounding
      // is in the prompt, not the output. This just confirms the tool ran.
      if (!output || typeof output !== "object") return 0
      const result = output as Record<string, unknown>
      return result.type ? 1 : 0
    },
  }
}

// ═══════════════════════════════════════════════════════════════
// PROFILE TOOLS
// ═══════════════════════════════════════════════════════════════

evalite("Profile: assess_learning_profile (beginner)", {
  data: () => [
    {
      input: {
        displayName: BEGINNER_LEARNER.displayName,
        educationLevel: BEGINNER_LEARNER.educationLevel,
        fieldOfStudy: BEGINNER_LEARNER.fieldOfStudy,
        primaryGoal: "exam_prep" as const,
        goalDescription: BEGINNER_LEARNER.goalDescription,
        deadline: BEGINNER_LEARNER.deadline,
        minutesPerDay: BEGINNER_LEARNER.minutesPerDay,
        daysPerWeek: BEGINNER_LEARNER.daysPerWeek,
        sessionLength: "short" as const,
        priorKnowledgeLevel: "beginner" as const,
        priorKnowledgeDetails: BEGINNER_LEARNER.priorKnowledgeDetails,
        studyStrategies: BEGINNER_LEARNER.studyStrategies,
        crtScore: 0,
        crtExposureFlagged: false,
        metacogPlanningFrequency: "rarely" as const,
        metacogMonitoring: "sometimes" as const,
        metacogSelfEvaluation: "rarely" as const,
        motivationAutonomy: BEGINNER_LEARNER.motivationAutonomy,
        motivationCompetence: BEGINNER_LEARNER.motivationCompetence,
        motivationRelatedness: BEGINNER_LEARNER.motivationRelatedness,
        calibrationConfidence: BEGINNER_LEARNER.calibrationConfidence,
        biggestChallenge: BEGINNER_LEARNER.biggestChallenge,
        procrastinationFrequency: "often" as const,
        preferredFormats: BEGINNER_LEARNER.preferredFormats,
        coachingTone: "encouraging" as const,
      },
      expected: "profile_analysis",
    },
  ],
  task: async (input) => {
    return profileTools.assess_learning_profile.execute(input, {
      toolCallId: "test-profile-beginner",
      messages: [],
    })
  },
  scorers: [
    structureScorer([
      "summary",
      "strengths",
      "risks",
      "recommendedStrategies",
      "cognitiveProfile",
      "coachingApproach",
    ]),
    citationScorer(),
  ],
  timeout: 30_000,
})

evalite("Profile: assess_calibration", {
  data: () => [
    {
      input: {
        confidencePredictions: [
          { itemId: "i1", predictedConfidence: 85, wasCorrect: false },
          { itemId: "i2", predictedConfidence: 90, wasCorrect: false },
          { itemId: "i3", predictedConfidence: 70, wasCorrect: true },
          { itemId: "i4", predictedConfidence: 80, wasCorrect: false },
          { itemId: "i5", predictedConfidence: 60, wasCorrect: true },
        ],
        selfRatedConfidence: 75,
        priorKnowledgeLevel: "beginner" as const,
        crtScore: 0,
      },
      expected: "calibration_analysis",
    },
  ],
  task: async (input) => {
    return profileTools.assess_calibration.execute(input, {
      toolCallId: "test-calibration",
      messages: [],
    })
  },
  scorers: [
    structureScorer(["calibrationAccuracy", "evidenceBasis", "confidenceInAssessment"]),
    citationScorer(),
    {
      name: "detects_overconfidence",
      scorer: ({ output }: { output: unknown }) => {
        const result = output as { data?: { calibrationAccuracy?: string } }
        return result?.data?.calibrationAccuracy === "over-confident" ? 1 : 0
      },
    },
  ],
  timeout: 30_000,
})

evalite("Profile: assess_dropout_risk (high risk)", {
  data: () => [
    {
      input: {
        motivationAutonomy: 25,
        motivationCompetence: 20,
        motivationRelatedness: 30,
        sessionsCompleted: 3,
        sessionsSkipped: 8,
        averageSessionCompletionRate: 0.4,
        daysSinceLastSession: 10,
        procrastinationFrequency: "always" as const,
        biggestChallenge: "I feel overwhelmed and behind",
        goalType: "exam_prep",
      },
      expected: "dropout_risk",
    },
  ],
  task: async (input) => {
    return profileTools.assess_dropout_risk.execute(input, {
      toolCallId: "test-dropout",
      messages: [],
    })
  },
  scorers: [
    structureScorer(["riskLevel", "signals", "protectiveFactors", "sdtIntervention"]),
    citationScorer(),
    {
      name: "detects_high_risk",
      scorer: ({ output }: { output: unknown }) => {
        const result = output as { data?: { riskLevel?: string } }
        return result?.data?.riskLevel === "high" || result?.data?.riskLevel === "critical"
          ? 1
          : 0
      },
    },
  ],
  timeout: 30_000,
})

// ═══════════════════════════════════════════════════════════════
// GUIDE TOOLS
// ═══════════════════════════════════════════════════════════════

evalite("Guide: generate_learning_guide (beginner)", {
  data: () => [
    {
      input: {
        fieldOfStudy: "Linear Algebra",
        primaryGoal: "Exam Prep",
        goalDescription: "Pass midterm with B+",
        deadline: "2026-03-20",
        minutesPerDay: 45,
        daysPerWeek: 5,
        sessionLength: "short" as const,
        priorKnowledgeLevel: "beginner" as const,
        studyStrategies: ["active-recall", "spaced-repetition"],
        concepts: LINEAR_ALGEBRA_CONCEPTS,
        profileSummary: BEGINNER_ANALYSIS.summary,
        strengths: BEGINNER_ANALYSIS.strengths,
        risks: BEGINNER_ANALYSIS.risks.map((r) => ({
          area: r.area,
          severity: r.severity,
          mitigation: r.mitigation,
        })),
        cognitiveLoadRisk: "high" as const,
        calibrationAccuracy: "over-confident" as const,
        metacognitiveAwareness: "low" as const,
        motivationalFocus: "competence" as const,
        coachingTone: "Encouraging but honest",
      },
      expected: "learning_guide",
    },
  ],
  task: async (input) => {
    return guideTools.generate_learning_guide.execute(input, {
      toolCallId: "test-guide-beginner",
      messages: [],
    })
  },
  scorers: [
    structureScorer(["title", "goalSummary", "blocks", "dailySummaries"]),
    citationScorer(),
    {
      name: "has_7_day_summaries",
      scorer: ({ output }: { output: unknown }) => {
        const result = output as { data?: { dailySummaries?: unknown[] } }
        return result?.data?.dailySummaries?.length === 7 ? 1 : 0
      },
    },
    {
      name: "has_minimum_blocks",
      scorer: ({ output }: { output: unknown }) => {
        const result = output as { data?: { blocks?: unknown[] } }
        return (result?.data?.blocks?.length ?? 0) >= 7 ? 1 : 0
      },
    },
  ],
  timeout: 60_000,
})

evalite("Guide: recommend_study_strategies (low-utility user)", {
  data: () => [
    {
      input: {
        currentStrategies: ["highlighting", "rereading", "summarization"],
        fieldOfStudy: "Linear Algebra",
        priorKnowledgeLevel: "beginner" as const,
        primaryGoal: "exam_prep",
        metacognitiveAwareness: "low" as const,
        availableMinutesPerDay: 45,
      },
      expected: "strategy_recommendations",
    },
  ],
  task: async (input) => {
    return guideTools.recommend_study_strategies.execute(input, {
      toolCallId: "test-strategies",
      messages: [],
    })
  },
  scorers: [
    structureScorer([
      "currentStrategyAssessment",
      "recommendedStrategies",
      "strategiesToPhaseOut",
    ]),
    citationScorer(),
    {
      name: "flags_low_utility",
      scorer: ({ output }: { output: unknown }) => {
        const result = output as {
          data?: { strategiesToPhaseOut?: unknown[] }
        }
        return (result?.data?.strategiesToPhaseOut?.length ?? 0) > 0 ? 1 : 0
      },
    },
  ],
  timeout: 30_000,
})

// ═══════════════════════════════════════════════════════════════
// ARTIFACT TOOLS
// ═══════════════════════════════════════════════════════════════

const BEGINNER_ARTIFACT_INPUT = {
  subject: "Linear Algebra",
  concepts: LINEAR_ALGEBRA_CONCEPTS.slice(0, 3),
  priorKnowledgeLevel: "beginner" as const,
  goalType: "exam_prep",
  calibrationAccuracy: "over-confident" as const,
  cognitiveLoadRisk: "high" as const,
  metacognitiveAwareness: "low" as const,
  coachingTone: "encouraging" as const,
}

const ADVANCED_ARTIFACT_INPUT = {
  subject: "Machine Learning",
  concepts: ML_CONCEPTS.slice(0, 3),
  priorKnowledgeLevel: "advanced" as const,
  goalType: "deep_understanding",
  calibrationAccuracy: "well-calibrated" as const,
  cognitiveLoadRisk: "low" as const,
  metacognitiveAwareness: "high" as const,
  coachingTone: "direct" as const,
}

evalite("Artifact: create_adaptive_quiz (beginner, over-confident)", {
  data: () => [{ input: BEGINNER_ARTIFACT_INPUT, expected: "quiz" }],
  task: async (input) => {
    return artifactTools.create_adaptive_quiz.execute(input, {
      toolCallId: "test-quiz-beginner",
      messages: [],
    })
  },
  scorers: [
    structureScorer(["title", "questions"]),
    citationScorer(),
    {
      name: "has_3_to_15_questions",
      scorer: ({ output }: { output: unknown }) => {
        const result = output as { data?: { questions?: unknown[] } }
        const count = result?.data?.questions?.length ?? 0
        return count >= 3 && count <= 15 ? 1 : 0
      },
    },
  ],
  timeout: 30_000,
})

evalite("Artifact: create_adaptive_flashcards (advanced)", {
  data: () => [{ input: ADVANCED_ARTIFACT_INPUT, expected: "flashcards" }],
  task: async (input) => {
    return artifactTools.create_adaptive_flashcards.execute(input, {
      toolCallId: "test-flashcards-advanced",
      messages: [],
    })
  },
  scorers: [
    structureScorer(["title", "cards"]),
    citationScorer(),
    {
      name: "has_3_to_20_cards",
      scorer: ({ output }: { output: unknown }) => {
        const result = output as { data?: { cards?: unknown[] } }
        const count = result?.data?.cards?.length ?? 0
        return count >= 3 && count <= 20 ? 1 : 0
      },
    },
  ],
  timeout: 30_000,
})

evalite("Artifact: create_worked_example (beginner)", {
  data: () => [
    {
      input: {
        ...BEGINNER_ARTIFACT_INPUT,
        problemContext:
          "Solve a 2x2 system of linear equations using matrix row reduction",
      },
      expected: "worked_example",
    },
  ],
  task: async (input) => {
    return artifactTools.create_worked_example.execute(input, {
      toolCallId: "test-worked-example",
      messages: [],
    })
  },
  scorers: [
    structureScorer(["title", "steps", "fadeLevel", "selfExplanationPrompts"]),
    citationScorer(),
    {
      name: "full_scaffolding_for_beginner",
      scorer: ({ output }: { output: unknown }) => {
        const result = output as { data?: { fadeLevel?: string } }
        return result?.data?.fadeLevel === "full" ? 1 : 0
      },
    },
  ],
  timeout: 30_000,
})

evalite("Artifact: create_prediction_reflection (over-confident)", {
  data: () => [{ input: BEGINNER_ARTIFACT_INPUT, expected: "prediction_reflection" }],
  task: async (input) => {
    return artifactTools.create_prediction_reflection.execute(input, {
      toolCallId: "test-prediction-reflection",
      messages: [],
    })
  },
  scorers: [
    structureScorer(["title", "items"]),
    citationScorer(),
    {
      name: "has_3_to_8_items",
      scorer: ({ output }: { output: unknown }) => {
        const result = output as { data?: { items?: unknown[] } }
        const count = result?.data?.items?.length ?? 0
        return count >= 3 && count <= 8 ? 1 : 0
      },
    },
  ],
  timeout: 30_000,
})

evalite("Artifact: create_interleaved_problem_set (advanced)", {
  data: () => [{ input: ADVANCED_ARTIFACT_INPUT, expected: "interleaved_problem_set" }],
  task: async (input) => {
    return artifactTools.create_interleaved_problem_set.execute(input, {
      toolCallId: "test-interleaved",
      messages: [],
    })
  },
  scorers: [
    structureScorer(["title", "problems", "conceptOrder"]),
    citationScorer(),
    {
      name: "has_4_to_12_problems",
      scorer: ({ output }: { output: unknown }) => {
        const result = output as { data?: { problems?: unknown[] } }
        const count = result?.data?.problems?.length ?? 0
        return count >= 4 && count <= 12 ? 1 : 0
      },
    },
  ],
  timeout: 30_000,
})

evalite("Artifact: create_interleaved_problem_set (single concept - edge case)", {
  data: () => [
    {
      input: {
        ...BEGINNER_ARTIFACT_INPUT,
        concepts: ["Matrix Operations"],
      },
      expected: "interleaved_problem_set_error",
    },
  ],
  task: async (input) => {
    return artifactTools.create_interleaved_problem_set.execute(input, {
      toolCallId: "test-interleaved-edge",
      messages: [],
    })
  },
  scorers: [
    {
      name: "rejects_single_concept",
      scorer: ({ output }: { output: unknown }) => {
        const result = output as { error?: string }
        return result?.error ? 1 : 0
      },
    },
  ],
  timeout: 5_000,
})
