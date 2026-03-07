import type { LearningProfileInput } from "../src/lib/ai/generate-profile";
import type { LearningProfileAnalysis } from "../src/lib/ai/schemas";

// ── Test Learner Profiles ──

export const BEGINNER_LEARNER: LearningProfileInput = {
  displayName: "Alex",
  educationLevel: "Undergraduate",
  fieldOfStudy: "Linear Algebra",
  primaryGoal: "exam",
  goalDescription: "Pass my Linear Algebra midterm with at least a B+",
  deadline: "2026-03-20",
  urgency: "high",
  minutesPerDay: 45,
  daysPerWeek: 5,
  preferredTimeOfDay: "evening",
  sessionLength: "pomodoro-25",
  crtAnswer1: "10 cents",
  crtAnswer2: "100 minutes",
  crtAnswer3: "24 days",
  metacogPlanningFrequency: "rarely",
  metacogMonitoring: "sometimes",
  metacogSelfEvaluation: "rarely",
  studyStrategies: ["highlighting", "summarization"],
  primaryStrategy: "highlighting",
  motivationAutonomy: 40,
  motivationCompetence: 30,
  motivationRelatedness: 60,
  calibrationConfidence: 75,
  calibrationExplanation:
    "I think I understand most of the concepts but struggle with proofs",
  biggestChallenge: "Understanding abstract concepts",
  procrastinationFrequency: "often",
  distractionSources: ["social-media", "phone-notifications", "roommates"],
  preferredFormats: ["video", "worked-examples"],
  feedbackStyle: "immediate",
  coachingTone: "encouraging",
  priorKnowledgeLevel: "beginner",
  priorKnowledgeDetails:
    "Completed precalculus, basic matrix multiplication only",
  relatedSubjects: ["calculus", "precalculus"],
  learningSuperpowers: "I'm good at memorizing formulas",
  areasToImprove: "Applying concepts to new problems",
  anythingElse: "I get anxious during exams",
};

export const ADVANCED_LEARNER: LearningProfileInput = {
  displayName: "Jordan",
  educationLevel: "Masters",
  fieldOfStudy: "Machine Learning",
  primaryGoal: "fluency",
  goalDescription:
    "Deep understanding of ML theory for my thesis research on neural architecture search",
  deadline: "2026-06-01",
  urgency: "medium",
  minutesPerDay: 90,
  daysPerWeek: 6,
  preferredTimeOfDay: "morning",
  sessionLength: "deep-work-90",
  crtAnswer1: "5 cents",
  crtAnswer2: "5 minutes",
  crtAnswer3: "47 days",
  metacogPlanningFrequency: "always",
  metacogMonitoring: "often",
  metacogSelfEvaluation: "often",
  studyStrategies: [
    "active-recall",
    "spaced-repetition",
    "elaboration",
    "interleaving",
  ],
  primaryStrategy: "active-recall",
  motivationAutonomy: 85,
  motivationCompetence: 70,
  motivationRelatedness: 45,
  calibrationConfidence: 60,
  calibrationExplanation:
    "I know what I don't know - gradient methods are solid but I need more work on probabilistic graphical models",
  biggestChallenge: "Connecting theory to implementation",
  procrastinationFrequency: "rarely",
  distractionSources: ["research-rabbit-holes"],
  preferredFormats: ["text", "code-examples", "mind-maps"],
  feedbackStyle: "detailed",
  coachingTone: "direct",
  priorKnowledgeLevel: "advanced",
  priorKnowledgeDetails:
    "Strong in calculus, linear algebra, probability. Published one paper on CNNs. Weak in Bayesian methods.",
  relatedSubjects: [
    "statistics",
    "linear-algebra",
    "calculus",
    "probability",
    "computer-science",
  ],
  learningSuperpowers: "Can code implementations from papers",
  areasToImprove: "Mathematical proofs and Bayesian reasoning",
  anythingElse: "",
};

export const CAREER_CHANGER: LearningProfileInput = {
  displayName: "Sam",
  educationLevel: "Professional",
  fieldOfStudy: "Data Science with Python",
  primaryGoal: "project",
  goalDescription:
    "Build a portfolio project analyzing real-world datasets to transition from marketing to data science",
  deadline: "2026-05-15",
  urgency: "medium",
  minutesPerDay: 60,
  daysPerWeek: 4,
  preferredTimeOfDay: "evening",
  sessionLength: "pomodoro-25",
  crtAnswer1: "5 cents",
  crtAnswer2: "100 minutes",
  crtAnswer3: "47 days",
  metacogPlanningFrequency: "sometimes",
  metacogMonitoring: "sometimes",
  metacogSelfEvaluation: "sometimes",
  studyStrategies: ["worked-examples", "elaboration", "summarization"],
  primaryStrategy: "worked-examples",
  motivationAutonomy: 70,
  motivationCompetence: 45,
  motivationRelatedness: 75,
  calibrationConfidence: 50,
  calibrationExplanation:
    "I can follow tutorials but freeze when I have to start from scratch",
  biggestChallenge: "Bridging tutorial knowledge to independent work",
  procrastinationFrequency: "sometimes",
  distractionSources: ["work-fatigue", "family-responsibilities"],
  preferredFormats: ["video", "worked-examples", "interactive"],
  feedbackStyle: "progressive",
  coachingTone: "supportive",
  priorKnowledgeLevel: "intermediate",
  priorKnowledgeDetails:
    "Completed several online Python courses, can do basic pandas/numpy, knows SQL from marketing analytics",
  relatedSubjects: ["statistics", "python", "sql"],
  learningSuperpowers: "Strong business intuition and storytelling with data",
  areasToImprove:
    "Statistical modeling, machine learning algorithms, independent problem-solving",
  anythingElse:
    "Working full-time so energy levels vary. Best learning happens on weekends.",
};

// ── Mock Profile Analyses (for guide eval inputs) ──

export const BEGINNER_ANALYSIS: LearningProfileAnalysis = {
  summary:
    "Alex is an undergraduate beginner in Linear Algebra preparing for a midterm exam with high urgency. Shows low cognitive reflectiveness (0/3 CRT) and relies heavily on passive study strategies. Over-confident given limited prior knowledge.",
  strengths: [
    "Strong memorization skills for formulas",
    "Clear goal with defined deadline",
    "Willing to study 5 days per week",
  ],
  risks: [
    {
      area: "Calibration",
      severity: "high",
      description:
        "75% confidence with beginner knowledge and 0/3 CRT suggests significant over-confidence",
      mitigation: "Insert prediction-reflection loops before each practice set",
    },
    {
      area: "Study strategies",
      severity: "high",
      description:
        "Primary strategy is highlighting, which has low evidence for learning retention",
      mitigation:
        "Gradually introduce active recall and spaced repetition with scaffolding",
    },
    {
      area: "Procrastination",
      severity: "medium",
      description:
        "Reports frequent procrastination with multiple distraction sources",
      mitigation: "Use Pomodoro structure with clear micro-goals per session",
    },
  ],
  recommendedStrategies: [
    {
      strategy: "Active recall with worked examples",
      rationale:
        "Transition from passive highlighting to retrieval practice using familiar worked example format",
      priority: "primary",
    },
    {
      strategy: "Spaced repetition flashcards",
      rationale:
        "Leverage memorization strength while building deeper understanding",
      priority: "secondary",
    },
    {
      strategy: "Prediction-reflection calibration",
      rationale:
        "Address over-confidence by requiring confidence ratings before attempts",
      priority: "primary",
    },
  ],
  cognitiveProfile: {
    reflectivenessLevel: "low",
    metacognitiveAwareness: "low",
    calibrationAccuracy: "over-confident",
  },
  coachingApproach: {
    tone: "Encouraging but honest - celebrate small wins while gently correcting overconfidence",
    feedbackFrequency: "after-each-block",
    motivationalFocus: "competence",
  },
};

export const ADVANCED_ANALYSIS: LearningProfileAnalysis = {
  summary:
    "Jordan is a Masters student with strong ML foundations seeking deep fluency for thesis research. High cognitive reflectiveness (3/3 CRT) and excellent metacognitive awareness. Well-calibrated and uses evidence-based study strategies.",
  strengths: [
    "High reflectiveness and metacognitive awareness",
    "Already uses evidence-based strategies (active recall, spaced repetition)",
    "Strong foundational knowledge with clear gap identification",
    "High intrinsic motivation with strong autonomy",
  ],
  risks: [
    {
      area: "Social isolation",
      severity: "medium",
      description:
        "Low relatedness score (45) suggests risk of isolation in self-directed learning",
      mitigation:
        "Include peer discussion prompts and collaborative learning activities",
    },
    {
      area: "Research rabbit holes",
      severity: "low",
      description:
        "Self-reported distraction from deep-diving tangential topics",
      mitigation:
        "Time-box exploration sessions and use concept maps to maintain focus",
    },
  ],
  recommendedStrategies: [
    {
      strategy: "Interleaved problem sets across ML domains",
      rationale:
        "Strengthen connections between gradient methods and probabilistic models",
      priority: "primary",
    },
    {
      strategy: "Elaborative interrogation on Bayesian methods",
      rationale:
        "Address identified weak spot through deep questioning and proof practice",
      priority: "primary",
    },
    {
      strategy: "Implementation-first learning",
      rationale: "Leverage coding strength to ground theoretical concepts",
      priority: "secondary",
    },
  ],
  cognitiveProfile: {
    reflectivenessLevel: "high",
    metacognitiveAwareness: "high",
    calibrationAccuracy: "well-calibrated",
  },
  coachingApproach: {
    tone: "Direct and intellectually challenging",
    feedbackFrequency: "end-of-week",
    motivationalFocus: "relatedness",
  },
};

// ── Concept Lists ──

export const LINEAR_ALGEBRA_CONCEPTS = [
  "Matrix Operations",
  "Vector Spaces",
  "Eigenvalues",
  "Eigenvectors",
  "Diagonalization",
  "Linear Transformations",
  "Determinants",
];

export const ML_CONCEPTS = [
  "Gradient Descent",
  "Backpropagation",
  "Regularization",
  "Probabilistic Graphical Models",
  "Bayesian Inference",
  "Neural Architecture Search",
];

export const DATA_SCIENCE_CONCEPTS = [
  "Exploratory Data Analysis",
  "Statistical Testing",
  "Linear Regression",
  "Classification",
  "Feature Engineering",
  "Data Visualization",
];
