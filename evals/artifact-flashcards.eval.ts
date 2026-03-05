import { evalite } from "evalite"
import { generateFlashcards } from "../src/lib/ai/generate-artifact"
import type { ArtifactInput } from "../src/lib/ai/generate-artifact"
import type { FlashcardArtifactData } from "../src/lib/ai/schemas"
import { LINEAR_ALGEBRA_CONCEPTS, ML_CONCEPTS, DATA_SCIENCE_CONCEPTS } from "./fixtures"
import { flashcardConceptCoverage } from "./scorers"

type FlashcardEvalInput = ArtifactInput & { concepts: string[] }

const flashcardMinimumCount = {
  name: "Flashcard Minimum Count",
  description: "Checks that at least 8 cards are generated",
  scorer: ({ output }: { input: FlashcardEvalInput; output: FlashcardArtifactData }) => {
    if (output.cards.length >= 8) return 1
    if (output.cards.length >= 5) return 0.5
    return 0
  },
}

const flashcardQuality = {
  name: "Flashcard Quality",
  description: "Checks that fronts are questions and backs are substantive answers",
  scorer: ({ output }: { input: FlashcardEvalInput; output: FlashcardArtifactData }) => {
    let score = 0
    for (const card of output.cards) {
      let cardScore = 0
      // Front should end with ? or be a prompt
      if (card.front.includes("?") || card.front.length > 10) cardScore += 0.5
      // Back should be substantive (>15 chars)
      if (card.back.length > 15) cardScore += 0.5
      score += cardScore
    }
    return score / output.cards.length
  },
}

evalite<FlashcardEvalInput, FlashcardArtifactData>(
  "Flashcard Artifact Generation",
  {
    data: () => [
      {
        input: {
          subject: "Linear Algebra",
          concepts: LINEAR_ALGEBRA_CONCEPTS,
          priorKnowledgeLevel: "beginner",
          goalType: "exam",
        },
        expected: undefined,
      },
      {
        input: {
          subject: "Machine Learning",
          concepts: ML_CONCEPTS,
          priorKnowledgeLevel: "advanced",
          goalType: "fluency",
        },
        expected: undefined,
      },
      {
        input: {
          subject: "Data Science with Python",
          concepts: DATA_SCIENCE_CONCEPTS,
          priorKnowledgeLevel: "intermediate",
          goalType: "project",
        },
        expected: undefined,
      },
    ],
    task: async (input) => {
      return generateFlashcards(input)
    },
    scorers: [flashcardConceptCoverage, flashcardMinimumCount, flashcardQuality],
  },
)
