/**
 * Smoke test: exercises one tool from each category against the AI Gateway.
 * Run with: npx tsx evals/smoke-test.ts
 */
import "./setup";
import { artifactTools } from "../src/lib/ai/artifact-tools";
import { guideTools } from "../src/lib/ai/guide-tools";
import { profileTools } from "../src/lib/ai/profile-tools";

async function runTest(name: string, fn: () => Promise<unknown>) {
  const start = Date.now();
  try {
    const result = await fn();
    const elapsed = Date.now() - start;
    console.log(`PASS [${elapsed}ms] ${name}`);
    const r = result as Record<string, unknown>;
    console.log(`  type: ${r.type}`);
    if (r.data && typeof r.data === "object") {
      const keys = Object.keys(r.data as object);
      console.log(`  data keys: ${keys.join(", ")}`);
    }
    return true;
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error(`FAIL [${elapsed}ms] ${name}`);
    console.error(`  ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function main() {
  console.log("=== Academic Citation Tools Smoke Test ===\n");

  const results: boolean[] = [];

  // 1. Profile Tool: assess_calibration
  results.push(
    await runTest("Profile: assess_calibration", () =>
      profileTools.assess_calibration.execute(
        {
          confidencePredictions: [
            { itemId: "i1", predictedConfidence: 85, wasCorrect: false },
            { itemId: "i2", predictedConfidence: 90, wasCorrect: true },
            { itemId: "i3", predictedConfidence: 70, wasCorrect: true },
            { itemId: "i4", predictedConfidence: 80, wasCorrect: false },
            { itemId: "i5", predictedConfidence: 60, wasCorrect: true },
          ],
          selfRatedConfidence: 75,
          priorKnowledgeLevel: "beginner" as const,
          crtScore: 1,
        },
        { toolCallId: "smoke-calibration", messages: [] },
      ),
    ),
  );

  // 2. Guide Tool: recommend_study_strategies
  results.push(
    await runTest("Guide: recommend_study_strategies", () =>
      guideTools.recommend_study_strategies.execute(
        {
          currentStrategies: ["highlighting", "rereading"],
          fieldOfStudy: "Statistics",
          priorKnowledgeLevel: "beginner" as const,
          primaryGoal: "exam_prep",
          metacognitiveAwareness: "low" as const,
          availableMinutesPerDay: 30,
        },
        { toolCallId: "smoke-strategies", messages: [] },
      ),
    ),
  );

  // 3. Artifact Tool: create_adaptive_quiz
  results.push(
    await runTest("Artifact: create_adaptive_quiz", () =>
      artifactTools.create_adaptive_quiz.execute(
        {
          subject: "Statistics",
          concepts: ["Mean", "Median", "Standard Deviation"],
          priorKnowledgeLevel: "beginner" as const,
          goalType: "exam_prep",
          calibrationAccuracy: "over-confident" as const,
          cognitiveLoadRisk: "high" as const,
          metacognitiveAwareness: "low" as const,
          coachingTone: "encouraging" as const,
        },
        { toolCallId: "smoke-quiz", messages: [] },
      ),
    ),
  );

  // 4. Edge case: interleaved with single concept (should return error, not throw)
  results.push(
    await runTest(
      "Artifact: interleaved_problem_set (single concept edge case)",
      () =>
        artifactTools.create_interleaved_problem_set.execute(
          {
            subject: "Statistics",
            concepts: ["Mean"],
            priorKnowledgeLevel: "beginner" as const,
            goalType: "exam_prep",
            calibrationAccuracy: "well-calibrated" as const,
            cognitiveLoadRisk: "low" as const,
            metacognitiveAwareness: "medium" as const,
            coachingTone: "direct" as const,
          },
          { toolCallId: "smoke-interleaved-edge", messages: [] },
        ),
    ),
  );

  // 5. Artifact Tool: create_worked_example
  results.push(
    await runTest("Artifact: create_worked_example", () =>
      artifactTools.create_worked_example.execute(
        {
          subject: "Statistics",
          concepts: ["Standard Deviation"],
          priorKnowledgeLevel: "beginner" as const,
          goalType: "exam_prep",
          calibrationAccuracy: "over-confident" as const,
          cognitiveLoadRisk: "high" as const,
          metacognitiveAwareness: "low" as const,
          coachingTone: "encouraging" as const,
          problemContext:
            "Calculate the standard deviation of a dataset: {2, 4, 4, 4, 5, 5, 7, 9}",
        },
        { toolCallId: "smoke-worked-example", messages: [] },
      ),
    ),
  );

  console.log("\n=== Results ===");
  const passed = results.filter(Boolean).length;
  console.log(`${passed}/${results.length} tests passed`);

  if (passed < results.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
