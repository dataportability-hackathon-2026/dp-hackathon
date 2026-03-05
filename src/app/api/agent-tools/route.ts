import { NextResponse } from "next/server"
import {
  generateQuiz,
  generateFlashcards,
  generateMindMap,
  generateSlides,
  generateSpatial,
} from "@/lib/ai/generate-artifact"
import { generateLearningGuide } from "@/lib/ai/generate-guide"
import type { GuideInput } from "@/lib/ai/generate-guide"

const artifactGenerators = {
  create_quiz: async (input: { subject: string; concepts: string[]; priorKnowledgeLevel: string; goalType: string }) => {
    const data = await generateQuiz(input)
    return { type: "quiz", data }
  },
  create_flashcards: async (input: { subject: string; concepts: string[]; priorKnowledgeLevel: string; goalType: string }) => {
    const data = await generateFlashcards(input)
    return { type: "flashcards", data }
  },
  create_mind_map: async (input: { subject: string; concepts: string[]; priorKnowledgeLevel: string; goalType: string }) => {
    const data = await generateMindMap(input)
    return { type: "mindmap", data }
  },
  create_slides: async (input: { subject: string; concepts: string[]; priorKnowledgeLevel: string; goalType: string }) => {
    const data = await generateSlides(input)
    return { type: "slidedeck", data }
  },
  create_spatial: async (input: { subject: string; concepts: string[]; priorKnowledgeLevel: string; goalType: string }) => {
    const data = await generateSpatial(input)
    return { type: "spatial", data }
  },
  create_learning_guide: async (input: {
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
    const data = await generateLearningGuide(guideInput)
    return { type: "guide", data }
  },
} as const

type ToolName = keyof typeof artifactGenerators

export async function POST(req: Request) {
  const body = await req.json()
  const { tool, input } = body as { tool: string; input: Record<string, unknown> }

  if (!(tool in artifactGenerators)) {
    return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 })
  }

  const generator = artifactGenerators[tool as ToolName]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (generator as (input: Record<string, unknown>) => Promise<{ type: string; data: unknown }>)(input)
  return NextResponse.json(result)
}
