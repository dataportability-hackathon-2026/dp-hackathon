// Artifact types and mock data store

export type ArtifactType =
  | "video"
  | "audio"
  | "mindmap"
  | "quiz"
  | "datatable"
  | "flashcards"
  | "report"
  | "infographic"
  | "slidedeck"
  | "spatial"

export type VideoArtifact = {
  id: string
  type: "video"
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  duration: string
  createdAt: string
}

export type AudioArtifact = {
  id: string
  type: "audio"
  title: string
  description: string
  audioUrl: string
  duration: string
  createdAt: string
}

export type MindMapNode = {
  id: string
  label: string
  parentId?: string
}

export type MindMapArtifact = {
  id: string
  type: "mindmap"
  title: string
  description: string
  nodes: MindMapNode[]
  createdAt: string
}

export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type QuizArtifact = {
  id: string
  type: "quiz"
  title: string
  description: string
  questions: QuizQuestion[]
  createdAt: string
}

export type DataTableRow = Record<string, string | number>

export type DataTableArtifact = {
  id: string
  type: "datatable"
  title: string
  description: string
  columns: { key: string; label: string }[]
  rows: DataTableRow[]
  createdAt: string
}

export type FlashcardItem = {
  id: string
  front: string
  back: string
}

export type FlashcardArtifact = {
  id: string
  type: "flashcards"
  title: string
  description: string
  cards: FlashcardItem[]
  createdAt: string
}

export type ReportArtifact = {
  id: string
  type: "report"
  title: string
  description: string
  sections: { heading: string; content: string }[]
  createdAt: string
}

export type InfographicArtifact = {
  id: string
  type: "infographic"
  title: string
  description: string
  stats: { label: string; value: string; color: string }[]
  createdAt: string
}

export type SlideArtifact = {
  id: string
  type: "slidedeck"
  title: string
  description: string
  slides: { title: string; bullets: string[] }[]
  createdAt: string
}

export type SpatialObject = {
  id: string
  label: string
  shape: "sphere" | "box" | "torus" | "cone" | "cylinder" | "dodecahedron" | "octahedron" | "icosahedron"
  position: [number, number, number]
  color: string
  scale?: number
  rotate?: boolean
}

export type SpatialConnection = {
  from: string
  to: string
  color?: string
}

export type SpatialArtifact = {
  id: string
  type: "spatial"
  title: string
  description: string
  objects: SpatialObject[]
  connections?: SpatialConnection[]
  autoRotate?: boolean
  createdAt: string
}

export type Artifact =
  | VideoArtifact
  | AudioArtifact
  | MindMapArtifact
  | QuizArtifact
  | DataTableArtifact
  | FlashcardArtifact
  | ReportArtifact
  | InfographicArtifact
  | SlideArtifact
  | SpatialArtifact

// ── Mock Data ──

export const MOCK_VIDEOS: VideoArtifact[] = [
  {
    id: "vid-1",
    type: "video",
    title: "Eigenvalues Explained Visually",
    description: "A visual walkthrough of eigenvalue computation for 2x2 and 3x3 matrices.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnailUrl: "",
    duration: "4:32",
    createdAt: "2026-03-03",
  },
  {
    id: "vid-2",
    type: "video",
    title: "Matrix Diagonalization Step-by-Step",
    description: "Complete worked example of diagonalizing a 3x3 matrix.",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    thumbnailUrl: "",
    duration: "7:15",
    createdAt: "2026-03-04",
  },
]

export const MOCK_AUDIO: AudioArtifact[] = [
  {
    id: "aud-1",
    type: "audio",
    title: "Linear Algebra Concepts Podcast",
    description: "Audio explanation of key concepts from Chapter 5.",
    audioUrl: "https://www.w3schools.com/html/horse.mp3",
    duration: "12:45",
    createdAt: "2026-03-02",
  },
  {
    id: "aud-2",
    type: "audio",
    title: "Eigenvector Mnemonics",
    description: "Memory aids for eigenvector properties.",
    audioUrl: "https://www.w3schools.com/html/horse.mp3",
    duration: "5:20",
    createdAt: "2026-03-03",
  },
]

export const MOCK_MINDMAPS: MindMapArtifact[] = [
  {
    id: "mm-1",
    type: "mindmap",
    title: "Linear Algebra Overview",
    description: "Complete concept map covering all major topics.",
    nodes: [
      { id: "n1", label: "Linear Algebra" },
      { id: "n2", label: "Vectors", parentId: "n1" },
      { id: "n3", label: "Matrices", parentId: "n1" },
      { id: "n4", label: "Eigenvalues", parentId: "n1" },
      { id: "n5", label: "Transforms", parentId: "n1" },
      { id: "n6", label: "Addition", parentId: "n2" },
      { id: "n7", label: "Dot Product", parentId: "n2" },
      { id: "n8", label: "Cross Product", parentId: "n2" },
      { id: "n9", label: "Multiplication", parentId: "n3" },
      { id: "n10", label: "Inverse", parentId: "n3" },
      { id: "n11", label: "Determinant", parentId: "n3" },
      { id: "n12", label: "Computation", parentId: "n4" },
      { id: "n13", label: "Eigenvectors", parentId: "n4" },
      { id: "n14", label: "Diagonalization", parentId: "n4" },
      { id: "n15", label: "Linear Maps", parentId: "n5" },
      { id: "n16", label: "Rotation", parentId: "n5" },
      { id: "n17", label: "Projection", parentId: "n5" },
    ],
    createdAt: "2026-03-01",
  },
]

export const MOCK_QUIZZES: QuizArtifact[] = [
  {
    id: "quiz-1",
    type: "quiz",
    title: "Eigenvalue Practice Quiz",
    description: "10 questions covering eigenvalue computation and properties.",
    questions: [
      {
        id: "q1",
        question: "What is the eigenvalue of the identity matrix I?",
        options: ["0", "1", "-1", "Undefined"],
        correctIndex: 1,
        explanation: "Every vector is an eigenvector of I with eigenvalue 1, since Iv = 1v.",
      },
      {
        id: "q2",
        question: "If A has eigenvalue 3, what eigenvalue does A^2 have for the same eigenvector?",
        options: ["3", "6", "9", "27"],
        correctIndex: 2,
        explanation: "If Av = 3v, then A^2v = A(Av) = A(3v) = 3Av = 9v.",
      },
      {
        id: "q3",
        question: "The characteristic polynomial of a 2x2 matrix is always degree:",
        options: ["1", "2", "3", "4"],
        correctIndex: 1,
        explanation: "For an nxn matrix, the characteristic polynomial det(A - lambda*I) has degree n.",
      },
      {
        id: "q4",
        question: "Which matrix property guarantees all real eigenvalues?",
        options: ["Invertible", "Symmetric", "Upper triangular", "Diagonal"],
        correctIndex: 1,
        explanation: "The spectral theorem guarantees symmetric matrices have all real eigenvalues.",
      },
    ],
    createdAt: "2026-03-03",
  },
  {
    id: "quiz-2",
    type: "quiz",
    title: "Matrix Operations Quiz",
    description: "Assessment on basic matrix operations and properties.",
    questions: [
      {
        id: "q5",
        question: "What is the rank of a 3x3 zero matrix?",
        options: ["0", "1", "2", "3"],
        correctIndex: 0,
        explanation: "The zero matrix has no linearly independent rows or columns, so rank = 0.",
      },
      {
        id: "q6",
        question: "If det(A) = 0, then A is:",
        options: ["Invertible", "Singular", "Orthogonal", "Symmetric"],
        correctIndex: 1,
        explanation: "A matrix with determinant 0 is singular (non-invertible).",
      },
    ],
    createdAt: "2026-03-04",
  },
]

export const MOCK_DATATABLES: DataTableArtifact[] = [
  {
    id: "dt-1",
    type: "datatable",
    title: "Concept Mastery Progress",
    description: "Tracking mastery scores over time for each concept.",
    columns: [
      { key: "concept", label: "Concept" },
      { key: "week1", label: "Week 1" },
      { key: "week2", label: "Week 2" },
      { key: "week3", label: "Week 3" },
      { key: "current", label: "Current" },
      { key: "target", label: "Target" },
    ],
    rows: [
      { concept: "Matrix Operations", week1: "45%", week2: "58%", week3: "65%", current: "72%", target: "85%" },
      { concept: "Vector Spaces", week1: "30%", week2: "42%", week3: "55%", current: "61%", target: "80%" },
      { concept: "Eigenvalues", week1: "15%", week2: "28%", week3: "38%", current: "48%", target: "75%" },
      { concept: "Eigenvectors", week1: "12%", week2: "25%", week3: "35%", current: "45%", target: "75%" },
      { concept: "Diagonalization", week1: "5%", week2: "15%", week3: "22%", current: "32%", target: "70%" },
      { concept: "Linear Transforms", week1: "35%", week2: "45%", week3: "52%", current: "58%", target: "80%" },
      { concept: "Determinants", week1: "40%", week2: "55%", week3: "62%", current: "68%", target: "85%" },
    ],
    createdAt: "2026-03-03",
  },
]

export const MOCK_FLASHCARDS: FlashcardArtifact[] = [
  {
    id: "fc-1",
    type: "flashcards",
    title: "Eigenvalue Essentials",
    description: "12 cards covering eigenvalue computation and key properties.",
    cards: [
      { id: "c1", front: "What is the characteristic equation?", back: "det(A - lambda*I) = 0, where lambda are the eigenvalues." },
      { id: "c2", front: "How do you find eigenvectors?", back: "Solve (A - lambda*I)x = 0 for each eigenvalue lambda." },
      { id: "c3", front: "What does it mean if eigenvalues are all distinct?", back: "The matrix is diagonalizable and eigenvectors are linearly independent." },
      { id: "c4", front: "Trace of a matrix equals...", back: "The sum of its eigenvalues (counted with multiplicity)." },
      { id: "c5", front: "Determinant of a matrix equals...", back: "The product of its eigenvalues." },
      { id: "c6", front: "When is a matrix positive definite?", back: "When all its eigenvalues are strictly positive." },
    ],
    createdAt: "2026-03-02",
  },
  {
    id: "fc-2",
    type: "flashcards",
    title: "Matrix Operations Quick Review",
    description: "Essential matrix operation definitions.",
    cards: [
      { id: "c7", front: "When can you multiply two matrices A (m x n) and B?", back: "B must have n rows. Result is m x (cols of B)." },
      { id: "c8", front: "Is matrix multiplication commutative?", back: "No! AB does not equal BA in general." },
    ],
    createdAt: "2026-03-01",
  },
  {
    id: "fc-3",
    type: "flashcards",
    title: "Vector Space Fundamentals",
    description: "Core vector space definitions and theorems.",
    cards: [
      { id: "c9", front: "What is a subspace?", back: "A non-empty subset closed under addition and scalar multiplication." },
      { id: "c10", front: "What is a basis?", back: "A linearly independent spanning set for the vector space." },
    ],
    createdAt: "2026-02-28",
  },
]

export const MOCK_REPORTS: ReportArtifact[] = [
  {
    id: "rpt-1",
    type: "report",
    title: "Weekly Learning Summary",
    description: "Auto-generated report of your learning progress this week.",
    sections: [
      { heading: "Overview", content: "This week you completed 4 out of 5 scheduled study blocks, spending a total of 2 hours and 15 minutes on active practice. Your overall mastery increased from 48% to 55%." },
      { heading: "Key Achievements", content: "Matrix operations mastery reached 72%, passing the intermediate threshold. You correctly solved 3 consecutive application problems on determinants without hints." },
      { heading: "Areas for Improvement", content: "Eigenvalue computation accuracy dropped during timed sessions. Consider practicing under less time pressure first, then gradually introducing time constraints." },
      { heading: "Recommendations", content: "Focus next week on eigenvector properties and diagonalization. The system has automatically adjusted your Day 3 and Day 5 blocks to emphasize these topics." },
    ],
    createdAt: "2026-03-03",
  },
]

export const MOCK_INFOGRAPHICS: InfographicArtifact[] = [
  {
    id: "ig-1",
    type: "infographic",
    title: "Learning Progress At a Glance",
    description: "Visual summary of your key learning metrics.",
    stats: [
      { label: "Overall Mastery", value: "55%", color: "bg-blue-500" },
      { label: "Study Streak", value: "12 days", color: "bg-green-500" },
      { label: "Cards Reviewed", value: "148", color: "bg-purple-500" },
      { label: "Quiz Score Avg", value: "73%", color: "bg-amber-500" },
      { label: "Time Invested", value: "18.5 hrs", color: "bg-rose-500" },
      { label: "Concepts Mastered", value: "3/7", color: "bg-cyan-500" },
    ],
    createdAt: "2026-03-03",
  },
]

export const MOCK_SLIDEDECKS: SlideArtifact[] = [
  {
    id: "sd-1",
    type: "slidedeck",
    title: "Eigenvalues & Eigenvectors Review",
    description: "Slide deck summarizing key concepts for midterm prep.",
    slides: [
      { title: "What are Eigenvalues?", bullets: ["Scalar lambda such that Av = lambda*v", "Found via characteristic equation det(A - lambda*I) = 0", "Number of eigenvalues equals matrix dimension"] },
      { title: "Finding Eigenvalues", bullets: ["Step 1: Compute A - lambda*I", "Step 2: Find det(A - lambda*I)", "Step 3: Solve the characteristic polynomial"] },
      { title: "Finding Eigenvectors", bullets: ["For each eigenvalue lambda, solve (A - lambda*I)x = 0", "The solution space is the eigenspace", "Dimension of eigenspace = geometric multiplicity"] },
      { title: "Diagonalization", bullets: ["A = PDP^(-1) where D is diagonal of eigenvalues", "P is matrix of eigenvectors as columns", "Only possible when there are n linearly independent eigenvectors"] },
      { title: "Key Properties", bullets: ["trace(A) = sum of eigenvalues", "det(A) = product of eigenvalues", "Symmetric matrices have all real eigenvalues"] },
    ],
    createdAt: "2026-03-02",
  },
]

export const MOCK_SPATIALS: SpatialArtifact[] = [
  {
    id: "sp-1",
    type: "spatial",
    title: "Water Molecule (H2O)",
    description: "3D model of a water molecule showing oxygen and hydrogen atoms with bonds.",
    autoRotate: true,
    objects: [
      { id: "o1", label: "O", shape: "sphere", position: [0, 0, 0], color: "#ef4444", scale: 1.2 },
      { id: "h1", label: "H", shape: "sphere", position: [-1.5, -1, 0], color: "#3b82f6", scale: 0.8 },
      { id: "h2", label: "H", shape: "sphere", position: [1.5, -1, 0], color: "#3b82f6", scale: 0.8 },
    ],
    connections: [
      { from: "o1", to: "h1", color: "#94a3b8" },
      { from: "o1", to: "h2", color: "#94a3b8" },
    ],
    createdAt: "2026-03-04",
  },
  {
    id: "sp-2",
    type: "spatial",
    title: "Platonic Solids Gallery",
    description: "Interactive 3D view of all five Platonic solids — the building blocks of geometry.",
    autoRotate: true,
    objects: [
      { id: "p1", label: "Cube", shape: "box", position: [-4, 0, 0], color: "#f59e0b", rotate: true },
      { id: "p2", label: "Icosahedron", shape: "icosahedron", position: [-2, 0, 0], color: "#10b981", rotate: true },
      { id: "p3", label: "Octahedron", shape: "octahedron", position: [0, 0, 0], color: "#8b5cf6", rotate: true },
      { id: "p4", label: "Dodecahedron", shape: "dodecahedron", position: [2, 0, 0], color: "#ec4899", rotate: true },
      { id: "p5", label: "Cone", shape: "cone", position: [4, 0, 0], color: "#06b6d4", rotate: true },
    ],
    createdAt: "2026-03-03",
  },
  {
    id: "sp-3",
    type: "spatial",
    title: "3D Vector Space Basis",
    description: "Visualization of standard basis vectors e1, e2, e3 in R3 with unit cube.",
    autoRotate: true,
    objects: [
      { id: "origin", label: "Origin", shape: "sphere", position: [0, 0, 0], color: "#6b7280", scale: 0.3 },
      { id: "e1", label: "e1", shape: "cylinder", position: [1, 0, 0], color: "#ef4444", scale: 0.15 },
      { id: "e2", label: "e2", shape: "cylinder", position: [0, 1, 0], color: "#22c55e", scale: 0.15 },
      { id: "e3", label: "e3", shape: "cylinder", position: [0, 0, 1], color: "#3b82f6", scale: 0.15 },
      { id: "tip1", label: "x", shape: "sphere", position: [2, 0, 0], color: "#ef4444", scale: 0.25 },
      { id: "tip2", label: "y", shape: "sphere", position: [0, 2, 0], color: "#22c55e", scale: 0.25 },
      { id: "tip3", label: "z", shape: "sphere", position: [0, 0, 2], color: "#3b82f6", scale: 0.25 },
    ],
    connections: [
      { from: "origin", to: "tip1", color: "#ef4444" },
      { from: "origin", to: "tip2", color: "#22c55e" },
      { from: "origin", to: "tip3", color: "#3b82f6" },
    ],
    createdAt: "2026-03-02",
  },
]

// Helper to get all artifacts of a given type
export function getArtifactsByType(type: ArtifactType): Artifact[] {
  switch (type) {
    case "video": return MOCK_VIDEOS
    case "audio": return MOCK_AUDIO
    case "mindmap": return MOCK_MINDMAPS
    case "quiz": return MOCK_QUIZZES
    case "datatable": return MOCK_DATATABLES
    case "flashcards": return MOCK_FLASHCARDS
    case "report": return MOCK_REPORTS
    case "infographic": return MOCK_INFOGRAPHICS
    case "slidedeck": return MOCK_SLIDEDECKS
    case "spatial": return MOCK_SPATIALS
  }
}

export function artifactTypeFromLabel(label: string): ArtifactType | null {
  const map: Record<string, ArtifactType> = {
    "Audio": "audio",
    "Video": "video",
    "Mind Map": "mindmap",
    "Reports": "report",
    "Flashcards": "flashcards",
    "Quiz": "quiz",
    "Infographic": "infographic",
    "Slide Deck": "slidedeck",
    "Data Table": "datatable",
    "3D Spatial": "spatial",
  }
  return map[label] ?? null
}

export function artifactTypeLabel(type: ArtifactType): string {
  const map: Record<ArtifactType, string> = {
    audio: "Audio",
    video: "Video",
    mindmap: "Mind Map",
    quiz: "Quiz",
    datatable: "Data Table",
    flashcards: "Flashcards",
    report: "Reports",
    infographic: "Infographic",
    slidedeck: "Slide Deck",
    spatial: "3D Spatial",
  }
  return map[type]
}
