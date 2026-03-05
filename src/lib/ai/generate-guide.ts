import { generateText, Output } from "ai"
import { openai } from "@ai-sdk/openai"
import { LearningGuideSchema } from "./schemas"
import type { LearningGuide, LearningProfileAnalysis } from "./schemas"

type GuideInput = {
  profileAnalysis: LearningProfileAnalysis
  fieldOfStudy: string
  primaryGoal: string
  goalDescription: string
  deadline: string
  minutesPerDay: number
  daysPerWeek: number
  sessionLength: string
  priorKnowledgeLevel: string
  studyStrategies: string[]
  concepts: string[]
}

export async function generateLearningGuide(
  input: GuideInput,
): Promise<LearningGuide> {
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: LearningGuideSchema }),
    prompt: buildGuidePrompt(input),
  })
  if (!result.output) {
    throw new Error("Failed to generate learning guide")
  }
  return result.output
}

function buildGuidePrompt(input: GuideInput): string {
  const totalWeeklyMinutes = input.minutesPerDay * input.daysPerWeek
  const analysis = input.profileAnalysis

  return `You are an evidence-based learning guide generator. Create a structured 7-day learning guide.

## Learner Context

**Subject:** ${input.fieldOfStudy}
**Goal:** ${input.primaryGoal} - ${input.goalDescription}
**Deadline:** ${input.deadline}
**Prior Knowledge:** ${input.priorKnowledgeLevel}
**Concepts to Cover:** ${input.concepts.join(", ")}

## Time Budget

- ${input.minutesPerDay} minutes per day
- ${input.daysPerWeek} days per week
- Total weekly budget: ${totalWeeklyMinutes} minutes
- Session length preference: ${input.sessionLength}

## Profile Analysis

**Summary:** ${analysis.summary}
**Strengths:** ${analysis.strengths.join("; ")}
**Risks:** ${analysis.risks.map((r) => `${r.area} (${r.severity}): ${r.mitigation}`).join("; ")}
**Recommended Strategies:** ${analysis.recommendedStrategies.map((s) => `${s.strategy} (${s.priority})`).join("; ")}
**Cognitive Profile:** Reflectiveness=${analysis.cognitiveProfile.reflectivenessLevel}, Metacognition=${analysis.cognitiveProfile.metacognitiveAwareness}, Calibration=${analysis.cognitiveProfile.calibrationAccuracy}
**Coaching:** Tone=${analysis.coachingApproach.tone}, Feedback=${analysis.coachingApproach.feedbackFrequency}, Focus=${analysis.coachingApproach.motivationalFocus}

## Block Type Rules

1. **core_practice** (60-70% of time): Main learning content using active recall, worked examples, interleaving.
2. **metacog_routine** (10-15% of time): Reflection, monitoring, calibration exercises. REQUIRED if metacognitive awareness is low/medium.
3. **skill_builder** (10-15% of time): Study skill lessons. REQUIRED if any risk severity is "high".
4. **motivation_support** (5-10% of time): Autonomy-supportive activities. Include if motivation scores are low.

## Constraints

- EVERY day must have at least 1 core_practice block.
- Total planned minutes across ALL blocks must equal approximately ${totalWeeklyMinutes} (+/- 10%).
- Each block must be between 5 and 120 minutes.
- Use the learner's preferred strategies: ${input.studyStrategies.join(", ")}.
- Days with no study (if daysPerWeek < 7) should still have dailySummaries with 0 minutes and "Rest day" as focus.
- Distribute concepts across the week, with harder/newer concepts earlier in the week.
- Include interleaving in days 4-7 to mix concepts.
- Each day's total minutes should not exceed ${input.minutesPerDay} (+/- 10%).`
}

export type { GuideInput }
