// Slug utility
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function findTopicBySlug(slug: string) {
  return TOPICS.find((t) => slugify(t.name) === slug)
}

export function findProjectBySlug(topic: MockTopic, slug: string) {
  return topic.projects.find((p) => slugify(p.name) === slug)
}

export function getTopicsByGroup(): Record<string, MockTopic[]> {
  const groups: Record<string, MockTopic[]> = {}
  for (const topic of TOPICS) {
    if (!groups[topic.parentGroup]) groups[topic.parentGroup] = []
    groups[topic.parentGroup].push(topic)
  }
  return groups
}

// ── Types ──

export type GoalType = "exam" | "project" | "fluency" | "teach"

export type MockProject = {
  id: string
  name: string
  goalType: GoalType
  mastery: number
  masteryUncertainty: number
  minutesPerDay: number
  daysPerWeek: number
  deadline: string
}

export type MockTopic = {
  id: string
  name: string
  domain: string
  parentGroup: string
  icon: string
  fileCount: number
  projects: MockProject[]
  guideBlocks: MockGuideBlock[]
  chatHistory: MockMessage[]
  masteryData: MockMastery[]
  files: MockFile[]
}

export type MockMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export type MockGuideBlock = {
  id: string
  dayIndex: number
  blockType: string
  plannedMinutes: number
  description: string
  completed: boolean
}

export type MockFile = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
  scope: "topic" | "project"
}

export type MockUpload = {
  id: string
  filename: string
  sizeBytes: number
  progress: number
  status: "uploading" | "error"
  error?: string
}

export type MockMastery = {
  id: string
  concept: string
  posteriorMean: number
  posteriorSd: number
  credibleLow: number
  credibleHigh: number
}

export type MockAuditEvent = {
  id: string
  occurredAt: string
  observe: string
  analyze: string
  act: string
  summary: string
}

// ── Data ──

export const TOPICS: MockTopic[] = [
  // ── Mathematics ──
  {
    id: "topic-1",
    name: "Linear Algebra",
    domain: "Mathematics",
    parentGroup: "Mathematics",
    icon: "Table2",
    fileCount: 12,
    projects: [
      { id: "proj-1", name: "Midterm Exam Prep", goalType: "exam", mastery: 0.55, masteryUncertainty: 0.12, minutesPerDay: 45, daysPerWeek: 5, deadline: "2026-03-28" },
      { id: "proj-2", name: "Deep Dive - Eigenvalues", goalType: "fluency", mastery: 0.38, masteryUncertainty: 0.18, minutesPerDay: 30, daysPerWeek: 3, deadline: "" },
    ],
    guideBlocks: [
      { id: "gb-1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 25, description: "Matrix operations review -- 8 retrieval items", completed: true },
      { id: "gb-2", dayIndex: 1, blockType: "metacog_routine", plannedMinutes: 10, description: "Confidence calibration exercise", completed: true },
      { id: "gb-3", dayIndex: 2, blockType: "core_practice", plannedMinutes: 30, description: "Vector spaces and subspaces -- 6 application items", completed: true },
      { id: "gb-4", dayIndex: 2, blockType: "skill_builder", plannedMinutes: 10, description: "Time management: Pomodoro technique refresher", completed: false },
      { id: "gb-5", dayIndex: 3, blockType: "core_practice", plannedMinutes: 30, description: "Eigenvalues and eigenvectors -- 4 worked examples + 6 items", completed: false },
      { id: "gb-6", dayIndex: 3, blockType: "metacog_routine", plannedMinutes: 15, description: "Prediction-reflection loop on eigenvalue problems", completed: false },
      { id: "gb-7", dayIndex: 4, blockType: "core_practice", plannedMinutes: 25, description: "Diagonalization -- 8 near-transfer items", completed: false },
      { id: "gb-8", dayIndex: 5, blockType: "core_practice", plannedMinutes: 30, description: "Mixed practice -- eigenvalues, determinants, linear transforms", completed: false },
    ],
    chatHistory: [
      { id: "msg-1", role: "user", content: "Can you help me review eigenvectors before the midterm?", timestamp: "2026-03-03T14:30:00Z" },
      { id: "msg-2", role: "assistant", content: "Of course! Based on your profile, your mastery of eigenvectors is at 0.48 (moderate confidence). Let me create a focused review set.", timestamp: "2026-03-03T14:30:15Z" },
      { id: "msg-3", role: "user", content: "That makes sense. I do feel like I know it better than I actually do.", timestamp: "2026-03-03T14:31:00Z" },
      { id: "msg-4", role: "assistant", content: "That's great self-awareness! I've generated a flashcard set of 12 cards covering eigenvalue computation, eigenvector properties, and diagonalization.", timestamp: "2026-03-03T14:31:20Z" },
    ],
    masteryData: [
      { id: "m-1", concept: "Matrix Operations", posteriorMean: 0.72, posteriorSd: 0.08, credibleLow: 0.58, credibleHigh: 0.86 },
      { id: "m-2", concept: "Vector Spaces", posteriorMean: 0.61, posteriorSd: 0.11, credibleLow: 0.42, credibleHigh: 0.80 },
      { id: "m-3", concept: "Eigenvalues", posteriorMean: 0.48, posteriorSd: 0.14, credibleLow: 0.24, credibleHigh: 0.72 },
      { id: "m-4", concept: "Eigenvectors", posteriorMean: 0.45, posteriorSd: 0.15, credibleLow: 0.20, credibleHigh: 0.70 },
      { id: "m-5", concept: "Diagonalization", posteriorMean: 0.32, posteriorSd: 0.18, credibleLow: 0.08, credibleHigh: 0.56 },
      { id: "m-6", concept: "Linear Transforms", posteriorMean: 0.58, posteriorSd: 0.10, credibleLow: 0.40, credibleHigh: 0.76 },
      { id: "m-7", concept: "Determinants", posteriorMean: 0.68, posteriorSd: 0.09, credibleLow: 0.52, credibleHigh: 0.84 },
    ],
    files: [
      { id: "f-1", filename: "Chapter 5 - Eigenvalues.pdf", mimeType: "application/pdf", sizeBytes: 2_400_000, uploadedAt: "2026-02-20", scope: "topic" },
      { id: "f-2", filename: "Lecture 12 Notes.md", mimeType: "text/markdown", sizeBytes: 18_200, uploadedAt: "2026-02-25", scope: "topic" },
      { id: "f-3", filename: "Practice Midterm 2025.pdf", mimeType: "application/pdf", sizeBytes: 5_100_000, uploadedAt: "2026-03-01", scope: "project" },
      { id: "f-4", filename: "Eigenvector Cheat Sheet.md", mimeType: "text/markdown", sizeBytes: 8_400, uploadedAt: "2026-03-02", scope: "project" },
    ],
  },
  {
    id: "topic-2", name: "Calculus III", domain: "Mathematics", parentGroup: "Mathematics", icon: "TrendingUp", fileCount: 8,
    projects: [{ id: "proj-3", name: "Final Exam Prep", goalType: "exam", mastery: 0.42, masteryUncertainty: 0.15, minutesPerDay: 40, daysPerWeek: 5, deadline: "2026-04-15" }],
    guideBlocks: [
      { id: "gb-c1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 30, description: "Double integrals -- region sketching + 6 problems", completed: true },
      { id: "gb-c2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 25, description: "Triple integrals -- coordinate systems", completed: false },
      { id: "gb-c3", dayIndex: 3, blockType: "metacog_routine", plannedMinutes: 15, description: "Stokes' theorem concept mapping", completed: false },
    ],
    chatHistory: [
      { id: "msg-c1", role: "user", content: "I keep mixing up when to use cylindrical vs spherical coordinates.", timestamp: "2026-03-02T10:00:00Z" },
      { id: "msg-c2", role: "assistant", content: "Great question! Here's a quick decision framework: use cylindrical when the region has circular symmetry around one axis, and spherical when it's symmetric around a point.", timestamp: "2026-03-02T10:01:00Z" },
    ],
    masteryData: [
      { id: "mc-1", concept: "Double Integrals", posteriorMean: 0.65, posteriorSd: 0.10, credibleLow: 0.48, credibleHigh: 0.82 },
      { id: "mc-2", concept: "Triple Integrals", posteriorMean: 0.38, posteriorSd: 0.16, credibleLow: 0.12, credibleHigh: 0.64 },
      { id: "mc-3", concept: "Stokes' Theorem", posteriorMean: 0.25, posteriorSd: 0.20, credibleLow: 0.05, credibleHigh: 0.55 },
    ],
    files: [{ id: "fc-1", filename: "Multivariable Calculus Notes.pdf", mimeType: "application/pdf", sizeBytes: 3_100_000, uploadedAt: "2026-02-18", scope: "topic" }],
  },
  {
    id: "topic-3", name: "Probability & Statistics", domain: "Mathematics", parentGroup: "Mathematics", icon: "BarChart3", fileCount: 5,
    projects: [{ id: "proj-4", name: "Bayesian Thinking", goalType: "fluency", mastery: 0.30, masteryUncertainty: 0.20, minutesPerDay: 25, daysPerWeek: 3, deadline: "" }],
    guideBlocks: [
      { id: "gb-p1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 25, description: "Bayes' theorem -- 5 worked examples", completed: false },
      { id: "gb-p2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 20, description: "Prior/posterior distributions -- intuition building", completed: false },
    ],
    chatHistory: [
      { id: "msg-p1", role: "user", content: "Can you explain conjugate priors simply?", timestamp: "2026-03-01T16:00:00Z" },
      { id: "msg-p2", role: "assistant", content: "Think of conjugate priors as a convenient shortcut: when your prior and likelihood 'match' mathematically, the posterior stays in the same family. It's like adding more data to a running average.", timestamp: "2026-03-01T16:01:00Z" },
    ],
    masteryData: [
      { id: "mp-1", concept: "Bayes' Theorem", posteriorMean: 0.40, posteriorSd: 0.15, credibleLow: 0.15, credibleHigh: 0.65 },
      { id: "mp-2", concept: "Distributions", posteriorMean: 0.35, posteriorSd: 0.18, credibleLow: 0.08, credibleHigh: 0.62 },
    ],
    files: [{ id: "fp-1", filename: "Bayesian Stats Intro.pdf", mimeType: "application/pdf", sizeBytes: 1_800_000, uploadedAt: "2026-02-22", scope: "topic" }],
  },
  // ── Computer Science ──
  {
    id: "topic-4", name: "Machine Learning", domain: "Computer Science", parentGroup: "Computer Science", icon: "Brain", fileCount: 7,
    projects: [
      { id: "proj-5", name: "Career Switch Fundamentals", goalType: "fluency", mastery: 0.22, masteryUncertainty: 0.25, minutesPerDay: 30, daysPerWeek: 4, deadline: "" },
      { id: "proj-6", name: "Kaggle Competition", goalType: "project", mastery: 0.15, masteryUncertainty: 0.28, minutesPerDay: 45, daysPerWeek: 3, deadline: "2026-04-30" },
    ],
    guideBlocks: [
      { id: "gb-ml1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 30, description: "Supervised learning fundamentals -- decision trees", completed: true },
      { id: "gb-ml2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 35, description: "Gradient descent -- intuition + math", completed: false },
      { id: "gb-ml3", dayIndex: 3, blockType: "skill_builder", plannedMinutes: 20, description: "Scikit-learn API walkthrough", completed: false },
    ],
    chatHistory: [
      { id: "msg-ml1", role: "user", content: "What's the difference between bagging and boosting?", timestamp: "2026-03-02T09:00:00Z" },
      { id: "msg-ml2", role: "assistant", content: "Bagging trains models in parallel on random subsets and averages them (reduces variance). Boosting trains sequentially, each model fixing the previous one's errors (reduces bias). Random Forest = bagging, XGBoost = boosting.", timestamp: "2026-03-02T09:01:00Z" },
    ],
    masteryData: [
      { id: "mml-1", concept: "Supervised Learning", posteriorMean: 0.35, posteriorSd: 0.18, credibleLow: 0.08, credibleHigh: 0.62 },
      { id: "mml-2", concept: "Neural Networks", posteriorMean: 0.18, posteriorSd: 0.22, credibleLow: 0.02, credibleHigh: 0.48 },
      { id: "mml-3", concept: "Gradient Descent", posteriorMean: 0.28, posteriorSd: 0.20, credibleLow: 0.05, credibleHigh: 0.55 },
    ],
    files: [
      { id: "fml-1", filename: "ML Roadmap.md", mimeType: "text/markdown", sizeBytes: 12_000, uploadedAt: "2026-02-15", scope: "topic" },
      { id: "fml-2", filename: "Andrew Ng Course Notes.pdf", mimeType: "application/pdf", sizeBytes: 4_500_000, uploadedAt: "2026-02-20", scope: "topic" },
    ],
  },
  {
    id: "topic-5", name: "Data Structures", domain: "Computer Science", parentGroup: "Computer Science", icon: "Braces", fileCount: 9,
    projects: [{ id: "proj-7", name: "Interview Prep", goalType: "exam", mastery: 0.60, masteryUncertainty: 0.10, minutesPerDay: 40, daysPerWeek: 5, deadline: "2026-03-20" }],
    guideBlocks: [
      { id: "gb-ds1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 30, description: "Binary trees -- traversals + 5 LeetCode problems", completed: true },
      { id: "gb-ds2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 35, description: "Graph algorithms -- BFS/DFS", completed: true },
      { id: "gb-ds3", dayIndex: 3, blockType: "core_practice", plannedMinutes: 30, description: "Dynamic programming -- tabulation vs memoization", completed: false },
    ],
    chatHistory: [
      { id: "msg-ds1", role: "user", content: "When should I use a heap vs a balanced BST?", timestamp: "2026-03-03T11:00:00Z" },
      { id: "msg-ds2", role: "assistant", content: "Heap if you only need min/max quickly (O(1) peek). BST if you need ordered traversal, rank queries, or range searches. Heaps are simpler and faster for priority queues.", timestamp: "2026-03-03T11:01:00Z" },
    ],
    masteryData: [
      { id: "mds-1", concept: "Arrays & Strings", posteriorMean: 0.78, posteriorSd: 0.06, credibleLow: 0.68, credibleHigh: 0.88 },
      { id: "mds-2", concept: "Trees", posteriorMean: 0.65, posteriorSd: 0.10, credibleLow: 0.48, credibleHigh: 0.82 },
      { id: "mds-3", concept: "Graphs", posteriorMean: 0.52, posteriorSd: 0.13, credibleLow: 0.30, credibleHigh: 0.74 },
      { id: "mds-4", concept: "Dynamic Programming", posteriorMean: 0.40, posteriorSd: 0.16, credibleLow: 0.14, credibleHigh: 0.66 },
    ],
    files: [
      { id: "fds-1", filename: "Blind 75 Checklist.md", mimeType: "text/markdown", sizeBytes: 5_200, uploadedAt: "2026-02-10", scope: "topic" },
      { id: "fds-2", filename: "Graph Patterns.pdf", mimeType: "application/pdf", sizeBytes: 2_800_000, uploadedAt: "2026-02-28", scope: "project" },
    ],
  },
  {
    id: "topic-6", name: "Systems Design", domain: "Computer Science", parentGroup: "Computer Science", icon: "Settings", fileCount: 4,
    projects: [{ id: "proj-8", name: "Teach Back Series", goalType: "teach", mastery: 0.45, masteryUncertainty: 0.15, minutesPerDay: 20, daysPerWeek: 2, deadline: "" }],
    guideBlocks: [
      { id: "gb-sd1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 25, description: "URL shortener design -- constraints + API", completed: true },
      { id: "gb-sd2", dayIndex: 3, blockType: "core_practice", plannedMinutes: 30, description: "Chat system design -- message delivery", completed: false },
    ],
    chatHistory: [
      { id: "msg-sd1", role: "user", content: "How do I explain CAP theorem to someone new?", timestamp: "2026-03-01T14:00:00Z" },
      { id: "msg-sd2", role: "assistant", content: "Use the 'network partition' framing: when a network split happens, you must choose between consistency (all nodes see the same data) or availability (every request gets a response). You can't have both during a partition.", timestamp: "2026-03-01T14:01:00Z" },
    ],
    masteryData: [
      { id: "msd-1", concept: "Load Balancing", posteriorMean: 0.55, posteriorSd: 0.12, credibleLow: 0.35, credibleHigh: 0.75 },
      { id: "msd-2", concept: "Caching", posteriorMean: 0.50, posteriorSd: 0.14, credibleLow: 0.28, credibleHigh: 0.72 },
    ],
    files: [{ id: "fsd-1", filename: "System Design Template.md", mimeType: "text/markdown", sizeBytes: 6_800, uploadedAt: "2026-02-25", scope: "topic" }],
  },
  // ── Sciences ──
  {
    id: "topic-7", name: "Organic Chemistry", domain: "Chemistry", parentGroup: "Sciences", icon: "FlipHorizontal", fileCount: 6,
    projects: [{ id: "proj-9", name: "Reaction Mechanisms", goalType: "fluency", mastery: 0.33, masteryUncertainty: 0.19, minutesPerDay: 35, daysPerWeek: 4, deadline: "" }],
    guideBlocks: [
      { id: "gb-oc1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 30, description: "SN1 vs SN2 -- decision framework + 8 problems", completed: false },
      { id: "gb-oc2", dayIndex: 2, blockType: "metacog_routine", plannedMinutes: 15, description: "Reaction mechanism prediction exercise", completed: false },
    ],
    chatHistory: [
      { id: "msg-oc1", role: "user", content: "I always confuse E1 and E2 eliminations.", timestamp: "2026-03-02T15:00:00Z" },
      { id: "msg-oc2", role: "assistant", content: "Key distinction: E2 is one-step (strong base, anti-periplanar geometry required). E1 is two-step (weak base, carbocation intermediate). Think: E2 = everything at once, E1 = leave first, then eliminate.", timestamp: "2026-03-02T15:01:00Z" },
    ],
    masteryData: [
      { id: "moc-1", concept: "Substitution Reactions", posteriorMean: 0.42, posteriorSd: 0.15, credibleLow: 0.18, credibleHigh: 0.66 },
      { id: "moc-2", concept: "Elimination Reactions", posteriorMean: 0.28, posteriorSd: 0.19, credibleLow: 0.04, credibleHigh: 0.56 },
    ],
    files: [{ id: "foc-1", filename: "Reaction Mechanisms Cheat Sheet.pdf", mimeType: "application/pdf", sizeBytes: 1_900_000, uploadedAt: "2026-02-20", scope: "topic" }],
  },
  {
    id: "topic-8", name: "Quantum Mechanics", domain: "Physics", parentGroup: "Sciences", icon: "AudioLines", fileCount: 3,
    projects: [{ id: "proj-10", name: "Conceptual Foundations", goalType: "fluency", mastery: 0.18, masteryUncertainty: 0.25, minutesPerDay: 25, daysPerWeek: 3, deadline: "" }],
    guideBlocks: [{ id: "gb-qm1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 25, description: "Wave-particle duality -- thought experiments", completed: false }],
    chatHistory: [
      { id: "msg-qm1", role: "user", content: "What does the Schrodinger equation actually tell us?", timestamp: "2026-02-28T12:00:00Z" },
      { id: "msg-qm2", role: "assistant", content: "It describes how a quantum system's wave function evolves over time. Think of it as Newton's F=ma but for probability amplitudes -- it tells you the 'trajectory' of possibilities, not certainties.", timestamp: "2026-02-28T12:01:00Z" },
    ],
    masteryData: [{ id: "mqm-1", concept: "Wave Functions", posteriorMean: 0.22, posteriorSd: 0.20, credibleLow: 0.02, credibleHigh: 0.52 }],
    files: [{ id: "fqm-1", filename: "Griffiths Ch1 Notes.pdf", mimeType: "application/pdf", sizeBytes: 2_200_000, uploadedAt: "2026-02-15", scope: "topic" }],
  },
  // ── Languages ──
  {
    id: "topic-9", name: "Spanish B2", domain: "Languages", parentGroup: "Languages", icon: "MessageSquare", fileCount: 4,
    projects: [{ id: "proj-11", name: "DELE B2 Prep", goalType: "exam", mastery: 0.48, masteryUncertainty: 0.14, minutesPerDay: 30, daysPerWeek: 6, deadline: "2026-05-10" }],
    guideBlocks: [
      { id: "gb-sp1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 20, description: "Subjunctive mood -- trigger phrases + 10 fill-in exercises", completed: true },
      { id: "gb-sp2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 25, description: "Listening comprehension -- podcast shadowing", completed: false },
    ],
    chatHistory: [
      { id: "msg-sp1", role: "user", content: "When do I use subjunctive vs indicative?", timestamp: "2026-03-03T08:00:00Z" },
      { id: "msg-sp2", role: "assistant", content: "Rule of thumb: subjunctive for wishes, doubts, emotions, and hypotheticals (WEIRDO: Wishes, Emotions, Impersonal expressions, Recommendations, Doubt/Denial, Ojala). Indicative for facts and certainty.", timestamp: "2026-03-03T08:01:00Z" },
    ],
    masteryData: [
      { id: "msp-1", concept: "Subjunctive Mood", posteriorMean: 0.50, posteriorSd: 0.12, credibleLow: 0.30, credibleHigh: 0.70 },
      { id: "msp-2", concept: "Listening Comp.", posteriorMean: 0.45, posteriorSd: 0.14, credibleLow: 0.22, credibleHigh: 0.68 },
    ],
    files: [{ id: "fsp-1", filename: "DELE B2 Vocab List.md", mimeType: "text/markdown", sizeBytes: 15_000, uploadedAt: "2026-02-10", scope: "topic" }],
  },
  {
    id: "topic-10", name: "Mandarin HSK4", domain: "Languages", parentGroup: "Languages", icon: "Pencil", fileCount: 3,
    projects: [{ id: "proj-12", name: "Character Recognition", goalType: "fluency", mastery: 0.35, masteryUncertainty: 0.18, minutesPerDay: 20, daysPerWeek: 5, deadline: "" }],
    guideBlocks: [{ id: "gb-mn1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 20, description: "Radical review -- 30 characters spaced repetition", completed: false }],
    chatHistory: [
      { id: "msg-mn1", role: "user", content: "Any tips for remembering tone pairs?", timestamp: "2026-03-01T07:00:00Z" },
      { id: "msg-mn2", role: "assistant", content: "Practice tone pairs as units rather than individual tones. Record yourself saying common pairs and compare with native audio. The 3-3 tone sandhi (becomes 2-3) trips up most learners -- drill those first.", timestamp: "2026-03-01T07:01:00Z" },
    ],
    masteryData: [
      { id: "mmn-1", concept: "Characters (600)", posteriorMean: 0.38, posteriorSd: 0.16, credibleLow: 0.12, credibleHigh: 0.64 },
      { id: "mmn-2", concept: "Tone Accuracy", posteriorMean: 0.30, posteriorSd: 0.18, credibleLow: 0.04, credibleHigh: 0.58 },
    ],
    files: [{ id: "fmn-1", filename: "HSK4 Word List.pdf", mimeType: "application/pdf", sizeBytes: 800_000, uploadedAt: "2026-02-12", scope: "topic" }],
  },
  // ── Law & Medicine ──
  {
    id: "topic-11", name: "Legal Medicine", domain: "Forensic Science", parentGroup: "Law & Medicine", icon: "Stethoscope", fileCount: 8,
    projects: [
      { id: "proj-13", name: "Forensic Pathology Exam", goalType: "exam", mastery: 0.42, masteryUncertainty: 0.16, minutesPerDay: 40, daysPerWeek: 5, deadline: "2026-04-20" },
      { id: "proj-14", name: "Expert Witness Preparation", goalType: "fluency", mastery: 0.28, masteryUncertainty: 0.22, minutesPerDay: 30, daysPerWeek: 3, deadline: "" },
    ],
    guideBlocks: [
      { id: "gb-lm1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 35, description: "Cause vs manner of death -- 6 case studies", completed: true },
      { id: "gb-lm2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 30, description: "Toxicology principles -- pharmacokinetics in forensic context", completed: false },
      { id: "gb-lm3", dayIndex: 3, blockType: "metacog_routine", plannedMinutes: 15, description: "Chain of custody documentation exercise", completed: false },
    ],
    chatHistory: [
      { id: "msg-lm1", role: "user", content: "What's the difference between cause and manner of death?", timestamp: "2026-03-02T10:00:00Z" },
      { id: "msg-lm2", role: "assistant", content: "Cause of death is the medical reason (e.g., myocardial infarction, gunshot wound). Manner of death is the circumstantial classification: natural, accident, suicide, homicide, or undetermined.", timestamp: "2026-03-02T10:01:00Z" },
    ],
    masteryData: [
      { id: "mlm-1", concept: "Forensic Pathology", posteriorMean: 0.45, posteriorSd: 0.14, credibleLow: 0.22, credibleHigh: 0.68 },
      { id: "mlm-2", concept: "Toxicology", posteriorMean: 0.35, posteriorSd: 0.18, credibleLow: 0.08, credibleHigh: 0.62 },
      { id: "mlm-3", concept: "Wound Analysis", posteriorMean: 0.40, posteriorSd: 0.16, credibleLow: 0.14, credibleHigh: 0.66 },
      { id: "mlm-4", concept: "Death Certification", posteriorMean: 0.52, posteriorSd: 0.12, credibleLow: 0.32, credibleHigh: 0.72 },
    ],
    files: [
      { id: "flm-1", filename: "Forensic Pathology Handbook.pdf", mimeType: "application/pdf", sizeBytes: 5_200_000, uploadedAt: "2026-02-10", scope: "topic" },
      { id: "flm-2", filename: "Toxicology Case Studies.md", mimeType: "text/markdown", sizeBytes: 24_000, uploadedAt: "2026-02-18", scope: "topic" },
    ],
  },
  {
    id: "topic-12", name: "Constitutional Law", domain: "Law", parentGroup: "Law & Medicine", icon: "Scale", fileCount: 10,
    projects: [
      { id: "proj-15", name: "1L Con Law Final", goalType: "exam", mastery: 0.50, masteryUncertainty: 0.14, minutesPerDay: 50, daysPerWeek: 6, deadline: "2026-05-05" },
      { id: "proj-16", name: "Moot Court Brief", goalType: "project", mastery: 0.38, masteryUncertainty: 0.18, minutesPerDay: 35, daysPerWeek: 4, deadline: "2026-04-01" },
    ],
    guideBlocks: [
      { id: "gb-cl1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 40, description: "Commerce Clause doctrine -- 4 landmark cases", completed: true },
      { id: "gb-cl2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 35, description: "Due Process -- substantive vs procedural", completed: true },
      { id: "gb-cl3", dayIndex: 3, blockType: "core_practice", plannedMinutes: 40, description: "Equal Protection analysis -- tiers of scrutiny", completed: false },
      { id: "gb-cl4", dayIndex: 4, blockType: "metacog_routine", plannedMinutes: 20, description: "Issue-spotting practice exam under timed conditions", completed: false },
    ],
    chatHistory: [
      { id: "msg-cl1", role: "user", content: "How do I remember the tiers of scrutiny?", timestamp: "2026-03-03T09:00:00Z" },
      { id: "msg-cl2", role: "assistant", content: "Think RIS: Rational basis (most laws, easy to pass), Intermediate scrutiny (gender), and Strict scrutiny (race, religion). The burden shifts as you go up.", timestamp: "2026-03-03T09:01:00Z" },
    ],
    masteryData: [
      { id: "mcl-1", concept: "Judicial Review", posteriorMean: 0.62, posteriorSd: 0.10, credibleLow: 0.45, credibleHigh: 0.79 },
      { id: "mcl-2", concept: "Commerce Clause", posteriorMean: 0.55, posteriorSd: 0.12, credibleLow: 0.35, credibleHigh: 0.75 },
      { id: "mcl-3", concept: "Due Process", posteriorMean: 0.48, posteriorSd: 0.14, credibleLow: 0.24, credibleHigh: 0.72 },
      { id: "mcl-4", concept: "Equal Protection", posteriorMean: 0.42, posteriorSd: 0.16, credibleLow: 0.16, credibleHigh: 0.68 },
      { id: "mcl-5", concept: "First Amendment", posteriorMean: 0.58, posteriorSd: 0.11, credibleLow: 0.40, credibleHigh: 0.76 },
    ],
    files: [
      { id: "fcl-1", filename: "Con Law Outline.md", mimeType: "text/markdown", sizeBytes: 42_000, uploadedAt: "2026-02-05", scope: "topic" },
      { id: "fcl-2", filename: "Commerce Clause Cases.pdf", mimeType: "application/pdf", sizeBytes: 3_800_000, uploadedAt: "2026-02-15", scope: "project" },
    ],
  },
  {
    id: "topic-13", name: "Bioethics", domain: "Ethics", parentGroup: "Law & Medicine", icon: "Shield", fileCount: 5,
    projects: [{ id: "proj-17", name: "Ethics Seminar Paper", goalType: "project", mastery: 0.35, masteryUncertainty: 0.20, minutesPerDay: 30, daysPerWeek: 3, deadline: "2026-04-15" }],
    guideBlocks: [
      { id: "gb-be1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 30, description: "Autonomy vs beneficence -- 3 clinical dilemmas", completed: true },
      { id: "gb-be2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 25, description: "Informed consent -- landmark cases and edge cases", completed: false },
      { id: "gb-be3", dayIndex: 3, blockType: "metacog_routine", plannedMinutes: 15, description: "Ethical reasoning framework self-assessment", completed: false },
    ],
    chatHistory: [
      { id: "msg-be1", role: "user", content: "How do the four principles of bioethics interact when they conflict?", timestamp: "2026-03-01T11:00:00Z" },
      { id: "msg-be2", role: "assistant", content: "Beauchamp & Childress's four principles are prima facie -- none automatically trumps the others. When they conflict, you weigh context.", timestamp: "2026-03-01T11:01:00Z" },
    ],
    masteryData: [
      { id: "mbe-1", concept: "Four Principles", posteriorMean: 0.48, posteriorSd: 0.14, credibleLow: 0.24, credibleHigh: 0.72 },
      { id: "mbe-2", concept: "Informed Consent", posteriorMean: 0.38, posteriorSd: 0.17, credibleLow: 0.10, credibleHigh: 0.66 },
      { id: "mbe-3", concept: "Research Ethics", posteriorMean: 0.30, posteriorSd: 0.20, credibleLow: 0.04, credibleHigh: 0.58 },
    ],
    files: [{ id: "fbe-1", filename: "Beauchamp & Childress Summary.pdf", mimeType: "application/pdf", sizeBytes: 2_600_000, uploadedAt: "2026-02-12", scope: "topic" }],
  },
  // ── Economics ──
  {
    id: "topic-14", name: "Microeconomics", domain: "Economics", parentGroup: "Economics", icon: "DollarSign", fileCount: 7,
    projects: [{ id: "proj-18", name: "Econ 101 Midterm", goalType: "exam", mastery: 0.55, masteryUncertainty: 0.12, minutesPerDay: 35, daysPerWeek: 5, deadline: "2026-03-25" }],
    guideBlocks: [
      { id: "gb-me1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 30, description: "Supply and demand -- elasticity problems", completed: true },
      { id: "gb-me2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 30, description: "Market structures -- perfect competition vs monopoly", completed: false },
    ],
    chatHistory: [
      { id: "msg-me1", role: "user", content: "When is a market Pareto efficient?", timestamp: "2026-03-02T14:00:00Z" },
      { id: "msg-me2", role: "assistant", content: "A market outcome is Pareto efficient when no one can be made better off without making someone else worse off.", timestamp: "2026-03-02T14:01:00Z" },
    ],
    masteryData: [
      { id: "mme-1", concept: "Supply & Demand", posteriorMean: 0.68, posteriorSd: 0.09, credibleLow: 0.52, credibleHigh: 0.84 },
      { id: "mme-2", concept: "Elasticity", posteriorMean: 0.55, posteriorSd: 0.12, credibleLow: 0.35, credibleHigh: 0.75 },
      { id: "mme-3", concept: "Market Structures", posteriorMean: 0.42, posteriorSd: 0.15, credibleLow: 0.18, credibleHigh: 0.66 },
      { id: "mme-4", concept: "Game Theory", posteriorMean: 0.30, posteriorSd: 0.19, credibleLow: 0.04, credibleHigh: 0.58 },
    ],
    files: [
      { id: "fme-1", filename: "Mankiw Ch4-6 Notes.pdf", mimeType: "application/pdf", sizeBytes: 3_400_000, uploadedAt: "2026-02-08", scope: "topic" },
      { id: "fme-2", filename: "Elasticity Problem Set.md", mimeType: "text/markdown", sizeBytes: 9_600, uploadedAt: "2026-02-20", scope: "project" },
    ],
  },
  {
    id: "topic-15", name: "Macroeconomics", domain: "Economics", parentGroup: "Economics", icon: "TrendingUp", fileCount: 6,
    projects: [{ id: "proj-19", name: "IS-LM Model Mastery", goalType: "fluency", mastery: 0.32, masteryUncertainty: 0.20, minutesPerDay: 30, daysPerWeek: 4, deadline: "" }],
    guideBlocks: [
      { id: "gb-ma1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 30, description: "GDP accounting -- expenditure vs income approach", completed: true },
      { id: "gb-ma2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 35, description: "IS-LM model -- deriving equilibrium", completed: false },
    ],
    chatHistory: [
      { id: "msg-ma1", role: "user", content: "Why does expansionary fiscal policy shift the IS curve right?", timestamp: "2026-03-01T15:00:00Z" },
      { id: "msg-ma2", role: "assistant", content: "Government spending (G) is a component of aggregate demand. When G increases, for any given interest rate, total output demanded is higher.", timestamp: "2026-03-01T15:01:00Z" },
    ],
    masteryData: [
      { id: "mma-1", concept: "GDP & National Accounts", posteriorMean: 0.50, posteriorSd: 0.13, credibleLow: 0.28, credibleHigh: 0.72 },
      { id: "mma-2", concept: "IS-LM Model", posteriorMean: 0.28, posteriorSd: 0.20, credibleLow: 0.04, credibleHigh: 0.56 },
      { id: "mma-3", concept: "Monetary Policy", posteriorMean: 0.35, posteriorSd: 0.17, credibleLow: 0.08, credibleHigh: 0.62 },
    ],
    files: [{ id: "fma-1", filename: "Blanchard Macro Notes.pdf", mimeType: "application/pdf", sizeBytes: 4_100_000, uploadedAt: "2026-02-14", scope: "topic" }],
  },
  // ── Humanities ──
  {
    id: "topic-16", name: "Political Philosophy", domain: "Philosophy", parentGroup: "Humanities", icon: "ScrollText", fileCount: 6,
    projects: [{ id: "proj-20", name: "Justice & Equality Paper", goalType: "project", mastery: 0.40, masteryUncertainty: 0.18, minutesPerDay: 35, daysPerWeek: 4, deadline: "2026-04-10" }],
    guideBlocks: [
      { id: "gb-pp1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 30, description: "Social contract theory -- Hobbes, Locke, Rousseau comparison", completed: true },
      { id: "gb-pp2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 35, description: "Rawls' Theory of Justice -- veil of ignorance", completed: false },
    ],
    chatHistory: [
      { id: "msg-pp1", role: "user", content: "What's the difference between Rawls and Nozick on justice?", timestamp: "2026-03-02T16:00:00Z" },
      { id: "msg-pp2", role: "assistant", content: "Rawls (justice as fairness): rational agents behind a 'veil of ignorance' would choose equal basic liberties. Nozick (entitlement theory): justice is about how you got what you have, not the pattern.", timestamp: "2026-03-02T16:01:00Z" },
    ],
    masteryData: [
      { id: "mpp-1", concept: "Social Contract", posteriorMean: 0.52, posteriorSd: 0.12, credibleLow: 0.32, credibleHigh: 0.72 },
      { id: "mpp-2", concept: "Rawlsian Justice", posteriorMean: 0.38, posteriorSd: 0.16, credibleLow: 0.12, credibleHigh: 0.64 },
      { id: "mpp-3", concept: "Libertarianism", posteriorMean: 0.35, posteriorSd: 0.18, credibleLow: 0.08, credibleHigh: 0.62 },
    ],
    files: [
      { id: "fpp-1", filename: "Theory of Justice Summary.pdf", mimeType: "application/pdf", sizeBytes: 2_900_000, uploadedAt: "2026-02-10", scope: "topic" },
      { id: "fpp-2", filename: "Nozick vs Rawls Comparison.md", mimeType: "text/markdown", sizeBytes: 14_000, uploadedAt: "2026-02-22", scope: "topic" },
    ],
  },
  {
    id: "topic-17", name: "Comparative Literature", domain: "Literature", parentGroup: "Humanities", icon: "GraduationCap", fileCount: 5,
    projects: [{ id: "proj-21", name: "Modernism Seminar Paper", goalType: "project", mastery: 0.45, masteryUncertainty: 0.16, minutesPerDay: 30, daysPerWeek: 4, deadline: "2026-04-18" }],
    guideBlocks: [
      { id: "gb-lt1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 30, description: "Close reading -- Joyce's Ulysses Ch. 1-3", completed: true },
      { id: "gb-lt2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 25, description: "Comparative analysis -- Kafka vs Camus on absurdism", completed: false },
    ],
    chatHistory: [
      { id: "msg-lt1", role: "user", content: "How do I compare themes across different literary traditions?", timestamp: "2026-03-01T13:00:00Z" },
      { id: "msg-lt2", role: "assistant", content: "Start with a shared theme (e.g., alienation), then analyze how each tradition's cultural context shapes its expression.", timestamp: "2026-03-01T13:01:00Z" },
    ],
    masteryData: [
      { id: "mlt-1", concept: "Close Reading", posteriorMean: 0.55, posteriorSd: 0.12, credibleLow: 0.35, credibleHigh: 0.75 },
      { id: "mlt-2", concept: "Modernist Literature", posteriorMean: 0.42, posteriorSd: 0.15, credibleLow: 0.18, credibleHigh: 0.66 },
      { id: "mlt-3", concept: "Critical Theory", posteriorMean: 0.30, posteriorSd: 0.19, credibleLow: 0.04, credibleHigh: 0.58 },
    ],
    files: [{ id: "flt-1", filename: "Modernism Reading List.md", mimeType: "text/markdown", sizeBytes: 8_200, uploadedAt: "2026-02-08", scope: "topic" }],
  },
  {
    id: "topic-18", name: "Art History", domain: "Art", parentGroup: "Humanities", icon: "PaintBucket", fileCount: 4,
    projects: [{ id: "proj-22", name: "Renaissance to Modern Survey", goalType: "exam", mastery: 0.38, masteryUncertainty: 0.18, minutesPerDay: 25, daysPerWeek: 3, deadline: "2026-04-25" }],
    guideBlocks: [
      { id: "gb-ah1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 25, description: "Renaissance masters -- Botticelli, da Vinci, Michelangelo", completed: true },
      { id: "gb-ah2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 25, description: "Impressionism -- Monet, Renoir, Degas visual analysis", completed: false },
    ],
    chatHistory: [
      { id: "msg-ah1", role: "user", content: "What distinguishes Baroque from Renaissance art?", timestamp: "2026-03-02T11:00:00Z" },
      { id: "msg-ah2", role: "assistant", content: "Renaissance emphasizes balance, harmony, and idealized forms. Baroque explodes that with drama: strong diagonals, chiaroscuro, emotional intensity, and movement.", timestamp: "2026-03-02T11:01:00Z" },
    ],
    masteryData: [
      { id: "mah-1", concept: "Renaissance", posteriorMean: 0.50, posteriorSd: 0.13, credibleLow: 0.28, credibleHigh: 0.72 },
      { id: "mah-2", concept: "Baroque & Rococo", posteriorMean: 0.35, posteriorSd: 0.17, credibleLow: 0.08, credibleHigh: 0.62 },
      { id: "mah-3", concept: "Modern Art", posteriorMean: 0.28, posteriorSd: 0.20, credibleLow: 0.04, credibleHigh: 0.56 },
    ],
    files: [{ id: "fah-1", filename: "Art Movements Timeline.pdf", mimeType: "application/pdf", sizeBytes: 6_800_000, uploadedAt: "2026-02-05", scope: "topic" }],
  },
  // ── Social Sciences ──
  {
    id: "topic-19", name: "Cognitive Psychology", domain: "Psychology", parentGroup: "Social Sciences", icon: "Brain", fileCount: 6,
    projects: [{ id: "proj-23", name: "Memory & Learning Final", goalType: "exam", mastery: 0.48, masteryUncertainty: 0.14, minutesPerDay: 35, daysPerWeek: 5, deadline: "2026-04-12" }],
    guideBlocks: [
      { id: "gb-cp1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 30, description: "Working memory models -- Baddeley & Hitch", completed: true },
      { id: "gb-cp2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 30, description: "Dual process theory -- System 1 vs System 2", completed: false },
    ],
    chatHistory: [
      { id: "msg-cp1", role: "user", content: "What's the testing effect and why does it work?", timestamp: "2026-03-03T10:00:00Z" },
      { id: "msg-cp2", role: "assistant", content: "The testing effect (retrieval practice): actively recalling information strengthens memory more than re-reading.", timestamp: "2026-03-03T10:01:00Z" },
    ],
    masteryData: [
      { id: "mcp-1", concept: "Memory Models", posteriorMean: 0.55, posteriorSd: 0.12, credibleLow: 0.35, credibleHigh: 0.75 },
      { id: "mcp-2", concept: "Attention", posteriorMean: 0.48, posteriorSd: 0.14, credibleLow: 0.24, credibleHigh: 0.72 },
      { id: "mcp-3", concept: "Decision Making", posteriorMean: 0.40, posteriorSd: 0.16, credibleLow: 0.14, credibleHigh: 0.66 },
      { id: "mcp-4", concept: "Cognitive Biases", posteriorMean: 0.52, posteriorSd: 0.13, credibleLow: 0.30, credibleHigh: 0.74 },
    ],
    files: [
      { id: "fcp-1", filename: "Kahneman - Thinking Fast Slow Notes.pdf", mimeType: "application/pdf", sizeBytes: 3_200_000, uploadedAt: "2026-02-12", scope: "topic" },
      { id: "fcp-2", filename: "Memory Models Comparison.md", mimeType: "text/markdown", sizeBytes: 11_000, uploadedAt: "2026-02-25", scope: "topic" },
    ],
  },
  {
    id: "topic-20", name: "International Relations", domain: "Political Science", parentGroup: "Social Sciences", icon: "Globe", fileCount: 5,
    projects: [{ id: "proj-24", name: "IR Theory Comprehensive", goalType: "exam", mastery: 0.40, masteryUncertainty: 0.17, minutesPerDay: 30, daysPerWeek: 4, deadline: "2026-04-20" }],
    guideBlocks: [
      { id: "gb-ir1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 30, description: "Realism vs liberalism -- core assumptions comparison", completed: true },
      { id: "gb-ir2", dayIndex: 2, blockType: "core_practice", plannedMinutes: 30, description: "Constructivism -- norms, identity, and international institutions", completed: false },
    ],
    chatHistory: [
      { id: "msg-ir1", role: "user", content: "How does constructivism differ from realism in IR?", timestamp: "2026-03-02T13:00:00Z" },
      { id: "msg-ir2", role: "assistant", content: "Realism: states are rational, self-interested actors in anarchy; power and security drive behavior. Constructivism: anarchy is 'what states make of it' (Wendt). Identities and norms shape interests.", timestamp: "2026-03-02T13:01:00Z" },
    ],
    masteryData: [
      { id: "mir-1", concept: "Realism", posteriorMean: 0.52, posteriorSd: 0.12, credibleLow: 0.32, credibleHigh: 0.72 },
      { id: "mir-2", concept: "Liberalism", posteriorMean: 0.45, posteriorSd: 0.14, credibleLow: 0.22, credibleHigh: 0.68 },
      { id: "mir-3", concept: "Constructivism", posteriorMean: 0.32, posteriorSd: 0.18, credibleLow: 0.06, credibleHigh: 0.60 },
    ],
    files: [{ id: "fir-1", filename: "IR Theory Comparison Chart.md", mimeType: "text/markdown", sizeBytes: 16_000, uploadedAt: "2026-02-15", scope: "topic" }],
  },
]
