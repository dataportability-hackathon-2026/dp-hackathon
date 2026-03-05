import { z } from "zod"

// ── Learning Profile Analysis Schema ──

export const LearningProfileAnalysisSchema = z.object({
  summary: z.string().describe("2-3 sentence overview of the learner"),
  strengths: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe("Key strengths identified from the profile"),
  risks: z
    .array(
      z.object({
        area: z.string().describe("Risk area name"),
        severity: z.enum(["low", "medium", "high"]),
        description: z.string().describe("Why this is a risk"),
        mitigation: z.string().describe("Recommended countermeasure"),
      }),
    )
    .min(1)
    .max(5)
    .describe("Identified risks and mitigations"),
  recommendedStrategies: z
    .array(
      z.object({
        strategy: z.string(),
        rationale: z.string(),
        priority: z.enum(["primary", "secondary", "supplementary"]),
      }),
    )
    .min(2)
    .max(5),
  cognitiveProfile: z.object({
    reflectivenessLevel: z
      .enum(["low", "medium", "high"])
      .describe("Based on CRT answers"),
    metacognitiveAwareness: z
      .enum(["low", "medium", "high"])
      .describe("Based on metacognitive self-reports"),
    calibrationAccuracy: z
      .enum(["under-confident", "well-calibrated", "over-confident"])
      .describe("Based on confidence calibration data"),
  }),
  coachingApproach: z.object({
    tone: z.string().describe("Recommended coaching tone"),
    feedbackFrequency: z.enum(["after-each-block", "daily", "end-of-week"]),
    motivationalFocus: z
      .enum(["autonomy", "competence", "relatedness"])
      .describe("Primary SDT need to address"),
  }),
})

export type LearningProfileAnalysis = z.infer<
  typeof LearningProfileAnalysisSchema
>

// ── 7-Day Learning Guide Schema ──

export const GuideBlockSchema = z.object({
  id: z.string(),
  dayIndex: z.number().int().min(1).max(7),
  blockType: z.enum([
    "core_practice",
    "metacog_routine",
    "skill_builder",
    "motivation_support",
  ]),
  title: z.string().describe("Short block title"),
  description: z.string().describe("What the learner does in this block"),
  plannedMinutes: z
    .number()
    .int()
    .min(5)
    .max(120)
    .describe("Duration in minutes"),
  concepts: z
    .array(z.string())
    .min(1)
    .describe("Concepts covered in this block"),
  techniques: z
    .array(
      z.enum([
        "active-recall",
        "spaced-repetition",
        "worked-examples",
        "elaboration",
        "interleaving",
        "summarization",
        "mind-mapping",
        "prediction-reflection",
      ]),
    )
    .min(1)
    .describe("Learning techniques used"),
})

export const LearningGuideSchema = z.object({
  title: z.string().describe("Guide title"),
  goalSummary: z
    .string()
    .describe("1-2 sentence summary of what this guide aims to achieve"),
  totalMinutesPerWeek: z
    .number()
    .int()
    .describe("Total planned minutes for the week"),
  blocks: z
    .array(GuideBlockSchema)
    .min(7)
    .max(28)
    .describe("Study blocks across 7 days"),
  dailySummaries: z
    .array(
      z.object({
        dayIndex: z.number().int().min(1).max(7),
        focus: z.string().describe("Main focus for this day"),
        totalMinutes: z.number().int(),
      }),
    )
    .length(7)
    .describe("One summary per day"),
})

export type LearningGuide = z.infer<typeof LearningGuideSchema>

// ── Artifact Schemas ──

export const QuizArtifactSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z
    .array(
      z.object({
        id: z.string(),
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z
          .string()
          .describe("Why the correct answer is correct"),
      }),
    )
    .min(3)
    .max(15),
})

export type QuizArtifactData = z.infer<typeof QuizArtifactSchema>

export const FlashcardArtifactSchema = z.object({
  title: z.string(),
  description: z.string(),
  cards: z
    .array(
      z.object({
        id: z.string(),
        front: z.string().describe("Question or prompt"),
        back: z.string().describe("Answer or explanation"),
      }),
    )
    .min(3)
    .max(20),
})

export type FlashcardArtifactData = z.infer<typeof FlashcardArtifactSchema>

export const MindMapArtifactSchema = z.object({
  title: z.string(),
  description: z.string(),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        parentId: z.string().nullable().describe("Root node has no parentId, use null"),
      }),
    )
    .min(5)
    .max(30),
})

export type MindMapArtifactData = z.infer<typeof MindMapArtifactSchema>

export const SlideArtifactSchema = z.object({
  title: z.string(),
  description: z.string(),
  slides: z
    .array(
      z.object({
        title: z.string(),
        bullets: z
          .array(z.string())
          .min(2)
          .max(6)
          .describe("Key points for this slide"),
      }),
    )
    .min(3)
    .max(12),
})

export type SlideArtifactData = z.infer<typeof SlideArtifactSchema>

export const SpatialArtifactSchema = z.object({
  title: z.string(),
  description: z.string(),
  objects: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        shape: z.enum([
          "sphere",
          "box",
          "torus",
          "cone",
          "cylinder",
          "dodecahedron",
          "octahedron",
          "icosahedron",
        ]),
        x: z.number().describe("X position coordinate"),
        y: z.number().describe("Y position coordinate"),
        z: z.number().describe("Z position coordinate"),
        color: z.string().describe("Hex color code"),
        scale: z.number().nullable().describe("Scale factor, null for default"),
        rotate: z.boolean().nullable().describe("Whether to rotate, null for default"),
      }),
    )
    .min(2)
    .max(20),
  connections: z
    .array(
      z.object({
        from: z.string().describe("Source object id"),
        to: z.string().describe("Target object id"),
        color: z.string().nullable().describe("Hex color or null for default"),
      }),
    )
    .nullable()
    .describe("Connections between objects, or null if none"),
  autoRotate: z.boolean().nullable().describe("Auto-rotate the scene, null for default"),
})

export type SpatialArtifactData = z.infer<typeof SpatialArtifactSchema>
