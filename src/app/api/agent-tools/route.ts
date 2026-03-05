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
import { TOPICS } from "@/lib/topics"

// State management tools that return state-update instructions for the client
const stateHandlers: Record<string, (input: Record<string, unknown>) => { __stateUpdate: boolean; [key: string]: unknown }> = {
  navigate_to_view: (input) => {
    const view = input.view as string
    return { __stateUpdate: true, type: "navigate_to_view", view }
  },
  select_topic: (input) => {
    const topicIdentifier = input.topicIdentifier as string
    const topic = TOPICS.find(
      (t) => t.id === topicIdentifier || t.name.toLowerCase() === topicIdentifier.toLowerCase()
    )
    if (!topic) {
      return { __stateUpdate: false, error: `Topic "${topicIdentifier}" not found.` }
    }
    return { __stateUpdate: true, type: "select_topic", topicId: topic.id, topicName: topic.name, projectId: topic.projects[0]?.id ?? null }
  },
  select_project: (input) => {
    const projectIdentifier = input.projectIdentifier as string
    for (const topic of TOPICS) {
      const project = topic.projects.find(
        (p) => p.id === projectIdentifier || p.name.toLowerCase() === projectIdentifier.toLowerCase()
      )
      if (project) {
        return { __stateUpdate: true, type: "select_project", topicId: topic.id, projectId: project.id }
      }
    }
    return { __stateUpdate: false, error: `Project "${projectIdentifier}" not found.` }
  },
  show_guide: (input) => {
    return { __stateUpdate: true, type: "show_guide", view: "guide", highlightBlockId: (input.highlightBlockId as string) ?? null }
  },
  show_progress: () => {
    return { __stateUpdate: true, type: "show_progress", view: "progress" }
  },
  show_sources: () => {
    return { __stateUpdate: true, type: "show_sources", view: "sources" }
  },
  complete_guide_block: (input) => {
    return { __stateUpdate: true, type: "complete_guide_block", blockId: input.blockId as string }
  },
  open_artifact: (input) => {
    return { __stateUpdate: true, type: "open_artifact", artifact: input.artifactType as string }
  },
  get_current_state: () => {
    const topicSummaries = TOPICS.map((t) => ({
      id: t.id, name: t.name, domain: t.domain,
      projects: t.projects.map((p) => ({ id: p.id, name: p.name, mastery: p.mastery })),
    }))
    return { __stateUpdate: false, topics: topicSummaries }
  },
}

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

  // Check state tools first
  if (tool in stateHandlers) {
    const result = stateHandlers[tool](input)
    return NextResponse.json(result)
  }

  if (!(tool in artifactGenerators)) {
    return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 })
  }

  const generator = artifactGenerators[tool as ToolName]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (generator as (input: Record<string, unknown>) => Promise<{ type: string; data: unknown }>)(input)
  return NextResponse.json(result)
}
