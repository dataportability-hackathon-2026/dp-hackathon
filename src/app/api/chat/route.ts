import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { assessment } from "@/db/schema";
import { getCitationGuardrails } from "@/lib/ai/citations";
import { openai } from "@/lib/ai/provider";
import { stateTools } from "@/lib/ai/state-tools";
import { tools } from "@/lib/ai/tools";
import { getEffectiveUserId } from "@/lib/impersonate";

export async function POST(req: Request) {
  const { messages, priorContext } = await req.json();

  // If there is prior conversation context (e.g. from a voice session),
  // inject it into the system prompt so the text agent understands the full history
  // without mixing message formats.
  const priorContextSummary =
    Array.isArray(priorContext) && priorContext.length > 0
      ? `\n\n## Prior conversation context (from voice session)\n${priorContext
          .map(
            (m: { role: string; content: string }) => `${m.role}: ${m.content}`,
          )
          .join(
            "\n",
          )}\n\n---\nThe above is context from a prior voice session. Continue the conversation naturally.`
      : "";

  // Fetch persisted cognitive profile
  const userId = await getEffectiveUserId();
  let profileContext = "";
  if (userId) {
    const [latest] = await db
      .select()
      .from(assessment)
      .where(
        and(eq(assessment.userId, userId), eq(assessment.status, "completed")),
      )
      .orderBy(desc(assessment.createdAt))
      .limit(1);

    if (latest?.fingerprint) {
      const fp = JSON.parse(latest.fingerprint);
      profileContext = `

## Current Learner Profile
${fp.summary}

**Strengths:** ${fp.strengths?.join(", ") ?? "Unknown"}
**Risks:** ${fp.risks?.map((r: { area: string; severity: string }) => `${r.area} (${r.severity})`).join(", ") ?? "None identified"}
**Coaching approach:** ${fp.coachingApproach?.tone ?? "balanced"}, feedback ${fp.coachingApproach?.feedbackFrequency ?? "daily"}
**Motivational focus:** ${fp.coachingApproach?.motivationalFocus ?? "competence"} (SDT)
**Calibration:** ${fp.cognitiveProfile?.calibrationAccuracy ?? "unknown"}
**Reflectiveness:** ${fp.cognitiveProfile?.reflectivenessLevel ?? "unknown"}

Use this profile to adapt your responses: match the coaching tone, address risks proactively, and leverage identified strengths.`;
    }
  }

  // Convert UIMessages from useChat to ModelMessages for streamText
  const allMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are CoreModel, an evidence-based learning assistant.
You help students learn effectively using validated cognitive science research.
You have access to three categories of tools — use them proactively:
You also have tools to navigate the app UI — switch views, select topics, show progress, etc.

## Profile Tools (Learning Profile Generation)
- assess_learning_profile: Full profile analysis from intake data
- assess_calibration: Metacognitive calibration analysis (confidence vs accuracy)
- assess_cognitive_load_risk: Cognitive load risk from performance signals
- assess_dropout_risk: SDT-grounded dropout risk assessment
- assess_self_regulation: Self-regulation capacity assessment

## Guide Tools (Study Plan Generation)
- generate_learning_guide: 7-day evidence-based study plan
- generate_practice_session: Single practice session with prediction-reflection loops
- generate_session_wrap: Post-session summary with mastery deltas
- adjust_guide: Adapt guide based on new evidence (Observe → Analyze → Act)
- recommend_study_strategies: Evidence-ranked strategy recommendations

## Artifact Tools (Learning Material Generation)
- create_adaptive_quiz: Profile-adapted quiz with retrieval practice
- create_adaptive_flashcards: Flashcards with elaborative interrogation
- create_worked_example: Worked examples with fading scaffolding
- create_elaborative_interrogation: "Why does this make sense?" exercises
- create_prediction_reflection: Calibration training exercises
- create_interleaved_problem_set: Mixed-concept problem sets
- create_mind_map: Concept relationship visualization
- create_slides: Review slide deck (consolidation, not primary learning)
- create_spatial: 3D spatial visualization (for inherently spatial content only)

## When to use which tool
- Student asks to be quizzed → create_adaptive_quiz
- Student wants flashcards → create_adaptive_flashcards
- Student needs a study plan → generate_learning_guide
- Student wants to practice → generate_practice_session
- Student finished a session → generate_session_wrap
- Student wants to understand relationships → create_mind_map
- Student is struggling (errors rising) → assess_cognitive_load_risk, then adjust_guide
- Student asks about their profile → assess_learning_profile
- Student asks for strategy help → recommend_study_strategies
- Student needs step-by-step help → create_worked_example

When a student asks to see their progress, use show_progress.
When they ask about their study plan or guide, use show_guide.
When they ask about their files or materials, use show_sources.
When they want to switch topics, use select_topic.
When they mention completing a study block, use complete_guide_block.
When they want to see a specific artifact type, use open_artifact.

## Schedule & Workflow Tools
- generate_all_artifacts: Generate all artifact types (quiz, flashcards, mindmap, slides, spatial) for a topic — runs in the background
- create_schedule: Set up a recurring reminder, artifact refresh, or progress report
- update_schedule: Modify an existing schedule (interval, message, max runs)
- cancel_schedule: Stop a running schedule

When a student asks to be reminded, set up a study schedule, or generate everything at once, use these tools.
Examples: "remind me every morning at 8am for 3 days" → create_schedule (type: reminder, intervalHours: 24, durationDays: 3)
"generate all artifacts for eigenvalues" → generate_all_artifacts
"change my reminder to 9am" → update_schedule
"cancel my reminders" → cancel_schedule

${getCitationGuardrails()}

Always explain what you're creating and WHY it helps (cite the evidence basis).
Keep text responses concise and focused on the learning objective.
NEVER claim that format preferences improve learning outcomes.
Present estimates with uncertainty, not false precision.

Note: The conversation may include messages from a prior voice session. Treat these as part of the ongoing conversation and maintain continuity.${profileContext}${priorContextSummary}`,
    messages: allMessages,
    tools: { ...tools, ...stateTools },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
