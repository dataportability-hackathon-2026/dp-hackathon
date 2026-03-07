import { evalite } from "evalite";
import type { GuideInput } from "../src/lib/ai/generate-guide";
import { generateLearningGuide } from "../src/lib/ai/generate-guide";
import type { LearningGuide } from "../src/lib/ai/schemas";
import {
  ADVANCED_ANALYSIS,
  BEGINNER_ANALYSIS,
  LINEAR_ALGEBRA_CONCEPTS,
  ML_CONCEPTS,
} from "./fixtures";
import {
  guideBlockTypeDiversity,
  guideConceptCoverage,
  guideCorePracticePresence,
  guideSevenDayCoverage,
  guideTimeBudgetCompliance,
} from "./scorers";

type GuideEvalInput = GuideInput & {
  totalWeeklyMinutes: number;
  concepts: string[];
};

const beginnerGuideInput: GuideEvalInput = {
  profileAnalysis: BEGINNER_ANALYSIS,
  fieldOfStudy: "Linear Algebra",
  primaryGoal: "exam",
  goalDescription: "Pass my Linear Algebra midterm with at least a B+",
  deadline: "2026-03-20",
  minutesPerDay: 45,
  daysPerWeek: 5,
  sessionLength: "pomodoro-25",
  priorKnowledgeLevel: "beginner",
  studyStrategies: ["active-recall", "spaced-repetition", "worked-examples"],
  concepts: LINEAR_ALGEBRA_CONCEPTS,
  totalWeeklyMinutes: 45 * 5,
};

const advancedGuideInput: GuideEvalInput = {
  profileAnalysis: ADVANCED_ANALYSIS,
  fieldOfStudy: "Machine Learning",
  primaryGoal: "fluency",
  goalDescription: "Deep understanding of ML theory for thesis research",
  deadline: "2026-06-01",
  minutesPerDay: 90,
  daysPerWeek: 6,
  sessionLength: "deep-work-90",
  priorKnowledgeLevel: "advanced",
  studyStrategies: [
    "active-recall",
    "spaced-repetition",
    "elaboration",
    "interleaving",
  ],
  concepts: ML_CONCEPTS,
  totalWeeklyMinutes: 90 * 6,
};

evalite<GuideEvalInput, LearningGuide>("Learning Guide Generation", {
  data: () => [
    { input: beginnerGuideInput, expected: undefined },
    { input: advancedGuideInput, expected: undefined },
  ],
  task: async (input) => {
    return generateLearningGuide(input);
  },
  scorers: [
    guideTimeBudgetCompliance,
    guideSevenDayCoverage,
    guideBlockTypeDiversity,
    guideCorePracticePresence,
    guideConceptCoverage,
  ],
});
