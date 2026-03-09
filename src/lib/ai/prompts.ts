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

  audioScriptGeneration: (input: ArtifactPromptInput): string =>
    `You are an expert educator narrating a structured audio lesson. Write a natural, spoken-word script that will be read aloud by a text-to-speech voice.

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.length > 0 ? input.concepts.join(", ") : "key concepts from the source material"}
**Student Level:** ${input.priorKnowledgeLevel}
**Goal:** ${input.goalType}

Write a script in three sections, totaling 550-700 words (about 4 minutes when spoken at a natural pace):

SECTION 1 — Introduction (~80 words):
Start with "Welcome to this lesson on [subject]." Briefly explain what the student will learn and why it matters.

SECTION 2 — Core Concepts (~450 words):
Cover 3-4 key concepts. For each one: introduce it by name, explain it clearly in plain language, give a concrete example or analogy, and connect it to the broader topic.

SECTION 3 — Summary (~80 words):
Recap the key takeaways. End with an encouraging closing line like "You now have a solid foundation in [topic]. Keep practicing, and it will become second nature."

RULES:
- Write in a warm, conversational teacher voice (not bullet points, not formal prose)
- No markdown, no headers, no asterisks — pure spoken text only
- Avoid jargon without explanation
- Keep sentences short and clear for listening (not reading)
- Output ONLY the script text, nothing else${input.sourceContent ? `\n\n## Reference Material\nUse this as your primary source for facts and examples:\n${input.sourceContent}` : ""}`,

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
  manimGeneration: (input: ArtifactPromptInput): string =>
    `You are an expert Manim (Community Edition) developer and educator.
Generate a short, visually clear Manim animation that teaches a key concept from the subject.

**Subject:** ${input.subject}
**Concepts to cover:** ${input.concepts.length > 0 ? input.concepts.slice(0, 3).join(", ") : "core concepts"}
**Student Level:** ${input.priorKnowledgeLevel}

## CRITICAL RULES — follow these exactly or the render will fail
1. Import ONLY from \`manim\` — no numpy, no matplotlib, no external libraries
2. Class must extend \`Scene\` and be named \`EducationScene\` exactly
3. **NEVER use \`MathTex\` or \`Tex\`** — they require LaTeX which is not available. Use ONLY \`Text()\` for all text and equations written in plain Unicode (e.g. "f(x) = x²", "E = mc²", "∑", "∫")
4. Use only these Manim primitives: \`Text\`, \`Circle\`, \`Square\`, \`Rectangle\`, \`Arrow\`, \`Line\`, \`Dot\`, \`NumberLine\`, \`Axes\`, \`VGroup\`, \`always_redraw\`
5. Animation must run 8–20 seconds total — keep it short and focused
6. Use \`self.play()\` and \`self.wait()\` — no interactive or input elements
7. Allowed animations: \`Write\`, \`FadeIn\`, \`FadeOut\`, \`Transform\`, \`Create\`, \`GrowFromCenter\`, \`MoveToTarget\`, \`animate\`
8. Do NOT set background_color — use the default dark background
9. All text strings must be plain ASCII or simple Unicode — no LaTeX markup (no backslashes, no $...$)

## Good example (follow this style)
\`\`\`python
from manim import *

class EducationScene(Scene):
    def construct(self):
        title = Text("Newton's First Law", font_size=40)
        self.play(Write(title))
        self.wait(1)
        self.play(title.animate.to_edge(UP))

        obj = Circle(radius=0.4, color=BLUE, fill_opacity=0.8)
        label = Text("Object at rest", font_size=28).next_to(obj, DOWN)
        self.play(FadeIn(obj), FadeIn(label))
        self.wait(2)

        arrow = Arrow(LEFT * 2, RIGHT * 2, color=YELLOW)
        force_label = Text("Apply force", font_size=24).next_to(arrow, UP)
        self.play(Create(arrow), Write(force_label))
        self.play(obj.animate.shift(RIGHT * 3), run_time=2)
        self.wait(1)
\`\`\`

## Output format
Return a JSON object with:
- \`title\`: short animation title (5-8 words)
- \`description\`: one sentence explaining what the animation shows
- \`sceneName\`: must be exactly "EducationScene"
- \`code\`: the complete runnable Python file (include all imports)${sourceContentBlock(input.sourceContent)}`,

  remixGeneration: (
    input: ArtifactPromptInput & { profileContext?: string },
  ): string =>
    `You are an expert educator who remixes source material into a new, synthesized learning artifact.

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.length > 0 ? input.concepts.join(", ") : "key concepts from the source material"}
**Student Level:** ${input.priorKnowledgeLevel}
**Goal:** ${input.goalType}

## Your Task
Take the provided source material and REMIX it into a structured learning document that:
1. Breaks the material into clear, digestible sections with descriptive headings
2. Synthesizes and restructures — do NOT simply copy-paste or summarize linearly
3. Extracts key insights and explains how each connects to the learner's goals or prior knowledge
4. Suggests concrete next steps (practice activities, follow-up artifacts)
5. Adapts language complexity to the student level

## Section Rules
- 2-8 sections, each with a clear heading, synthesized content, and a sourceInsight noting which part of the source it draws from
- Content should teach, not just summarize — add context, analogies, and connections
- Each section should be 2-4 sentences of dense, educational content

## Key Insights Rules
- 2-6 insights extracted from the source
- Each insight has an id ("ki-1", "ki-2", etc.), the insight itself, and a connection explaining relevance
- Insights should be non-obvious — not just restating headings

## Next Steps Rules
- 1-4 actionable suggestions for what to do after reading this remix
- Reference specific artifact types the learner could create next (quiz, flashcards, etc.)${sourceContentBlock(input.sourceContent)}${input.profileContext ?? ""}`,
} as const;
