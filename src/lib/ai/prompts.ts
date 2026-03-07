/**
 * Centralized prompt templates for all AI generation tools.
 *
 * Externalizing prompts from tool execute functions makes them:
 * - Importable by eval tests
 * - Modifiable without touching tool logic
 * - Versionable and diffable
 */

export type { ProfileAssessmentInput } from "./profile-tools";
// Re-export existing prompt builders
export { buildProfileAnalysisPrompt } from "./profile-tools";

export type GuidePromptInput = {
  fieldOfStudy: string;
  primaryGoal: string;
  goalDescription: string;
  deadline: string;
  minutesPerDay: number;
  daysPerWeek: number;
  sessionLength: string;
  priorKnowledgeLevel: string;
  studyStrategies: string[];
  concepts: string[];
  sourceContent?: string;
  profileSummary?: string;
  strengths?: string[];
  risks?: Array<{ area: string; severity: string; mitigation: string }>;
  cognitiveLoadRisk?: string;
  calibrationAccuracy?: string;
  metacognitiveAwareness?: string;
  coachingTone?: string;
  motivationalFocus?: string;
};

export type ArtifactPromptInput = {
  subject: string;
  concepts: string[];
  priorKnowledgeLevel: string;
  goalType: string;
  calibrationAccuracy?: string;
  cognitiveLoadRisk?: string;
  metacognitiveAwareness?: string;
  coachingTone?: string;
  sourceContent?: string;
};

function sourceContentBlock(sourceContent?: string): string {
  if (!sourceContent) return "";
  return `\n\n## Reference Material\nUse this material as the primary content source for concepts and examples:\n${sourceContent}`;
}

export const prompts = {
  quizGeneration: (input: ArtifactPromptInput): string =>
    `You are an expert educator creating a practice quiz.

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
- Each question id should be "q1", "q2", etc.${sourceContentBlock(input.sourceContent)}`,

  flashcardGeneration: (input: ArtifactPromptInput): string =>
    `You are an expert educator creating flashcards for active recall practice.

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
- Each card id should be "c1", "c2", etc.${sourceContentBlock(input.sourceContent)}`,

  mindmapGeneration: (input: ArtifactPromptInput): string =>
    `You are an expert educator creating a concept mind map.

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
- Forms a proper tree structure (no cycles, one root)${sourceContentBlock(input.sourceContent)}`,

  slideGeneration: (input: ArtifactPromptInput): string =>
    `You are an expert educator creating a review slide deck.

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
- Progresses logically from foundational to advanced material${sourceContentBlock(input.sourceContent)}`,

  spatialGeneration: (input: ArtifactPromptInput): string =>
    `You are an expert educator creating a 3D spatial visualization.

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
- Scale values between 0.2 and 2.0${sourceContentBlock(input.sourceContent)}`,
} as const;
