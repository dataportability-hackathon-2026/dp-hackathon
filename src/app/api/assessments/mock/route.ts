import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { LearningProfileData } from "@/components/learning-profile-form";
import { db } from "@/db";
import { assessment } from "@/db/schema";
import { generateFingerprint } from "@/lib/assessments/generate-fingerprint";
import { getEffectiveUserId } from "@/lib/impersonate";

// Random helpers (no faker dependency needed)
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const NAMES = [
  "Alex Rivera",
  "Jordan Lee",
  "Sam Patel",
  "Maya Chen",
  "Chris Wu",
  "Taylor Kim",
  "Morgan Davis",
  "Riley Johnson",
];
const FIELDS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Biology",
  "Psychology",
  "Economics",
  "Engineering",
  "Philosophy",
];
const EDUCATION_LEVELS = [
  "high_school",
  "undergraduate",
  "graduate",
  "postgraduate",
  "professional",
];
const GOALS = [
  "exam",
  "deep_understanding",
  "project",
  "teaching",
  "career_switch",
];
const GOAL_DESCRIPTIONS = [
  "Pass my final exam with at least a B+",
  "Deeply understand the fundamentals for research",
  "Build a working project for my portfolio",
  "Prepare to teach this subject to others",
  "Switch careers into this field",
];
const SESSION_LENGTHS = ["15-20", "25-30", "30-45", "60-90"];
const TIMES_OF_DAY = ["morning", "afternoon", "evening", "night"];
const FREQUENCIES = ["rarely", "sometimes", "often", "always"];
const STRATEGIES = [
  "active-recall",
  "spaced-repetition",
  "worked-examples",
  "highlighting",
  "rereading",
  "summarization",
  "interleaving",
  "elaboration",
  "mind-mapping",
];
const CRT_ANSWERS_1 = ["5 cents", "10 cents", "1 cent", "50 cents"];
const CRT_ANSWERS_2 = ["5 minutes", "100 minutes", "10 minutes", "1 minute"];
const CRT_ANSWERS_3 = ["47 days", "24 days", "48 days", "12 days"];
const CHALLENGES = [
  "I overestimate how well I know the material",
  "I struggle with time management",
  "I get distracted easily during study sessions",
  "Abstract concepts are hard to grasp without examples",
  "I procrastinate starting difficult topics",
];
const DISTRACTIONS = [
  "phone",
  "social-media",
  "noise",
  "people",
  "email",
  "tv",
];
const FORMATS = [
  "visual-diagrams",
  "worked-examples",
  "short-practice",
  "video-lectures",
  "textbooks",
  "interactive-exercises",
];
const FEEDBACK_STYLES = ["direct", "detailed", "gentle", "challenging"];
const COACHING_TONES = ["concise", "encouraging", "socratic", "collaborative"];
const KNOWLEDGE_LEVELS = ["beginner", "intermediate", "advanced"];
const SUBJECTS = [
  "calculus",
  "discrete-math",
  "statistics",
  "algebra",
  "geometry",
  "logic",
];

function generateRandomProfile(): LearningProfileData {
  return {
    displayName: pick(NAMES),
    educationLevel: pick(EDUCATION_LEVELS),
    fieldOfStudy: pick(FIELDS),
    primaryGoal: pick(GOALS),
    goalDescription: pick(GOAL_DESCRIPTIONS),
    deadline: new Date(Date.now() + randInt(7, 90) * 86400000)
      .toISOString()
      .split("T")[0],
    urgency: pick(["low", "medium", "high"]),
    minutesPerDay: pick([15, 30, 45, 60, 90]),
    daysPerWeek: randInt(3, 7),
    preferredTimeOfDay: pick(TIMES_OF_DAY),
    sessionLength: pick(SESSION_LENGTHS),
    crtAnswer1: pick(CRT_ANSWERS_1),
    crtAnswer2: pick(CRT_ANSWERS_2),
    crtAnswer3: pick(CRT_ANSWERS_3),
    metacogPlanningFrequency: pick(FREQUENCIES),
    metacogMonitoring: pick(FREQUENCIES),
    metacogSelfEvaluation: pick(FREQUENCIES),
    studyStrategies: pickN(STRATEGIES, randInt(2, 4)),
    primaryStrategy: pick(STRATEGIES),
    motivationAutonomy: randInt(20, 95),
    motivationCompetence: randInt(20, 95),
    motivationRelatedness: randInt(20, 95),
    calibrationConfidence: randInt(30, 95),
    calibrationExplanation:
      "I feel fairly confident but sometimes overestimate my understanding.",
    biggestChallenge: pick(CHALLENGES),
    procrastinationFrequency: pick(FREQUENCIES),
    distractionSources: pickN(DISTRACTIONS, randInt(1, 3)),
    preferredFormats: pickN(FORMATS, randInt(2, 4)),
    feedbackStyle: pick(FEEDBACK_STYLES),
    coachingTone: pick(COACHING_TONES),
    priorKnowledgeLevel: pick(KNOWLEDGE_LEVELS),
    priorKnowledgeDetails: "Some foundational knowledge from previous courses.",
    relatedSubjects: pickN(SUBJECTS, randInt(1, 3)),
    learningSuperpowers: "Good at pattern recognition and problem solving.",
    areasToImprove: "Need better self-regulation and study planning.",
    anythingElse: "",
  };
}

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 },
    );
  }

  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const responses = generateRandomProfile();

  // Auto-calculate version
  const [maxRow] = await db
    .select({
      maxVersion: sql<number>`coalesce(max(${assessment.version}), 0)`,
    })
    .from(assessment)
    .where(eq(assessment.userId, userId));

  const version = (maxRow?.maxVersion ?? 0) + 1;

  // Generate fingerprint from the responses
  let fingerprintJson: string | null = null;
  try {
    const fingerprint = await generateFingerprint(responses);
    fingerprintJson = JSON.stringify(fingerprint);
  } catch (e) {
    console.error("Failed to generate fingerprint for mock:", e);
  }

  const [created] = await db
    .insert(assessment)
    .values({
      userId,
      type: "full_onboarding",
      status: "completed",
      version,
      currentStep: 11,
      responses: JSON.stringify(responses),
      fingerprint: fingerprintJson,
      completedAt: new Date(),
    })
    .returning();

  return NextResponse.json({
    ...created,
    responses: created.responses ? JSON.parse(created.responses) : null,
    fingerprint: created.fingerprint ? JSON.parse(created.fingerprint) : null,
  });
}
