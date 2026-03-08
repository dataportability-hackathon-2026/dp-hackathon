import { generateText, Output } from "ai";
import type { LearningProfileData } from "@/components/learning-profile-form";
import type { ProfileAssessmentInput } from "@/lib/ai/profile-tools";
import { buildProfileAnalysisPrompt } from "@/lib/ai/profile-tools";
import { openai } from "@/lib/ai/provider";
import {
  type LearningProfileAnalysis,
  LearningProfileAnalysisSchema,
} from "@/lib/ai/schemas";
import { mapResponsesToProfileInput } from "./map-responses";

export async function generateFingerprintFromInput(
  input: ProfileAssessmentInput,
): Promise<LearningProfileAnalysis> {
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: LearningProfileAnalysisSchema }),
    prompt: buildProfileAnalysisPrompt(input),
  });
  if (!result.output) {
    throw new Error("Failed to generate cognitive fingerprint");
  }
  return result.output;
}

export async function generateFingerprint(
  responses: LearningProfileData,
): Promise<LearningProfileAnalysis> {
  const input = mapResponsesToProfileInput(responses);
  return generateFingerprintFromInput(input);
}
