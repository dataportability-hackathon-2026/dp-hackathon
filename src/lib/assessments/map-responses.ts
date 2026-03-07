import type { LearningProfileData } from "@/components/learning-profile-form";
import type { ProfileAssessmentInput } from "@/lib/ai/profile-tools";

// CRT correct answers (case-insensitive, trimmed)
const CRT_CORRECT: [string, string, string] = [
  "5 cents",
  "5 minutes",
  "47 days",
];

function scoreCrt(answers: [string, string, string]): number {
  return answers.reduce((score, answer, i) => {
    const normalized = answer.trim().toLowerCase();
    const correct = CRT_CORRECT[i].toLowerCase();
    return score + (normalized.includes(correct) ? 1 : 0);
  }, 0);
}

function mapSessionLength(raw: string): "short" | "medium" | "long" {
  if (
    raw.includes("15") ||
    raw.includes("20") ||
    raw.includes("25") ||
    raw === "short"
  )
    return "short";
  if (raw.includes("60") || raw.includes("90") || raw === "long") return "long";
  return "medium";
}

function mapFrequency(
  raw: string,
): "rarely" | "sometimes" | "often" | "always" {
  const val = raw.toLowerCase();
  if (
    val === "rarely" ||
    val === "sometimes" ||
    val === "often" ||
    val === "always"
  )
    return val;
  return "sometimes";
}

function mapPriorKnowledge(
  raw: string,
): "beginner" | "intermediate" | "advanced" {
  const val = raw.toLowerCase();
  if (val === "beginner" || val === "intermediate" || val === "advanced")
    return val;
  return "intermediate";
}

function mapCoachingTone(
  raw: string,
): "direct" | "encouraging" | "socratic" | "collaborative" {
  const val = raw.toLowerCase();
  if (
    val === "direct" ||
    val === "encouraging" ||
    val === "socratic" ||
    val === "collaborative"
  )
    return val;
  return "direct";
}

function mapPrimaryGoal(
  raw: string,
):
  | "exam_prep"
  | "deep_understanding"
  | "project_fluency"
  | "teaching"
  | "career_switch" {
  const val = raw.toLowerCase();
  if (val.includes("exam")) return "exam_prep";
  if (val.includes("deep") || val.includes("understand"))
    return "deep_understanding";
  if (val.includes("project")) return "project_fluency";
  if (val.includes("teach")) return "teaching";
  if (val.includes("career")) return "career_switch";
  return "deep_understanding";
}

export function mapResponsesToProfileInput(
  data: LearningProfileData,
): ProfileAssessmentInput {
  const crtScore = scoreCrt([
    data.crtAnswer1,
    data.crtAnswer2,
    data.crtAnswer3,
  ]);

  return {
    displayName: data.displayName,
    educationLevel: data.educationLevel,
    fieldOfStudy: data.fieldOfStudy,
    primaryGoal: mapPrimaryGoal(data.primaryGoal),
    goalDescription: data.goalDescription,
    deadline: data.deadline || "open-ended",
    minutesPerDay: Math.max(5, Math.min(480, data.minutesPerDay)),
    daysPerWeek: Math.max(1, Math.min(7, data.daysPerWeek)),
    sessionLength: mapSessionLength(data.sessionLength),
    priorKnowledgeLevel: mapPriorKnowledge(data.priorKnowledgeLevel),
    priorKnowledgeDetails: data.priorKnowledgeDetails || "Not specified",
    studyStrategies:
      data.studyStrategies.length > 0 ? data.studyStrategies : ["rereading"],
    crtScore,
    crtExposureFlagged: false,
    metacogPlanningFrequency: mapFrequency(data.metacogPlanningFrequency),
    metacogMonitoring: mapFrequency(data.metacogMonitoring),
    metacogSelfEvaluation: mapFrequency(data.metacogSelfEvaluation),
    motivationAutonomy: Math.max(0, Math.min(100, data.motivationAutonomy)),
    motivationCompetence: Math.max(0, Math.min(100, data.motivationCompetence)),
    motivationRelatedness: Math.max(
      0,
      Math.min(100, data.motivationRelatedness),
    ),
    calibrationConfidence: Math.max(
      0,
      Math.min(100, data.calibrationConfidence),
    ),
    biggestChallenge: data.biggestChallenge || "Not specified",
    procrastinationFrequency: mapFrequency(data.procrastinationFrequency),
    preferredFormats:
      data.preferredFormats.length > 0 ? data.preferredFormats : ["text"],
    coachingTone: mapCoachingTone(data.coachingTone),
  };
}
