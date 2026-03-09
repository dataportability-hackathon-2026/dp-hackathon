/**
 * Shape of the client-side state snapshot sent with each chat request.
 * Built on the client from dataStore + appStore, consumed by read-only agent tools.
 */

import type { ArtifactType } from "@/components/artifacts/artifact-store";

export type ArtifactSnapshot = {
  id: string;
  type: ArtifactType;
  topicSlug?: string;
  title: string;
  description: string;
  createdAt: string;
  /** Type-specific payload (questions, cards, nodes, etc.) */
  data: Record<string, unknown>;
};

export type GuideBlockSnapshot = {
  id: string;
  day: number;
  title: string;
  description: string;
  completed: boolean;
  type?: string;
  duration?: string;
};

export type ClientStateSnapshot = {
  /** Current view: guide | sources | progress */
  activeView: string;
  /** Currently selected topic ID */
  selectedTopicId: string;
  /** Currently selected project ID */
  selectedProjectId: string;
  /** Currently displayed artifact type (null if none) */
  activeArtifact: string | null;
  /** All artifacts in the data store */
  artifacts: ArtifactSnapshot[];
  /** 7-day study guide blocks */
  guideBlocks: GuideBlockSnapshot[];
  /** IDs of completed guide blocks */
  completedGuideBlockIds: string[];
  /** Learner profile summary */
  learningProfile: Record<string, unknown> | null;
  /** Per-concept mastery scores */
  masteryScores: Array<{ concept: string; score: number; trend?: string }>;
  /** Cognitive profile strengths */
  profileStrengths: Array<{
    area: string;
    score: number;
    label: string;
    description: string;
  }>;
  /** Motivation profile (SDT) */
  motivationProfile: {
    autonomy: number;
    competence: number;
    relatedness: number;
  };
  /** Calibration tendency */
  calibrationTendency: {
    tendency: string;
    avgConfidence: number;
    avgAccuracy: number;
    gap: number;
  };
  /** Active system adaptations */
  systemAdaptations: Array<{ rule: string; reason: string }>;
};
