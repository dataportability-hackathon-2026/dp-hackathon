import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { LearningProfileData } from "@/components/learning-profile-form";
import { db } from "@/db";
import { assessment, generatedArtifact, user, workflowRun } from "@/db/schema";
import type {
  FlashcardArtifactData,
  LearningProfileAnalysis,
  MindMapArtifactData,
  QuizArtifactData,
} from "@/lib/ai/schemas";
import { auth } from "@/lib/auth";

// ── Persona definitions ──

const PERSONAS = [
  {
    email: "priya@university.edu",
    password: "password123",
    name: "Dr. Priya Sharma",
  },
  {
    email: "marcus@risd.edu",
    password: "password123",
    name: "Marcus Chen",
  },
  {
    email: "maya@stanford.edu",
    password: "password123",
    name: "Maya Johnson",
    seedData: true,
  },
];

// ── Static fixture: Maya's learning profile responses ──

const MAYA_PROFILE: LearningProfileData = {
  displayName: "Maya Johnson",
  educationLevel: "undergraduate",
  fieldOfStudy: "Psychology",
  primaryGoal: "exam",
  goalDescription:
    "Ace my Abnormal Psychology midterm and build a strong foundation for clinical work",
  deadline: "2026-04-15",
  urgency: "medium",
  minutesPerDay: 45,
  daysPerWeek: 5,
  preferredTimeOfDay: "morning",
  sessionLength: "25-30",
  crtAnswer1: "5 cents",
  crtAnswer2: "5 minutes",
  crtAnswer3: "47 days",
  metacogPlanningFrequency: "often",
  metacogMonitoring: "sometimes",
  metacogSelfEvaluation: "often",
  studyStrategies: ["active-recall", "elaboration", "mind-mapping"],
  primaryStrategy: "active-recall",
  motivationAutonomy: 78,
  motivationCompetence: 85,
  motivationRelatedness: 62,
  calibrationConfidence: 72,
  calibrationExplanation:
    "I usually know the material fairly well but sometimes second-guess myself on case studies",
  biggestChallenge: "Abstract concepts are hard to grasp without examples",
  procrastinationFrequency: "sometimes",
  distractionSources: ["phone", "social-media"],
  preferredFormats: ["worked-examples", "short-practice", "visual-diagrams"],
  feedbackStyle: "detailed",
  coachingTone: "encouraging",
  priorKnowledgeLevel: "intermediate",
  priorKnowledgeDetails:
    "Completed Intro to Psychology and Research Methods with strong grades",
  relatedSubjects: ["statistics", "biology"],
  learningSuperpowers:
    "Strong case analysis skills and empathy for understanding patient perspectives",
  areasToImprove:
    "Need to improve memorization of DSM criteria and diagnostic differentials",
  anythingElse: "",
};

// ── Static fixture: Maya's cognitive fingerprint ──

const MAYA_FINGERPRINT: LearningProfileAnalysis = {
  summary:
    "Maya is a reflective undergraduate psychology student with strong metacognitive awareness and genuine intrinsic motivation. She excels at case-based reasoning but needs structured support for memorization-heavy content like DSM diagnostic criteria.",
  strengths: [
    "High reflectiveness — answered all CRT questions correctly, indicating deliberate analytical thinking",
    "Strong metacognitive habits — regularly plans study sessions and evaluates understanding",
    "Competence-driven motivation aligns well with mastery-oriented learning strategies",
    "Effective use of active recall and elaboration as primary study strategies",
  ],
  risks: [
    {
      area: "Calibration gap",
      severity: "medium",
      description:
        "Self-reported confidence (72%) paired with second-guessing on case studies suggests mild under-confidence that may slow performance under exam pressure",
      mitigation:
        "Use prediction-reflection exercises to calibrate confidence against actual performance on practice questions",
    },
    {
      area: "Memorization bottleneck",
      severity: "medium",
      description:
        "DSM criteria and diagnostic differentials require rote memorization, which conflicts with Maya's preference for meaning-based strategies",
      mitigation:
        "Combine flashcards with elaborative interrogation — attach 'why' explanations to each diagnostic criterion",
    },
    {
      area: "Digital distractions",
      severity: "low",
      description:
        "Phone and social media identified as distraction sources during study sessions",
      mitigation:
        "Recommend app-blocking during focused 25-minute Pomodoro sessions, aligned with her preferred session length",
    },
  ],
  recommendedStrategies: [
    {
      strategy: "Interleaved case practice",
      rationale:
        "Mixing diagnostic cases from different disorders builds discrimination skills — critical for differential diagnosis questions on exams",
      priority: "primary",
    },
    {
      strategy: "Elaborative flashcards with DSM mnemonics",
      rationale:
        "Converts rote memorization into meaning-based learning by connecting each criterion to clinical examples",
      priority: "primary",
    },
    {
      strategy: "Prediction-reflection journaling",
      rationale:
        "Addresses under-confidence by building evidence of actual competence through calibration tracking",
      priority: "secondary",
    },
    {
      strategy: "Visual mind maps for disorder families",
      rationale:
        "Leverages Maya's preference for visual formats to organize related disorders and their overlapping symptoms",
      priority: "supplementary",
    },
  ],
  cognitiveProfile: {
    reflectivenessLevel: "high",
    metacognitiveAwareness: "high",
    calibrationAccuracy: "under-confident",
  },
  coachingApproach: {
    tone: "Encouraging with specific praise — highlight correct reasoning processes, not just right answers",
    feedbackFrequency: "after-each-block",
    motivationalFocus: "competence",
  },
};

// ── Static fixture: sample quiz artifact ──

const MAYA_QUIZ: QuizArtifactData = {
  title: "Abnormal Psychology — Anxiety Disorders Review",
  description:
    "Adaptive quiz covering GAD, panic disorder, phobias, and OCD diagnostic criteria with case-based questions",
  questions: [
    {
      id: "q1",
      question:
        "A 28-year-old reports persistent worry about multiple life domains for the past 8 months, along with muscle tension and difficulty sleeping. Which diagnosis is most appropriate?",
      options: [
        "Generalized Anxiety Disorder",
        "Panic Disorder",
        "Social Anxiety Disorder",
        "Adjustment Disorder with Anxiety",
      ],
      correctIndex: 0,
      explanation:
        "GAD requires excessive worry about multiple domains for ≥6 months with at least 3 somatic symptoms. The 8-month duration and multi-domain worry pattern fit GAD, not adjustment disorder (which is tied to a specific stressor).",
    },
    {
      id: "q2",
      question:
        "Which of the following best distinguishes panic disorder from generalized anxiety disorder?",
      options: [
        "Panic disorder involves discrete, unexpected episodes of intense fear with physical symptoms",
        "Panic disorder always involves agoraphobia",
        "GAD never includes physical symptoms",
        "Panic disorder requires worry lasting more than 6 months",
      ],
      correctIndex: 0,
      explanation:
        "Panic disorder is characterized by recurrent unexpected panic attacks — discrete periods of intense fear reaching a peak within minutes. GAD involves chronic, diffuse worry rather than acute episodes.",
    },
    {
      id: "q3",
      question:
        "A patient avoids all social gatherings due to fear of being negatively evaluated. They recognize the fear is excessive. The most likely diagnosis is:",
      options: [
        "Agoraphobia",
        "Social Anxiety Disorder",
        "Avoidant Personality Disorder",
        "Specific Phobia",
      ],
      correctIndex: 1,
      explanation:
        "Social Anxiety Disorder involves marked fear of social situations where one may be scrutinized. The key feature is fear of negative evaluation, distinguishing it from agoraphobia (fear of escape difficulty) and specific phobia (fear of a specific object/situation).",
    },
    {
      id: "q4",
      question:
        "According to the DSM-5, which is required for an OCD diagnosis?",
      options: [
        "Both obsessions and compulsions must be present",
        "Obsessions, compulsions, or both that are time-consuming or cause significant distress",
        "Symptoms must be triggered by a traumatic event",
        "The person must recognize their behavior as irrational",
      ],
      correctIndex: 1,
      explanation:
        "DSM-5 requires obsessions, compulsions, or both. They must be time-consuming (>1 hour/day) or cause clinically significant distress/impairment. Insight can vary — poor insight is a specifier, not an exclusion.",
    },
    {
      id: "q5",
      question:
        "Which cognitive model best explains the maintenance of panic disorder?",
      options: [
        "Learned helplessness theory",
        "Clark's cognitive model of catastrophic misinterpretation",
        "Beck's negative cognitive triad",
        "Bandura's self-efficacy theory",
      ],
      correctIndex: 1,
      explanation:
        "Clark's model proposes that panic is maintained by catastrophic misinterpretation of bodily sensations (e.g., interpreting a racing heart as a heart attack), creating a positive feedback loop of anxiety and physical symptoms.",
    },
  ],
};

// ── Static fixture: sample flashcard artifact ──

const MAYA_FLASHCARDS: FlashcardArtifactData = {
  title: "DSM-5 Anxiety Disorders — Key Criteria Flashcards",
  description:
    "Elaborative flashcards connecting DSM criteria to clinical examples for active recall practice",
  cards: [
    {
      id: "fc1",
      front: "What is the minimum duration required for a GAD diagnosis?",
      back: "6 months of excessive anxiety and worry about multiple events or activities, occurring more days than not. The worry must be difficult to control.",
    },
    {
      id: "fc2",
      front:
        "Name 3 of the 6 somatic symptoms associated with GAD in the DSM-5",
      back: "Restlessness/feeling keyed up, easily fatigued, difficulty concentrating, irritability, muscle tension, sleep disturbance. At least 3 must be present in adults.",
    },
    {
      id: "fc3",
      front: "How does the DSM-5 distinguish specific phobia from normal fear?",
      back: "The fear must be: (1) out of proportion to actual danger, (2) persistent (≥6 months), (3) causing significant distress or functional impairment, and (4) not better explained by another disorder.",
    },
    {
      id: "fc4",
      front: "What are the two core features of panic attacks?",
      back: "An abrupt surge of intense fear reaching a peak within minutes, accompanied by at least 4 of 13 physical/cognitive symptoms (palpitations, sweating, trembling, shortness of breath, chest pain, nausea, dizziness, chills/heat, paresthesias, derealization, fear of losing control, fear of dying).",
    },
    {
      id: "fc5",
      front:
        "What distinguishes OCD-related compulsions from normal repetitive behaviors?",
      back: "OCD compulsions are performed to reduce distress or prevent a dreaded event, are clearly excessive or not realistically connected to what they're meant to prevent, and are time-consuming (>1 hour/day) or cause significant impairment.",
    },
    {
      id: "fc6",
      front: "What is the difference between obsessions and ruminations?",
      back: "Obsessions are intrusive, unwanted thoughts that cause anxiety (ego-dystonic). Ruminations in depression are repetitive dwelling on negative themes that feel consistent with mood (ego-syntonic). OCD obsessions trigger compulsive responses; depressive ruminations do not.",
    },
  ],
};

// ── Static fixture: sample mind map artifact ──

const MAYA_MINDMAP: MindMapArtifactData = {
  title: "Anxiety Disorders Family Tree",
  description:
    "Visual map of DSM-5 anxiety disorders showing relationships, shared features, and distinguishing criteria",
  nodes: [
    { id: "root", label: "Anxiety Disorders", parentId: null },
    { id: "gad", label: "GAD", parentId: "root" },
    { id: "gad-duration", label: "≥6 months worry", parentId: "gad" },
    { id: "gad-somatic", label: "3+ somatic symptoms", parentId: "gad" },
    { id: "panic", label: "Panic Disorder", parentId: "root" },
    {
      id: "panic-attacks",
      label: "Recurrent unexpected attacks",
      parentId: "panic",
    },
    {
      id: "panic-worry",
      label: "Persistent concern about attacks",
      parentId: "panic",
    },
    { id: "social", label: "Social Anxiety", parentId: "root" },
    {
      id: "social-eval",
      label: "Fear of negative evaluation",
      parentId: "social",
    },
    { id: "specific", label: "Specific Phobia", parentId: "root" },
    {
      id: "specific-obj",
      label: "Circumscribed fear object",
      parentId: "specific",
    },
    { id: "ocd-related", label: "OCD & Related", parentId: "root" },
    { id: "ocd", label: "OCD", parentId: "ocd-related" },
    { id: "ocd-obs", label: "Obsessions", parentId: "ocd" },
    { id: "ocd-comp", label: "Compulsions", parentId: "ocd" },
    { id: "bdd", label: "Body Dysmorphic", parentId: "ocd-related" },
  ],
};

// ── Helpers ──

async function isAdmin(userId: string): Promise<boolean> {
  const rows = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return rows[0]?.role === "admin";
}

async function createPersonaAccount(persona: {
  email: string;
  password: string;
  name: string;
}): Promise<string> {
  // Check if already exists
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, persona.email));

  if (existing) return existing.id;

  // Use better-auth internal API to create account with proper password hashing
  const ctx = await auth.api.signUpEmail({
    body: {
      email: persona.email,
      password: persona.password,
      name: persona.name,
    },
  });

  return ctx.user.id;
}

async function seedMayaData(
  userId: string,
): Promise<{ artifacts: number; assessment: boolean }> {
  // Check if assessment already exists
  const [existingAssessment] = await db
    .select({ id: assessment.id })
    .from(assessment)
    .where(eq(assessment.userId, userId));

  let assessmentSeeded = false;
  if (!existingAssessment) {
    await db.insert(assessment).values({
      userId,
      type: "full_onboarding",
      status: "completed",
      version: 1,
      currentStep: 11,
      responses: JSON.stringify(MAYA_PROFILE),
      fingerprint: JSON.stringify(MAYA_FINGERPRINT),
      completedAt: new Date(),
    });
    assessmentSeeded = true;
  }

  // Check if artifacts already exist
  const [existingArtifact] = await db
    .select({ id: generatedArtifact.id })
    .from(generatedArtifact)
    .where(eq(generatedArtifact.userId, userId));

  let artifactCount = 0;
  if (!existingArtifact) {
    // Create a workflow run for the artifacts
    const runId = crypto.randomUUID();
    await db.insert(workflowRun).values({
      id: runId,
      userId,
      workflowType: "batch_artifacts",
      status: "completed",
      input: JSON.stringify({ seeded: true }),
      output: JSON.stringify({ seeded: true }),
    });

    // Upload artifacts to blob storage and record them
    const artifacts = [
      { type: "quiz", data: MAYA_QUIZ, title: "Anxiety Disorders Review Quiz" },
      {
        type: "flashcards",
        data: MAYA_FLASHCARDS,
        title: "DSM-5 Anxiety Disorders Flashcards",
      },
      {
        type: "mindmap",
        data: MAYA_MINDMAP,
        title: "Anxiety Disorders Family Tree",
      },
    ];

    for (const artifact of artifacts) {
      const blob = await put(
        `artifacts/${userId}/${artifact.type}-seed-${Date.now()}.json`,
        JSON.stringify(artifact.data),
        { access: "public", contentType: "application/json" },
      );

      await db.insert(generatedArtifact).values({
        userId,
        workflowRunId: runId,
        artifactType: artifact.type,
        title: artifact.title,
        blobUrl: blob.url,
        status: "completed",
      });
      artifactCount++;
    }
  }

  return { artifacts: artifactCount, assessment: assessmentSeeded };
}

// ── Route handler ──

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const results: Array<{
    email: string;
    name: string;
    userId: string;
    seeded?: { artifacts: number; assessment: boolean };
  }> = [];

  for (const persona of PERSONAS) {
    const userId = await createPersonaAccount(persona);
    let seeded: { artifacts: number; assessment: boolean } | undefined;

    if ("seedData" in persona && persona.seedData) {
      seeded = await seedMayaData(userId);
    }

    results.push({ email: persona.email, name: persona.name, userId, seeded });
  }

  return NextResponse.json({ success: true, personas: results });
}
