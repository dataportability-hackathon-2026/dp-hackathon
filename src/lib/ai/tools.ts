import { tool } from "ai"
import { z } from "zod"
import {
  generateQuiz,
  generateFlashcards,
  generateMindMap,
  generateSlides,
  generateSpatial,
} from "./generate-artifact"
import { generateLearningGuide } from "./generate-guide"
import type { ArtifactInput } from "./generate-artifact"
import type { GuideInput } from "./generate-guide"

const artifactInputSchema = z.object({
  subject: z.string().describe("The subject or topic area"),
  concepts: z.array(z.string()).describe("Key concepts to cover"),
  priorKnowledgeLevel: z
    .enum(["beginner", "intermediate", "advanced"])
    .describe("The learner's current knowledge level"),
  goalType: z
    .string()
    .describe("The learner's goal, e.g. 'exam prep', 'deep understanding'"),
})

export const tools = {
  create_quiz: tool({
    description:
      "Create a multiple-choice quiz to test the learner's understanding of specific concepts. Use when the learner asks to be quizzed, wants to test their knowledge, or needs practice questions.",
    inputSchema: artifactInputSchema,
    execute: async (input: ArtifactInput) => {
      const result = await generateQuiz(input)
      return { type: "quiz" as const, data: result }
    },
  }),

  create_flashcards: tool({
    description:
      "Create flashcards for active recall practice. Use when the learner wants to memorize key terms, review definitions, or practice recall of concepts.",
    inputSchema: artifactInputSchema,
    execute: async (input: ArtifactInput) => {
      const result = await generateFlashcards(input)
      return { type: "flashcards" as const, data: result }
    },
  }),

  create_mind_map: tool({
    description:
      "Create a hierarchical mind map showing relationships between concepts. Use when the learner wants to visualize how concepts connect, see the big picture, or organize their understanding.",
    inputSchema: artifactInputSchema,
    execute: async (input: ArtifactInput) => {
      const result = await generateMindMap(input)
      return { type: "mindmap" as const, data: result }
    },
  }),

  create_slides: tool({
    description:
      "Create a slide deck summarizing key concepts. Use when the learner wants a review presentation, lecture summary, or structured overview of material.",
    inputSchema: artifactInputSchema,
    execute: async (input: ArtifactInput) => {
      const result = await generateSlides(input)
      return { type: "slidedeck" as const, data: result }
    },
  }),

  create_spatial: tool({
    description:
      "Create a 3D spatial visualization of concepts. Use when the learner wants to see concepts represented as physical objects in space, or when spatial reasoning aids understanding (e.g. molecular structures, system architectures).",
    inputSchema: artifactInputSchema,
    execute: async (input: ArtifactInput) => {
      const result = await generateSpatial(input)
      return { type: "spatial" as const, data: result }
    },
  }),

  create_learning_guide: tool({
    description:
      "Create a structured 7-day learning guide with study blocks. Use when the learner wants a study plan, weekly schedule, or structured learning path.",
    inputSchema: z.object({
      fieldOfStudy: z.string().describe("The subject area"),
      primaryGoal: z.string().describe("Main learning goal"),
      goalDescription: z
        .string()
        .describe("Detailed description of the goal"),
      deadline: z.string().describe("Target completion date"),
      minutesPerDay: z
        .number()
        .describe("Available study minutes per day"),
      daysPerWeek: z
        .number()
        .describe("Days per week available to study"),
      sessionLength: z
        .enum(["short", "medium", "long"])
        .describe("Preferred session length"),
      priorKnowledgeLevel: z
        .enum(["beginner", "intermediate", "advanced"])
        .describe("Current knowledge level"),
      studyStrategies: z
        .array(z.string())
        .describe("Preferred study strategies"),
      concepts: z
        .array(z.string())
        .describe("Concepts to cover in the guide"),
    }),
    execute: async (input: {
      fieldOfStudy: string
      primaryGoal: string
      goalDescription: string
      deadline: string
      minutesPerDay: number
      daysPerWeek: number
      sessionLength: "short" | "medium" | "long"
      priorKnowledgeLevel: "beginner" | "intermediate" | "advanced"
      studyStrategies: string[]
      concepts: string[]
    }) => {
      const guideInput: GuideInput = {
        ...input,
        profileAnalysis: {
          summary: "Learner seeking a structured study plan.",
          strengths: ["Motivated", "Goal-oriented"],
          risks: [
            {
              area: "Time management",
              severity: "medium",
              description: "May need help pacing",
              mitigation: "Built-in breaks and checkpoints",
            },
          ],
          recommendedStrategies: [
            {
              strategy: "Active recall",
              rationale: "Evidence-based retention",
              priority: "primary",
            },
            {
              strategy: "Spaced repetition",
              rationale: "Long-term memory formation",
              priority: "secondary",
            },
          ],
          cognitiveProfile: {
            reflectivenessLevel: "medium",
            metacognitiveAwareness: "medium",
            calibrationAccuracy: "well-calibrated",
          },
          coachingApproach: {
            tone: "Encouraging and structured",
            feedbackFrequency: "daily",
            motivationalFocus: "competence",
          },
        },
      }
      const result = await generateLearningGuide(guideInput)
      return { type: "guide" as const, data: result }
    },
  }),
}
