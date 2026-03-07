import { evalite } from "evalite";
import type { LearningProfileInput } from "../src/lib/ai/generate-profile";
import { generateLearningProfile } from "../src/lib/ai/generate-profile";
import type { LearningProfileAnalysis } from "../src/lib/ai/schemas";
import { ADVANCED_LEARNER, BEGINNER_LEARNER, CAREER_CHANGER } from "./fixtures";
import {
  profileCalibrationDetection,
  profileCoversAllDimensions,
  profileCrtAlignment,
  profileMotivationFocus,
} from "./scorers";

type ProfileEvalInput = LearningProfileInput & {
  crtScore: number;
  confidence: number;
  priorLevel: string;
  autonomy: number;
  competence: number;
  relatedness: number;
};

function enrichInput(profile: LearningProfileInput): ProfileEvalInput {
  const crtCorrect = [
    profile.crtAnswer1?.toLowerCase().includes("5") &&
    profile.crtAnswer1?.toLowerCase().includes("cent")
      ? 1
      : 0,
    profile.crtAnswer2?.toLowerCase().includes("5") &&
    profile.crtAnswer2?.toLowerCase().includes("min")
      ? 1
      : 0,
    profile.crtAnswer3?.toLowerCase().includes("47") ? 1 : 0,
  ];
  return {
    ...profile,
    crtScore: crtCorrect.reduce((a, b) => a + b, 0),
    confidence: profile.calibrationConfidence,
    priorLevel: profile.priorKnowledgeLevel,
    autonomy: profile.motivationAutonomy,
    competence: profile.motivationCompetence,
    relatedness: profile.motivationRelatedness,
  };
}

evalite<ProfileEvalInput, LearningProfileAnalysis>(
  "Learning Profile Generation",
  {
    data: () => [
      {
        input: enrichInput(BEGINNER_LEARNER),
        expected: undefined,
      },
      {
        input: enrichInput(ADVANCED_LEARNER),
        expected: undefined,
      },
      {
        input: enrichInput(CAREER_CHANGER),
        expected: undefined,
      },
    ],
    task: async (input) => {
      return generateLearningProfile(input);
    },
    scorers: [
      profileCoversAllDimensions,
      profileCrtAlignment,
      profileCalibrationDetection,
      profileMotivationFocus,
    ],
  },
);
