import { generateText, Output } from "ai"
import { openai } from "./provider"
import {
  QuizArtifactSchema,
  FlashcardArtifactSchema,
  MindMapArtifactSchema,
  SlideArtifactSchema,
  SpatialArtifactSchema,
} from "./schemas"
import type {
  QuizArtifactData,
  FlashcardArtifactData,
  MindMapArtifactData,
  SlideArtifactData,
  SpatialArtifactData,
} from "./schemas"

type ArtifactInput = {
  subject: string
  concepts: string[]
  priorKnowledgeLevel: string
  goalType: string
}

export async function generateQuiz(
  input: ArtifactInput,
): Promise<QuizArtifactData> {
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: QuizArtifactSchema }),
    prompt: `You are an expert educator creating a practice quiz.

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}
**Goal:** ${input.goalType}

Create a quiz with 5-8 questions that:
- Cover the listed concepts proportionally
- Include a mix of recall, application, and analysis questions (Bloom's taxonomy levels 1-4)
- Have exactly 4 options per question with one clearly correct answer
- Include detailed explanations that teach, not just confirm
- Progress from easier to harder questions
- Use domain-accurate terminology and correct facts
- Each question id should be "q1", "q2", etc.`,
  })
  if (!result.output) {
    throw new Error("Failed to generate quiz")
  }
  return result.output
}

export async function generateFlashcards(
  input: ArtifactInput,
): Promise<FlashcardArtifactData> {
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: FlashcardArtifactSchema }),
    prompt: `You are an expert educator creating flashcards for active recall practice.

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}
**Goal:** ${input.goalType}

Create 8-12 flashcards that:
- Cover all listed concepts (at least 1 card per concept)
- Front: a clear question, definition prompt, or "what/why/how" prompt
- Back: a concise, accurate answer (1-3 sentences)
- Include both factual recall and conceptual understanding cards
- Use precise domain terminology
- Each card id should be "c1", "c2", etc.`,
  })
  if (!result.output) {
    throw new Error("Failed to generate flashcards")
  }
  return result.output
}

export async function generateMindMap(
  input: ArtifactInput,
): Promise<MindMapArtifactData> {
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: MindMapArtifactSchema }),
    prompt: `You are an expert educator creating a concept mind map.

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}

Create a hierarchical mind map that:
- Has ONE root node (the subject) with no parentId
- Every other node has a parentId connecting it to its parent
- Covers all listed concepts as top-level branches
- Adds 2-3 sub-concepts per major concept
- Uses clear, concise labels (1-4 words each)
- Has 10-20 total nodes
- Node ids should be "n1", "n2", etc.
- Forms a proper tree structure (no cycles, one root)`,
  })
  if (!result.output) {
    throw new Error("Failed to generate mind map")
  }
  return result.output
}

export async function generateSlides(
  input: ArtifactInput,
): Promise<SlideArtifactData> {
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: SlideArtifactSchema }),
    prompt: `You are an expert educator creating a review slide deck.

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}
**Goal:** ${input.goalType}

Create a slide deck with 4-8 slides that:
- Opens with an overview/objectives slide
- Dedicates 1-2 slides per major concept
- Closes with a summary/key takeaways slide
- Each slide has 3-5 concise bullet points
- Uses clear, educational language appropriate for the student level
- Progresses logically from foundational to advanced material`,
  })
  if (!result.output) {
    throw new Error("Failed to generate slides")
  }
  return result.output
}

export async function generateSpatial(
  input: ArtifactInput,
): Promise<SpatialArtifactData> {
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: SpatialArtifactSchema }),
    prompt: `You are an expert educator creating a 3D spatial visualization.

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}

Create a 3D spatial model that:
- Visualizes a key concept from the subject as physical objects in 3D space
- Uses 4-10 objects with meaningful shapes and colors
- Positions objects logically in 3D space (x, y, z fields, each between -5 and 5)
- Includes connections between related objects where appropriate
- Uses hex color codes (e.g., "#ef4444")
- Each object id should be "obj1", "obj2", etc.
- Assigns appropriate shapes: sphere for atoms/nodes, box for containers, cylinder for bonds/axes, torus for orbits/cycles
- Sets autoRotate to true for better visualization
- Scale values between 0.2 and 2.0`,
  })
  if (!result.output) {
    throw new Error("Failed to generate spatial model")
  }
  return result.output
}

export type { ArtifactInput }
