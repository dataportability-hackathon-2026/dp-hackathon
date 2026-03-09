/**
 * Shared server-side guide generation.
 * Used by both the CTA button (via /api/generate-guide) and the agent tool.
 *
 * Auto-resolves the user's assessment profile, source materials, and preferences
 * from the database, then calls the LLM to produce a 7-day learning guide.
 */

import { generateText, Output } from "ai";
import { and, desc, eq } from "drizzle-orm";
import type { LearningProfileData } from "@/components/learning-profile-form";
import { db } from "@/db";
import { assessment, source, userPreferences } from "@/db/schema";
import type { LearningProfileAnalysis } from "@/lib/ai/schemas";
import { LearningGuideSchema } from "@/lib/ai/schemas";
import {
  DEFAULT_PREFERENCES,
  type UserPreferences,
} from "@/lib/preferences-store";
import { loadSourceContent } from "@/lib/sources/load-sources";
import { buildGuidePrompt } from "./guide-tools";
import { model } from "./provider";

type GenerateGuideInput = {
  userId: string;
  topicSlug: string;
  /** Optional topic name override (used when slug is synthetic) */
  topicName?: string;
};

export type GenerateGuideResult = {
  title: string;
  goalSummary: string;
  totalMinutesPerWeek: number;
  blocks: Array<{
    id: string;
    dayIndex: number;
    blockType: string;
    title: string;
    description: string;
    plannedMinutes: number;
    concepts: string[];
    techniques: string[];
  }>;
  dailySummaries: Array<{
    dayIndex: number;
    focus: string;
    totalMinutes: number;
  }>;
};

/**
 * Generate a 7-day learning guide for a user, auto-resolving profile,
 * preferences, and source materials from the database.
 */
export async function generateGuideForUser(
  input: GenerateGuideInput,
): Promise<GenerateGuideResult> {
  const { userId, topicSlug, topicName } = input;

  // 1. Fetch assessment (profile + fingerprint)
  const [latestAssessment] = await db
    .select()
    .from(assessment)
    .where(
      and(eq(assessment.userId, userId), eq(assessment.status, "completed")),
    )
    .orderBy(desc(assessment.createdAt))
    .limit(1);

  const responses: LearningProfileData | null = latestAssessment?.responses
    ? JSON.parse(latestAssessment.responses)
    : null;

  const fingerprint: LearningProfileAnalysis | null =
    latestAssessment?.fingerprint
      ? JSON.parse(latestAssessment.fingerprint)
      : null;

  // 2. Fetch user preferences
  const [prefsRow] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  const prefs: UserPreferences = prefsRow
    ? {
        ...DEFAULT_PREFERENCES,
        ...(JSON.parse(prefsRow.preferences) as Partial<UserPreferences>),
      }
    : { ...DEFAULT_PREFERENCES };

  // 3. Fetch all non-excluded source IDs for this topic
  const topicSources = await db
    .select({ id: source.id })
    .from(source)
    .where(
      and(
        eq(source.userId, userId),
        eq(source.topicSlug, topicSlug),
        eq(source.excluded, false),
      ),
    );

  const sourceIds = topicSources.map((s) => s.id);

  // 4. Build guide generation input from resolved data
  const fieldOfStudy =
    responses?.fieldOfStudy || topicName || topicSlug.replace(/-/g, " ");
  const primaryGoal = responses?.primaryGoal || "deep_understanding";
  const goalDescription =
    responses?.goalDescription || `Master ${fieldOfStudy}`;
  const deadline =
    responses?.deadline ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const minutesPerDay = responses?.minutesPerDay ?? prefs.dailyMinutes;
  const daysPerWeek = responses?.daysPerWeek ?? 5;
  const sessionLength =
    (responses?.sessionLength as "short" | "medium" | "long") || "medium";
  const priorKnowledgeLevel =
    (responses?.priorKnowledgeLevel as
      | "beginner"
      | "intermediate"
      | "advanced") || "intermediate";
  const studyStrategies = responses?.studyStrategies?.length
    ? responses.studyStrategies
    : ["active-recall", "spaced-repetition"];

  // Resolve from fingerprint or defaults
  const profileSummary =
    fingerprint?.summary || `Learner studying ${fieldOfStudy}`;
  const strengths = fingerprint?.strengths || ["Self-directed learning"];
  const risks = fingerprint?.risks || [
    {
      area: "Unknown",
      severity: "low" as const,
      description: "No assessment completed yet",
      mitigation: "Monitor progress",
    },
  ];
  const cognitiveLoadRisk = (
    fingerprint?.cognitiveProfile?.metacognitiveAwareness === "low"
      ? "high"
      : fingerprint?.cognitiveProfile?.metacognitiveAwareness === "medium"
        ? "medium"
        : "low"
  ) as "low" | "medium" | "high";
  const calibrationAccuracy =
    fingerprint?.cognitiveProfile?.calibrationAccuracy || "well-calibrated";
  const metacognitiveAwareness =
    fingerprint?.cognitiveProfile?.metacognitiveAwareness || "medium";
  const motivationalFocus =
    fingerprint?.coachingApproach?.motivationalFocus || "competence";
  const coachingTone =
    responses?.coachingTone ||
    fingerprint?.coachingApproach?.tone ||
    "encouraging";

  const guideInput = {
    fieldOfStudy,
    primaryGoal,
    goalDescription,
    deadline,
    minutesPerDay,
    daysPerWeek,
    sessionLength,
    priorKnowledgeLevel,
    studyStrategies,
    concepts: [fieldOfStudy],
    profileSummary,
    strengths,
    risks,
    cognitiveLoadRisk,
    calibrationAccuracy,
    metacognitiveAwareness,
    motivationalFocus,
    coachingTone,
    sourceIds,
    userId,
  };

  const totalWeeklyMinutes = minutesPerDay * daysPerWeek;

  // 5. Load source content for context
  let sourceContent: string | undefined;
  if (sourceIds.length > 0) {
    sourceContent = await loadSourceContent(sourceIds, userId);
  }

  const prompt =
    buildGuidePrompt(guideInput, totalWeeklyMinutes) +
    (sourceContent
      ? `\n\n## Reference Material\nUse this material as the primary content source for concepts and examples:\n${sourceContent}`
      : "");

  // 6. Call LLM
  const result = await generateText({
    model: model("openai/gpt-4o-mini"),
    output: Output.object({ schema: LearningGuideSchema }),
    prompt,
  });

  if (!result.output) {
    throw new Error("Failed to generate learning guide");
  }

  return result.output;
}

// ── Legacy exports (used by evals and mcp-server) ──

export type GuideInput = {
  profileAnalysis: LearningProfileAnalysis;
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
};

export async function generateLearningGuide(
  input: GuideInput,
): Promise<GenerateGuideResult> {
  const analysis = input.profileAnalysis;
  const totalWeeklyMinutes = input.minutesPerDay * input.daysPerWeek;

  const guideInput = {
    fieldOfStudy: input.fieldOfStudy,
    primaryGoal: input.primaryGoal,
    goalDescription: input.goalDescription,
    deadline: input.deadline,
    minutesPerDay: input.minutesPerDay,
    daysPerWeek: input.daysPerWeek,
    sessionLength: input.sessionLength as "short" | "medium" | "long",
    priorKnowledgeLevel: input.priorKnowledgeLevel as
      | "beginner"
      | "intermediate"
      | "advanced",
    studyStrategies: input.studyStrategies,
    concepts: input.concepts,
    profileSummary: analysis.summary,
    strengths: analysis.strengths,
    risks: analysis.risks,
    cognitiveLoadRisk: (analysis.cognitiveProfile.metacognitiveAwareness ===
    "low"
      ? "high"
      : analysis.cognitiveProfile.metacognitiveAwareness === "medium"
        ? "medium"
        : "low") as "low" | "medium" | "high",
    calibrationAccuracy: analysis.cognitiveProfile.calibrationAccuracy,
    metacognitiveAwareness: analysis.cognitiveProfile.metacognitiveAwareness,
    motivationalFocus: analysis.coachingApproach.motivationalFocus,
    coachingTone: analysis.coachingApproach.tone,
  };

  const prompt =
    buildGuidePrompt(guideInput, totalWeeklyMinutes) +
    (input.sourceContent
      ? `\n\n## Reference Material\nUse this material as the primary content source for concepts and examples:\n${input.sourceContent}`
      : "");

  const result = await generateText({
    model: model("openai/gpt-4o-mini"),
    output: Output.object({ schema: LearningGuideSchema }),
    prompt,
  });

  if (!result.output) {
    throw new Error("Failed to generate learning guide");
  }

  return result.output;
}
