import { createScorer } from "evalite";
import type {
  LearningGuide,
  LearningProfileAnalysis,
} from "../../src/lib/ai/schemas";

// ── Profile Scorers ──

export const profileCoversAllDimensions = createScorer<
  unknown,
  LearningProfileAnalysis
>({
  name: "Profile Covers All Dimensions",
  description:
    "Checks that the profile analysis addresses cognitive, metacognitive, motivational, strategic, and risk dimensions",
  scorer: ({ output }) => {
    let score = 0;
    const checks = 6;

    // Has summary
    if (output.summary && output.summary.length > 20) score++;
    // Has strengths
    if (output.strengths && output.strengths.length >= 2) score++;
    // Has risks with mitigations
    if (
      output.risks &&
      output.risks.length >= 1 &&
      output.risks.every((r) => r.mitigation.length > 10)
    )
      score++;
    // Has recommended strategies
    if (
      output.recommendedStrategies &&
      output.recommendedStrategies.length >= 2
    )
      score++;
    // Cognitive profile is complete
    if (
      output.cognitiveProfile?.reflectivenessLevel &&
      output.cognitiveProfile?.metacognitiveAwareness &&
      output.cognitiveProfile?.calibrationAccuracy
    )
      score++;
    // Coaching approach is complete
    if (
      output.coachingApproach?.tone &&
      output.coachingApproach?.feedbackFrequency &&
      output.coachingApproach?.motivationalFocus
    )
      score++;

    return score / checks;
  },
});

export const profileCrtAlignment = createScorer<
  { crtScore: number },
  LearningProfileAnalysis
>({
  name: "CRT Score Alignment",
  description:
    "Checks that reflectiveness level aligns with CRT score (0=low, 1=medium, 2-3=high)",
  scorer: ({ input, output }) => {
    const expected =
      input.crtScore >= 2 ? "high" : input.crtScore === 1 ? "medium" : "low";
    return output.cognitiveProfile.reflectivenessLevel === expected ? 1 : 0;
  },
});

export const profileCalibrationDetection = createScorer<
  { confidence: number; priorLevel: string; crtScore: number },
  LearningProfileAnalysis
>({
  name: "Calibration Accuracy Detection",
  description:
    "Checks if over/under-confidence is correctly identified based on confidence vs actual ability signals",
  scorer: ({ input, output }) => {
    // High confidence + low CRT + beginner = over-confident
    if (
      input.confidence >= 70 &&
      input.crtScore <= 1 &&
      input.priorLevel === "beginner"
    ) {
      return output.cognitiveProfile.calibrationAccuracy === "over-confident"
        ? 1
        : 0;
    }
    // Low confidence + high CRT + advanced = under-confident
    if (
      input.confidence <= 40 &&
      input.crtScore >= 2 &&
      input.priorLevel === "advanced"
    ) {
      return output.cognitiveProfile.calibrationAccuracy === "under-confident"
        ? 1
        : 0;
    }
    // Moderate signals = well-calibrated is acceptable
    if (
      input.confidence >= 40 &&
      input.confidence <= 70 &&
      input.crtScore >= 2
    ) {
      return output.cognitiveProfile.calibrationAccuracy === "well-calibrated"
        ? 1
        : 0.5;
    }
    return 0.5; // Ambiguous cases get partial credit
  },
});

export const profileMotivationFocus = createScorer<
  { autonomy: number; competence: number; relatedness: number },
  LearningProfileAnalysis
>({
  name: "SDT Motivation Focus",
  description:
    "Checks that the coaching approach targets the lowest SDT dimension",
  scorer: ({ input, output }) => {
    const scores = {
      autonomy: input.autonomy,
      competence: input.competence,
      relatedness: input.relatedness,
    };
    const lowest = Object.entries(scores).sort(([, a], [, b]) => a - b)[0][0] as
      | "autonomy"
      | "competence"
      | "relatedness";

    return output.coachingApproach.motivationalFocus === lowest ? 1 : 0;
  },
});

// ── Guide Scorers ──

export const guideTimeBudgetCompliance = createScorer<
  { totalWeeklyMinutes: number },
  LearningGuide
>({
  name: "Time Budget Compliance",
  description:
    "Checks that total guide minutes are within 10% of the target weekly budget",
  scorer: ({ input, output }) => {
    const actualTotal = output.blocks.reduce(
      (sum, b) => sum + b.plannedMinutes,
      0,
    );
    const target = input.totalWeeklyMinutes;
    const tolerance = target * 0.1;
    const diff = Math.abs(actualTotal - target);

    if (diff <= tolerance) return 1;
    if (diff <= tolerance * 2) return 0.5;
    return 0;
  },
});

export const guideSevenDayCoverage = createScorer<unknown, LearningGuide>({
  name: "7-Day Coverage",
  description: "Checks that all 7 days have at least a summary entry",
  scorer: ({ output }) => {
    const daysWithSummaries = new Set(
      output.dailySummaries.map((s) => s.dayIndex),
    );
    const daysWithBlocks = new Set(output.blocks.map((b) => b.dayIndex));
    const allDays = new Set([...daysWithSummaries, ...daysWithBlocks]);

    return allDays.size >= 7 ? 1 : allDays.size / 7;
  },
});

export const guideBlockTypeDiversity = createScorer<unknown, LearningGuide>({
  name: "Block Type Diversity",
  description:
    "Checks that the guide uses multiple block types, not just core_practice",
  scorer: ({ output }) => {
    const types = new Set(output.blocks.map((b) => b.blockType));
    // 4 possible types, at least 2 required, 3+ is ideal
    if (types.size >= 3) return 1;
    if (types.size === 2) return 0.7;
    return 0.3;
  },
});

export const guideCorePracticePresence = createScorer<unknown, LearningGuide>({
  name: "Core Practice Every Day",
  description:
    "Checks that every active study day has at least one core_practice block",
  scorer: ({ output }) => {
    const activeDays = output.dailySummaries
      .filter((s) => s.totalMinutes > 0)
      .map((s) => s.dayIndex);

    const daysWithCore = new Set(
      output.blocks
        .filter((b) => b.blockType === "core_practice")
        .map((b) => b.dayIndex),
    );

    if (activeDays.length === 0) return 0;
    const coverage = activeDays.filter((d) => daysWithCore.has(d)).length;
    return coverage / activeDays.length;
  },
});

export const guideConceptCoverage = createScorer<
  { concepts: string[] },
  LearningGuide
>({
  name: "Concept Coverage",
  description: "Checks that all input concepts appear in at least one block",
  scorer: ({ input, output }) => {
    const allBlockConcepts = output.blocks.flatMap((b) => b.concepts);
    const blockConceptsLower = allBlockConcepts.map((c) => c.toLowerCase());

    let covered = 0;
    for (const concept of input.concepts) {
      const found = blockConceptsLower.some(
        (bc) =>
          bc.includes(concept.toLowerCase()) ||
          concept.toLowerCase().includes(bc),
      );
      if (found) covered++;
    }

    return covered / input.concepts.length;
  },
});

// ── Artifact Scorers ──

export const quizCorrectAnswerValidity = createScorer<
  unknown,
  { questions: { correctIndex: number; options: string[] }[] }
>({
  name: "Quiz Correct Answer Validity",
  description: "Checks that correctIndex is within range for every question",
  scorer: ({ output }) => {
    const valid = output.questions.filter(
      (q) => q.correctIndex >= 0 && q.correctIndex < q.options.length,
    );
    return valid.length / output.questions.length;
  },
});

export const quizExplanationQuality = createScorer<
  unknown,
  { questions: { explanation: string }[] }
>({
  name: "Quiz Explanation Quality",
  description:
    "Checks that explanations are substantive (>20 chars) and educational",
  scorer: ({ output }) => {
    const good = output.questions.filter((q) => q.explanation.length > 20);
    return good.length / output.questions.length;
  },
});

export const flashcardConceptCoverage = createScorer<
  { concepts: string[] },
  { cards: { front: string; back: string }[] }
>({
  name: "Flashcard Concept Coverage",
  description: "Checks that flashcards cover all input concepts",
  scorer: ({ input, output }) => {
    const allText = output.cards
      .map((c) => `${c.front} ${c.back}`)
      .join(" ")
      .toLowerCase();

    let covered = 0;
    for (const concept of input.concepts) {
      if (allText.includes(concept.toLowerCase())) covered++;
    }
    return covered / input.concepts.length;
  },
});

export const mindMapTreeValidity = createScorer<
  unknown,
  { nodes: { id: string; parentId: string | null }[] }
>({
  name: "Mind Map Tree Validity",
  description:
    "Checks that the mind map forms a valid tree: one root, all others have valid parents",
  scorer: ({ output }) => {
    const nodeIds = new Set(output.nodes.map((n) => n.id));
    const roots = output.nodes.filter((n) => !n.parentId);
    const validParents = output.nodes.filter(
      (n) => !n.parentId || nodeIds.has(n.parentId),
    );

    let score = 0;
    // Exactly one root
    if (roots.length === 1) score += 0.5;
    // All parent references are valid
    if (validParents.length === output.nodes.length) score += 0.5;

    return score;
  },
});

export const spatialPositionSpread = createScorer<
  unknown,
  { objects: { x: number; y: number; z: number }[] }
>({
  name: "Spatial Position Spread",
  description:
    "Checks that objects are spread in 3D space, not all at the origin",
  scorer: ({ output }) => {
    if (output.objects.length < 2) return 0;

    const positions = output.objects.map((o) => [o.x, o.y, o.z]);
    let distinctPositions = 0;

    for (let i = 0; i < positions.length; i++) {
      let isDistinct = true;
      for (let j = 0; j < i; j++) {
        const dist = Math.sqrt(
          (positions[i][0] - positions[j][0]) ** 2 +
            (positions[i][1] - positions[j][1]) ** 2 +
            (positions[i][2] - positions[j][2]) ** 2,
        );
        if (dist < 0.1) {
          isDistinct = false;
          break;
        }
      }
      if (isDistinct) distinctPositions++;
    }

    return distinctPositions / output.objects.length;
  },
});

export const spatialConnectionValidity = createScorer<
  unknown,
  {
    objects: { id: string }[];
    connections: { from: string; to: string }[] | null;
  }
>({
  name: "Spatial Connection Validity",
  description:
    "Checks that all connection references point to existing objects",
  scorer: ({ output }) => {
    if (!output.connections || output.connections.length === 0) return 1;

    const objectIds = new Set(output.objects.map((o) => o.id));
    const valid = output.connections.filter(
      (c) => objectIds.has(c.from) && objectIds.has(c.to),
    );

    return valid.length / output.connections.length;
  },
});
