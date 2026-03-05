import { evalite } from "evalite"
import { generateQuiz } from "../src/lib/ai/generate-artifact"
import type { ArtifactInput } from "../src/lib/ai/generate-artifact"
import type { QuizArtifactData } from "../src/lib/ai/schemas"
import { LINEAR_ALGEBRA_CONCEPTS, ML_CONCEPTS, DATA_SCIENCE_CONCEPTS } from "./fixtures"
import { quizCorrectAnswerValidity, quizExplanationQuality } from "./scorers"

type QuizEvalInput = ArtifactInput & { concepts: string[] }

const quizConceptCoverage = {
  name: "Quiz Concept Coverage",
  description: "Checks that quiz questions cover the input concepts",
  scorer: ({ input, output }: { input: QuizEvalInput; output: QuizArtifactData }) => {
    const allText = output.questions
      .map((q) => `${q.question} ${q.options.join(" ")} ${q.explanation}`)
      .join(" ")
      .toLowerCase()

    let covered = 0
    for (const concept of input.concepts) {
      if (allText.includes(concept.toLowerCase())) covered++
    }
    return covered / input.concepts.length
  },
}

const quizDifficultyProgression = {
  name: "Quiz Difficulty Progression",
  description: "Checks that questions progress from easier to harder (explanations get longer)",
  scorer: ({ output }: { input: QuizEvalInput; output: QuizArtifactData }) => {
    if (output.questions.length < 3) return 0.5

    // Heuristic: later questions should have longer explanations (more complex)
    const firstHalf = output.questions.slice(
      0,
      Math.floor(output.questions.length / 2),
    )
    const secondHalf = output.questions.slice(
      Math.floor(output.questions.length / 2),
    )

    const avgFirst =
      firstHalf.reduce((s, q) => s + q.explanation.length, 0) / firstHalf.length
    const avgSecond =
      secondHalf.reduce((s, q) => s + q.explanation.length, 0) /
      secondHalf.length

    // Second half explanations should be at least as long as first half
    return avgSecond >= avgFirst * 0.8 ? 1 : 0.5
  },
}

evalite<QuizEvalInput, QuizArtifactData>("Quiz Artifact Generation", {
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
    return generateQuiz(input)
  },
  scorers: [
    quizCorrectAnswerValidity,
    quizExplanationQuality,
    quizConceptCoverage,
    quizDifficultyProgression,
  ],
})
