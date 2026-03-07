import { generateText, Output, tool } from "ai";
import { z } from "zod";
import { loadSourceContent } from "@/lib/sources/load-sources";
import { getCitationBlock, getCitationGuardrails } from "./citations";
import { openai } from "./provider";
import {
  FlashcardArtifactSchema,
  MindMapArtifactSchema,
  QuizArtifactSchema,
  SlideArtifactSchema,
  SpatialArtifactSchema,
} from "./schemas";

// ── Artifact-specific schemas ──

const WorkedExampleSchema = z.object({
  title: z.string(),
  description: z.string(),
  steps: z
    .array(
      z.object({
        stepNumber: z.number().int(),
        instruction: z.string().describe("What the learner should do"),
        explanation: z
          .string()
          .describe("Why this step works — builds schema [SWELLER_1988]"),
        commonMistake: z
          .string()
          .nullable()
          .describe("Common error at this step, if any"),
      }),
    )
    .min(3)
    .max(10),
  fadeLevel: z
    .enum(["full", "partial", "minimal"])
    .describe(
      "How much scaffolding: full = all steps shown, partial = some blanks, minimal = problem only",
    ),
  selfExplanationPrompts: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("Prompts for self-explanation after the example [DUNLOSKY_2013]"),
});

const ElaborativeInterrogationSchema = z.object({
  title: z.string(),
  description: z.string(),
  items: z
    .array(
      z.object({
        id: z.string(),
        fact: z.string().describe("The factual statement to interrogate"),
        whyQuestion: z
          .string()
          .describe("The 'why does this make sense?' question"),
        sampleExplanation: z
          .string()
          .describe("A model explanation connecting to prior knowledge"),
        relatedConcepts: z
          .array(z.string())
          .min(1)
          .describe("Concepts this connects to"),
      }),
    )
    .min(3)
    .max(10),
});

const PredictionReflectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  items: z
    .array(
      z.object({
        id: z.string(),
        predictionPrompt: z
          .string()
          .describe("Ask the learner to predict before attempting"),
        problem: z.string().describe("The actual problem or question"),
        solution: z.string().describe("The correct solution"),
        reflectionPrompt: z
          .string()
          .describe("Prompt to compare prediction with outcome [SCHRAW_1994]"),
        repairHint: z
          .string()
          .nullable()
          .describe("If prediction was wrong, what misconception to address"),
      }),
    )
    .min(3)
    .max(8),
});

const InterleavedProblemSetSchema = z.object({
  title: z.string(),
  description: z.string(),
  problems: z
    .array(
      z.object({
        id: z.string(),
        concept: z.string().describe("Which concept this tests"),
        problemType: z
          .string()
          .describe("The type of problem (for discrimination practice)"),
        problem: z.string(),
        solution: z.string(),
        discriminationNote: z
          .string()
          .describe(
            "How this problem type differs from others — builds discrimination skill [ROHRER_TAYLOR_2007]",
          ),
      }),
    )
    .min(4)
    .max(12),
  conceptOrder: z
    .array(z.string())
    .describe(
      "The interleaved order of concepts (should NOT be blocked by type)",
    ),
});

// ── Profile-aware input schema shared by all artifact tools ──

const profileAwareInputSchema = z.object({
  subject: z.string().describe("The subject or topic area"),
  concepts: z.array(z.string()).min(1).describe("Key concepts to cover"),
  priorKnowledgeLevel: z
    .enum(["beginner", "intermediate", "advanced"])
    .describe("Learner's current knowledge level"),
  goalType: z
    .string()
    .describe("The learner's goal (exam prep, deep understanding, etc.)"),
  calibrationAccuracy: z
    .enum(["under-confident", "well-calibrated", "over-confident"])
    .describe("Learner's calibration status from profile"),
  cognitiveLoadRisk: z
    .enum(["low", "medium", "high"])
    .describe("Cognitive load risk from profile"),
  metacognitiveAwareness: z
    .enum(["low", "medium", "high"])
    .describe("Metacognitive awareness level"),
  coachingTone: z
    .enum(["direct", "encouraging", "socratic", "collaborative"])
    .describe("Preferred coaching tone"),
  sourceIds: z
    .array(z.string())
    .optional()
    .describe("IDs of uploaded source materials to use as reference content"),
  userId: z.string().optional().describe("User ID for source content access"),
});

type ProfileAwareInput = z.infer<typeof profileAwareInputSchema>;

async function resolveSourceContent(input: ProfileAwareInput): Promise<string> {
  if (!input.sourceIds?.length || !input.userId) return "";
  const content = await loadSourceContent(input.sourceIds, input.userId);
  if (!content) return "";
  return `\n\n## Reference Material\nUse this material as the primary content source for questions, examples, and concepts:\n${content}`;
}

// ── Tools ──

export const artifactTools = {
  create_adaptive_quiz: tool({
    description:
      "Create a quiz adapted to the learner's profile. Uses retrieval practice [ROEDIGER_KARPICKE_2006] as the primary learning mechanism — testing is a learning event, not just assessment. Questions span Bloom's taxonomy levels appropriate to knowledge level. Includes confidence predictions for calibration training [SCHRAW_1994]. Adjusts difficulty based on cognitive load risk [SWELLER_1988].",
    inputSchema: profileAwareInputSchema,
    execute: async (input: ProfileAwareInput) => {
      const sourceBlock = await resolveSourceContent(input);
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: QuizArtifactSchema }),
        prompt: `You are an expert educator creating an adaptive practice quiz.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["ROEDIGER_KARPICKE_2006", "DUNLOSKY_2013", "SWELLER_1988", "BJORK_2011", "SCHRAW_1994"])}

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}
**Goal:** ${input.goalType}
**Calibration:** ${input.calibrationAccuracy}
**Cognitive Load Risk:** ${input.cognitiveLoadRisk}
**Metacognitive Awareness:** ${input.metacognitiveAwareness}

## Quiz Design Rules (Evidence-Based)

### Retrieval Practice [ROEDIGER_KARPICKE_2006]
- This quiz IS the learning activity, not just assessment.
- Questions should require genuine recall, not recognition of surface features.
- Explanations should teach — each wrong answer gets a "why it's wrong" note.

### Bloom's Taxonomy Levels (adapted to learner)
- ${input.priorKnowledgeLevel === "beginner" ? "Focus on Remember (40%) and Understand (40%), with some Apply (20%)." : input.priorKnowledgeLevel === "intermediate" ? "Mix: Understand (20%), Apply (40%), Analyze (30%), Evaluate (10%)." : "Focus on Analyze (30%), Evaluate (30%), Create/Apply (40%)."}

### Cognitive Load [SWELLER_1988]
- ${input.cognitiveLoadRisk === "high" ? "5 questions max. Simpler stem phrasing. One concept per question. No compound questions." : input.cognitiveLoadRisk === "medium" ? "5-8 questions. Standard complexity. May combine related concepts." : "8-10 questions. Include challenging multi-step problems. Desirable difficulties [BJORK_2011]."}

### Calibration Training [SCHRAW_1994]
- ${input.calibrationAccuracy === "over-confident" ? "Include 'intuitive trap' questions where the obvious answer is wrong (CRT-style). This exposes miscalibration." : input.calibrationAccuracy === "under-confident" ? "Include questions the learner is likely to get right to build calibration accuracy." : "Standard difficulty distribution."}

### Desirable Difficulties [BJORK_2011]
- Vary question format (not all identical stems).
- Include at least one question requiring transfer to a slightly novel context.

## Output Rules
- Each question id: "q1", "q2", etc.
- Exactly 4 options per question.
- Explanations must be educational, not just "A is correct because A."
- Progress from easier to harder.
- Cover all listed concepts proportionally.${sourceBlock}`,
      });
      if (!result.output) {
        throw new Error("Failed to generate quiz");
      }
      return { type: "quiz" as const, data: result.output };
    },
  }),

  create_adaptive_flashcards: tool({
    description:
      "Create flashcards optimized for active recall and spaced repetition [ROEDIGER_KARPICKE_2006, CEPEDA_2006]. Cards use elaborative interrogation prompts [DUNLOSKY_2013] — not just 'define X' but 'why does X work this way?' Adapted to learner's knowledge level and calibration needs.",
    inputSchema: profileAwareInputSchema,
    execute: async (input: ProfileAwareInput) => {
      const sourceBlock = await resolveSourceContent(input);
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: FlashcardArtifactSchema }),
        prompt: `You are an expert educator creating flashcards for evidence-based learning.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["ROEDIGER_KARPICKE_2006", "CEPEDA_2006", "DUNLOSKY_2013", "BJORK_2011"])}

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}
**Goal:** ${input.goalType}
**Cognitive Load Risk:** ${input.cognitiveLoadRisk}

## Flashcard Design Rules

### Active Recall [ROEDIGER_KARPICKE_2006]
- Front side should require genuine retrieval, not recognition.
- Avoid "What is the definition of X?" for every card — mix question types.
- Include: "Why does X happen?", "How does X relate to Y?", "What would change if Z?"

### Elaborative Interrogation [DUNLOSKY_2013]
- At least 30% of cards should use "Why?" prompts that connect to prior knowledge.
- Example: Front: "Why do eigenvalues indicate system stability?" Back: "Because..."

### Cognitive Load Adaptation [SWELLER_1988]
- ${input.cognitiveLoadRisk === "high" ? "8 cards max. One concept per card. Simple, focused prompts." : input.cognitiveLoadRisk === "medium" ? "8-12 cards. May connect related concepts." : "10-15 cards. Include challenging synthesis cards."}

### Spacing Cues [CEPEDA_2006]
- Include in the description: "Review these cards using expanding intervals: 1 day, 3 days, 7 days, 14 days."

## Output Rules
- Each card id: "c1", "c2", etc.
- At least 1 card per concept.
- Back answers: 1-3 sentences, precise and accurate.
- Mix: factual recall (40%), conceptual understanding (40%), application (20%).
- NEVER include cards that can be answered by pattern matching without understanding.${sourceBlock}`,
      });
      if (!result.output) {
        throw new Error("Failed to generate flashcards");
      }
      return { type: "flashcards" as const, data: result.output };
    },
  }),

  create_worked_example: tool({
    description:
      "Create a worked example with fading scaffolding. Worked examples reduce cognitive load for novices [SWELLER_1988] but become redundant as expertise grows (expertise reversal effect). Includes self-explanation prompts [DUNLOSKY_2013] and common-mistake annotations. Fade level adapts to knowledge level.",
    inputSchema: profileAwareInputSchema.extend({
      problemContext: z
        .string()
        .describe("The specific problem or scenario to demonstrate"),
    }),
    execute: async (input: ProfileAwareInput & { problemContext: string }) => {
      const sourceBlock = await resolveSourceContent(input);
      const fadeLevel: "full" | "partial" | "minimal" =
        input.priorKnowledgeLevel === "beginner"
          ? "full"
          : input.priorKnowledgeLevel === "intermediate"
            ? "partial"
            : "minimal";

      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: WorkedExampleSchema }),
        prompt: `You are an expert educator creating a worked example with fading scaffolding.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["SWELLER_1988", "DUNLOSKY_2013", "BJORK_2011"])}

**Subject:** ${input.subject}
**Problem:** ${input.problemContext}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}
**Fade Level:** ${fadeLevel}

## Worked Example Design [SWELLER_1988]

### Purpose
- Reduce extraneous cognitive load by showing HOW to solve, not just WHAT to solve.
- Build problem-solving schemas that transfer to new problems.
- The goal is to fade scaffolding until the learner can solve independently.

### Fade Levels
- **full**: All steps shown with complete explanations. For beginners.
- **partial**: Some steps have blanks ("What would you do next?"). For intermediates.
- **minimal**: Only the problem and final answer shown, with hints available. For advanced learners approaching independence.

### Self-Explanation Prompts [DUNLOSKY_2013]
- After the example, include 1-3 prompts asking "Why did step X work?" or "How does this connect to [concept]?"
- Self-explanation is moderate-utility [DUNLOSKY_2013] and helps build deeper understanding.

### Common Mistakes
- Annotate steps where learners commonly err.
- This builds discrimination between correct and incorrect approaches [ROHRER_TAYLOR_2007].

### Expertise Reversal Effect [SWELLER_1988]
- If the learner is advanced, TOO MUCH scaffolding hurts — it adds extraneous load.
- Advanced learners should get minimal examples that challenge them with desirable difficulties [BJORK_2011].

## Constraints
- 3-10 steps per example.
- Each step must have an explanation building schema understanding.
- Set fadeLevel to "${fadeLevel}" based on knowledge level.
- Common mistakes should be specific and realistic, not generic.${sourceBlock}`,
      });
      if (!result.output) {
        throw new Error("Failed to generate worked example");
      }
      return { type: "worked_example" as const, data: result.output };
    },
  }),

  create_elaborative_interrogation: tool({
    description:
      "Create an elaborative interrogation exercise — 'Why does this make sense?' prompts that connect new facts to prior knowledge. Rated moderate-utility by Dunlosky et al. (2013). Particularly effective when learners have sufficient prior knowledge to generate explanations. Builds deeper encoding than simple review.",
    inputSchema: profileAwareInputSchema,
    execute: async (input: ProfileAwareInput) => {
      const sourceBlock = await resolveSourceContent(input);
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: ElaborativeInterrogationSchema }),
        prompt: `You are an expert educator creating an elaborative interrogation exercise.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["DUNLOSKY_2013", "ROEDIGER_KARPICKE_2006", "BJORK_2011"])}

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}
**Goal:** ${input.goalType}

## Elaborative Interrogation Design [DUNLOSKY_2013]

### What it is
- Present a factual statement, then ask "Why does this make sense?" or "Why is this true?"
- The learner generates an explanation connecting the fact to their prior knowledge.
- This produces deeper encoding than passive reading.

### When it works best
- ${input.priorKnowledgeLevel === "beginner" ? "Beginners may struggle — provide more scaffolded 'why' questions with hints. Focus on 'why' questions that connect to everyday experience." : input.priorKnowledgeLevel === "advanced" ? "Advanced learners benefit from 'why' questions that challenge assumptions or connect across sub-domains." : "Intermediate learners benefit most — they have enough prior knowledge to generate meaningful explanations."}

### Quality criteria
- Facts must be accurate and domain-relevant.
- 'Why' questions must be answerable with domain knowledge (not trivia).
- Sample explanations should model good reasoning, connecting to related concepts.
- Related concepts should form a web of understanding.

## Output Rules
- Each item id: "ei1", "ei2", etc.
- 3-10 items covering all listed concepts.
- Each item connects to at least 1 related concept.
- Tone: ${input.coachingTone}.${sourceBlock}`,
      });
      if (!result.output) {
        throw new Error("Failed to generate elaborative interrogation");
      }
      return {
        type: "elaborative_interrogation" as const,
        data: result.output,
      };
    },
  }),

  create_prediction_reflection: tool({
    description:
      "Create a prediction-reflection-repair exercise for calibration training. The learner predicts their confidence, attempts the problem, then reflects on the gap between prediction and outcome [SCHRAW_1994]. This is the core mechanism for improving metacognitive accuracy. Critical for over-confident learners.",
    inputSchema: profileAwareInputSchema,
    execute: async (input: ProfileAwareInput) => {
      const sourceBlock = await resolveSourceContent(input);
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: PredictionReflectionSchema }),
        prompt: `You are an expert educator creating a prediction-reflection-repair exercise.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["SCHRAW_1994", "BJORK_2011", "FREDERICK_2005", "DUNLOSKY_2013"])}

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}
**Calibration:** ${input.calibrationAccuracy}

## Prediction-Reflection-Repair Design [SCHRAW_1994]

### The Cycle
1. PREDICT: "Before attempting this, rate your confidence (0-100%) that you'll get it right."
2. ATTEMPT: Present the problem.
3. REFLECT: "Your prediction was X%. You ${input.calibrationAccuracy === "over-confident" ? "may find the gap between prediction and performance reveals blind spots" : "may discover you know more than you think"}."
4. REPAIR: If prediction was wrong, identify the specific misconception and provide a targeted fix.

### Calibration Training Purpose
- ${input.calibrationAccuracy === "over-confident" ? "This learner over-estimates their knowledge. Include problems that expose this gap — not to punish, but to build accurate self-assessment. Include 'intuitive trap' problems [FREDERICK_2005]." : input.calibrationAccuracy === "under-confident" ? "This learner under-estimates their knowledge. Include problems they're likely to solve correctly, then highlight the successful prediction-outcome alignment." : "This learner is well-calibrated. Maintain calibration with standard prediction exercises."}

### Problem Design
- Mix difficulty levels to test calibration across the confidence range.
- Include at least one problem where the intuitive answer is wrong (tests reflectiveness).
- Repair hints should target specific misconceptions, not repeat the solution.

## Output Rules
- Each item id: "pr1", "pr2", etc.
- 3-8 items covering listed concepts.
- Prediction prompts should be natural, not formulaic.
- Reflection prompts should be specific to the problem, not generic.
- Repair hints: null if no common misconception applies.${sourceBlock}`,
      });
      if (!result.output) {
        throw new Error("Failed to generate prediction-reflection exercise");
      }
      return {
        type: "prediction_reflection" as const,
        data: result.output,
      };
    },
  }),

  create_interleaved_problem_set: tool({
    description:
      "Create an interleaved problem set mixing different problem types and concepts. Interleaving improves discrimination and transfer compared to blocked practice [ROHRER_TAYLOR_2007]. Problems are shuffled across concepts so learners must identify which strategy applies — the key skill blocked practice fails to develop.",
    inputSchema: profileAwareInputSchema,
    execute: async (input: ProfileAwareInput) => {
      if (input.concepts.length < 2) {
        return {
          type: "interleaved_problem_set" as const,
          data: null,
          error:
            "Interleaving requires at least 2 concepts. Use a focused quiz for single-concept practice.",
        };
      }

      const sourceBlock = await resolveSourceContent(input);
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: InterleavedProblemSetSchema }),
        prompt: `You are an expert educator creating an interleaved problem set.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["ROHRER_TAYLOR_2007", "BJORK_2011", "DUNLOSKY_2013"])}

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}
**Goal:** ${input.goalType}

## Interleaving Design [ROHRER_TAYLOR_2007]

### What it is
- Mix problems from different concepts/types within the same set.
- The learner must FIRST identify which concept/strategy applies, THEN solve.
- This builds discrimination — the ability to tell problem types apart.

### Why it works
- Blocked practice (all Type A, then all Type B) lets learners use the same strategy mindlessly.
- Interleaved practice forces learners to choose the right strategy, which is the harder (but more effective) skill [BJORK_2011].
- This feels harder and produces lower immediate performance, but dramatically improves transfer and long-term retention.

### Problem Design
- Create problems from each concept in the list.
- The conceptOrder array must be SHUFFLED — never all problems of one type together.
- Each problem must have a discriminationNote explaining how this problem type differs from others.
- ${input.priorKnowledgeLevel === "beginner" ? "Include concept labels as hints (partial interleaving)." : input.priorKnowledgeLevel === "advanced" ? "No labels — full interleaving. Problems should require careful discrimination." : "Minimal labels — learner should mostly identify the type themselves."}

## Output Rules
- Each problem id: "ip1", "ip2", etc.
- 4-12 problems total.
- At least 2 problems per concept.
- conceptOrder must be interleaved (not blocked).
- Solutions must be complete and correct.
- discriminationNote is required for every problem.${sourceBlock}`,
      });
      if (!result.output) {
        throw new Error("Failed to generate interleaved problem set");
      }
      return {
        type: "interleaved_problem_set" as const,
        data: result.output,
      };
    },
  }),

  create_mind_map: tool({
    description:
      "Create a concept mind map showing prerequisite and co-requisite relationships. Helps learners visualize the knowledge graph structure and identify gaps. Uses elaboration [DUNLOSKY_2013] — connecting concepts builds deeper understanding than isolated study.",
    inputSchema: profileAwareInputSchema,
    execute: async (input: ProfileAwareInput) => {
      const sourceBlock = await resolveSourceContent(input);
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: MindMapArtifactSchema }),
        prompt: `You are an expert educator creating a concept mind map.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["DUNLOSKY_2013", "BJORK_2011"])}

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}

## Mind Map Design
- ONE root node (the subject) with parentId = null.
- Listed concepts as top-level branches.
- 2-3 sub-concepts per major concept.
- ${input.priorKnowledgeLevel === "beginner" ? "10-15 nodes. Keep simple with clear hierarchy." : input.priorKnowledgeLevel === "advanced" ? "15-25 nodes. Show cross-connections and deeper structure." : "12-20 nodes. Balanced depth."}
- Labels: 1-4 words, precise domain terminology.
- Node ids: "n1", "n2", etc.
- Must form a proper tree (no cycles, one root).
- Show prerequisite relationships through hierarchy.${sourceBlock}`,
      });
      if (!result.output) {
        throw new Error("Failed to generate mind map");
      }
      return { type: "mindmap" as const, data: result.output };
    },
  }),

  create_slides: tool({
    description:
      "Create a review slide deck for structured overview. Best used for consolidation AFTER active learning, not as a primary learning tool [DUNLOSKY_2013]. Slides summarize and organize, but should always be paired with retrieval practice.",
    inputSchema: profileAwareInputSchema,
    execute: async (input: ProfileAwareInput) => {
      const sourceBlock = await resolveSourceContent(input);
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: SlideArtifactSchema }),
        prompt: `You are an expert educator creating a review slide deck.

${getCitationGuardrails()}

## Academic Basis
${getCitationBlock(["DUNLOSKY_2013", "SWELLER_1988"])}

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}
**Goal:** ${input.goalType}

## Important Note
Slides are for REVIEW and CONSOLIDATION, not primary learning [DUNLOSKY_2013].
Passive reading of slides is a low-utility strategy. These slides should:
- Organize and structure knowledge already acquired through practice.
- Include "test yourself" prompts on each slide (retrieval cues).
- ${input.cognitiveLoadRisk === "high" ? "Maximum 3 bullets per slide. Simple language. One concept per slide [SWELLER_1988]." : "3-5 bullets per slide. May connect related concepts."}

## Output Rules
- 4-8 slides.
- Opens with overview/objectives.
- 1-2 slides per major concept.
- Closes with summary + "next steps for practice."
- Concise, educational language for ${input.priorKnowledgeLevel} level.
- Logical progression from foundational to advanced.${sourceBlock}`,
      });
      if (!result.output) {
        throw new Error("Failed to generate slides");
      }
      return { type: "slidedeck" as const, data: result.output };
    },
  }),

  create_spatial: tool({
    description:
      "Create a 3D spatial visualization of concept relationships. Useful for subjects where spatial reasoning aids understanding (molecular structures, system architectures, mathematical spaces). Not a learning-style accommodation — spatial representations help when the content is inherently spatial [PASHLER_2008].",
    inputSchema: profileAwareInputSchema,
    execute: async (input: ProfileAwareInput) => {
      const sourceBlock = await resolveSourceContent(input);
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: SpatialArtifactSchema }),
        prompt: `You are an expert educator creating a 3D spatial visualization.

${getCitationGuardrails()}

**Subject:** ${input.subject}
**Concepts:** ${input.concepts.join(", ")}
**Student Level:** ${input.priorKnowledgeLevel}

## Important Note on Spatial Representations
This is NOT a "visual learning style" accommodation [PASHLER_2008].
Spatial representations are appropriate ONLY when the content has inherent spatial structure.
Good uses: molecular geometry, network topologies, mathematical spaces, system architectures.
Bad uses: memorizing vocabulary, learning historical dates (spatial adds no value here).

## 3D Model Design
- 4-10 objects with meaningful shapes and colors.
- Positions: x, y, z between -5 and 5.
- Connections between related objects.
- Object ids: "obj1", "obj2", etc.
- Hex colors (e.g., "#ef4444").
- Shape semantics: sphere=node, box=container, cylinder=bond/axis, torus=cycle/orbit.
- Scale: 0.2-2.0.
- autoRotate: true for better perspective.${sourceBlock}`,
      });
      if (!result.output) {
        throw new Error("Failed to generate spatial model");
      }
      return { type: "spatial" as const, data: result.output };
    },
  }),
};
