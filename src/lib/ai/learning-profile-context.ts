/**
 * Separate module for extracting learning profile context into a prompt block.
 *
 * Importable by any artifact generator to optionally enrich generation
 * with the learner's cognitive profile, coaching preferences, and risks.
 */

import type { LearningProfileAnalysis } from "./schemas";

/**
 * Format a LearningProfileAnalysis into a markdown block suitable for
 * injection into any artifact generation prompt.
 *
 * Returns an empty string when no profile is provided, so callers can
 * always concatenate the result without branching.
 */
export function buildProfileContextBlock(
  profile: LearningProfileAnalysis | null | undefined,
): string {
  if (!profile) return "";

  const strengths = profile.strengths.map((s) => `- ${s}`).join("\n");

  const risks = profile.risks
    .map(
      (r) =>
        `- **${r.area}** (${r.severity}): ${r.description} → ${r.mitigation}`,
    )
    .join("\n");

  const strategies = profile.recommendedStrategies
    .map((s) => `- [${s.priority}] ${s.strategy}: ${s.rationale}`)
    .join("\n");

  return `

## Learner Profile Context
Use this to adapt tone, complexity, and focus — but NEVER gate content access on profile traits [VEDEL_2014].

**Summary:** ${profile.summary}

### Strengths
${strengths}

### Risks & Mitigations
${risks}

### Recommended Strategies
${strategies}

### Cognitive Profile
- Reflectiveness: ${profile.cognitiveProfile.reflectivenessLevel}
- Metacognitive Awareness: ${profile.cognitiveProfile.metacognitiveAwareness}
- Calibration: ${profile.cognitiveProfile.calibrationAccuracy}

### Coaching Approach
- Tone: ${profile.coachingApproach.tone}
- Feedback Frequency: ${profile.coachingApproach.feedbackFrequency}
- Motivational Focus: ${profile.coachingApproach.motivationalFocus} (SDT)`;
}
