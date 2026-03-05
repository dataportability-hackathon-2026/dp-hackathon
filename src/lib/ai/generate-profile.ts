import { generateText, Output } from "ai"
import { openai } from "./provider"
import { LearningProfileAnalysisSchema } from "./schemas"
import type { LearningProfileAnalysis } from "./schemas"

type LearningProfileInput = {
  displayName: string
  educationLevel: string
  fieldOfStudy: string
  primaryGoal: string
  goalDescription: string
  deadline: string
  urgency: string
  minutesPerDay: number
  daysPerWeek: number
  preferredTimeOfDay: string
  sessionLength: string
  crtAnswer1: string
  crtAnswer2: string
  crtAnswer3: string
  metacogPlanningFrequency: string
  metacogMonitoring: string
  metacogSelfEvaluation: string
  studyStrategies: string[]
  primaryStrategy: string
  motivationAutonomy: number
  motivationCompetence: number
  motivationRelatedness: number
  calibrationConfidence: number
  calibrationExplanation: string
  biggestChallenge: string
  procrastinationFrequency: string
  distractionSources: string[]
  preferredFormats: string[]
  feedbackStyle: string
  coachingTone: string
  priorKnowledgeLevel: string
  priorKnowledgeDetails: string
  relatedSubjects: string[]
  learningSuperpowers: string
  areasToImprove: string
  anythingElse: string
}

export async function generateLearningProfile(
  profile: LearningProfileInput,
): Promise<LearningProfileAnalysis> {
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: LearningProfileAnalysisSchema }),
    prompt: buildProfilePrompt(profile),
  })
  if (!result.output) {
    throw new Error("Failed to generate learning profile analysis")
  }
  return result.output
}

function buildProfilePrompt(p: LearningProfileInput): string {
  // Score CRT (correct answers: 5 cents, 5 minutes, 47 days)
  const crtCorrect = [
    p.crtAnswer1?.toLowerCase().includes("5") &&
    p.crtAnswer1?.toLowerCase().includes("cent")
      ? 1
      : 0,
    p.crtAnswer2?.toLowerCase().includes("5") &&
    p.crtAnswer2?.toLowerCase().includes("min")
      ? 1
      : 0,
    p.crtAnswer3?.toLowerCase().includes("47") ? 1 : 0,
  ]
  const crtScore = crtCorrect.reduce((a, b) => a + b, 0)

  return `You are an evidence-based learning scientist analyzing a learner profile. Produce a structured analysis.

## Learner Data

**Identity:** ${p.displayName}, ${p.educationLevel}, studying ${p.fieldOfStudy}
**Goal:** ${p.primaryGoal} - ${p.goalDescription}
**Deadline:** ${p.deadline} (urgency: ${p.urgency})

**Study Schedule:** ${p.minutesPerDay} min/day, ${p.daysPerWeek} days/week, prefers ${p.preferredTimeOfDay}, sessions: ${p.sessionLength}

**Cognitive Reflection (CRT):** Score ${crtScore}/3
- Q1 (bat & ball): "${p.crtAnswer1}" ${crtCorrect[0] ? "(correct)" : "(incorrect - answer is 5 cents)"}
- Q2 (widgets): "${p.crtAnswer2}" ${crtCorrect[1] ? "(correct)" : "(incorrect - answer is 5 minutes)"}
- Q3 (lily pads): "${p.crtAnswer3}" ${crtCorrect[2] ? "(correct)" : "(incorrect - answer is 47 days)"}

**Metacognition:**
- Planning frequency: ${p.metacogPlanningFrequency}
- Monitoring: ${p.metacogMonitoring}
- Self-evaluation: ${p.metacogSelfEvaluation}

**Study Strategies:** Uses [${p.studyStrategies.join(", ")}], primary: ${p.primaryStrategy}

**Motivation (SDT, 0-100):** Autonomy=${p.motivationAutonomy}, Competence=${p.motivationCompetence}, Relatedness=${p.motivationRelatedness}

**Confidence Calibration:** Self-rated ${p.calibrationConfidence}% confident. Explanation: "${p.calibrationExplanation}"

**Challenges:** Biggest: ${p.biggestChallenge}. Procrastination: ${p.procrastinationFrequency}. Distractions: [${p.distractionSources.join(", ")}]

**Preferences:** Formats: [${p.preferredFormats.join(", ")}]. Feedback: ${p.feedbackStyle}. Coaching tone: ${p.coachingTone}

**Prior Knowledge:** Level: ${p.priorKnowledgeLevel}. Details: ${p.priorKnowledgeDetails}. Related subjects: [${p.relatedSubjects.join(", ")}]

**Self-Reflection:** Superpowers: ${p.learningSuperpowers}. Areas to improve: ${p.areasToImprove}. Additional: ${p.anythingElse}

## Instructions

1. Analyze ALL dimensions: cognitive, metacognitive, motivational, strategic, and situational.
2. CRT score ${crtScore}/3 indicates ${crtScore >= 2 ? "high" : crtScore === 1 ? "medium" : "low"} reflectiveness.
3. Compare self-reported confidence (${p.calibrationConfidence}%) against CRT performance and prior knowledge level to assess calibration.
4. Map SDT scores to identify the lowest-scoring motivation dimension as the primary focus.
5. Recommend evidence-based strategies that address identified risks.
6. Set coaching approach based on stated preferences AND identified needs.`
}

export type { LearningProfileInput }
