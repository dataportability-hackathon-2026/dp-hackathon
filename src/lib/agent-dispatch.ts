/**
 * Routes agent tool results to the dataStore (domain mutations)
 * and nuqs setters (navigation).
 */

import type { Artifact } from "@/components/artifacts/artifact-store";
import type { LearningProfileData } from "@/components/learning-profile-form";
import type { ProfileStrength } from "@/lib/data-store";
import { dataStore } from "@/lib/data-store";
import type { MockGuideBlock, MockMastery } from "@/lib/topics";

export type DispatchContext = {
  setActiveTab: (tab: string | null) => void;
  setArtifactParam: (artifact: string | null) => void;
  /** Current topic slug — injected into artifacts so they are scoped per topic */
  topicSlug?: string;
};

type ToolResult = Record<string, unknown>;

export function dispatchAgentResult(
  toolName: string,
  result: ToolResult,
  ctx: DispatchContext,
): void {
  // Navigation state updates (existing behavior)
  if (result.__stateUpdate) {
    handleNavigation(result, ctx);
    return;
  }

  // Domain tool routing
  switch (toolName) {
    case "create_adaptive_quiz":
    case "create_adaptive_flashcards":
    case "create_worked_example":
    case "create_elaborative_interrogation":
    case "create_prediction_reflection":
    case "create_interleaved_problem_set":
    case "create_mind_map":
    case "create_slides":
    case "create_spatial":
    case "create_flashcards":
    case "create_mindmap":
    case "create_video":
    case "create_audio":
    case "create_datatable":
    case "create_report":
    case "create_infographic":
    case "create_slidedeck":
    case "create_manim":
    case "create_geo":
    case "create_remix": {
      const artifact = normalizeToolResultToArtifact(result);
      if (artifact?.id && artifact.type) {
        // Always use the dispatch context's topicSlug (the project/topic the user is viewing)
        // The AI tool may return its own topicSlug (e.g. "game-theory") that doesn't match
        // the actual project slug (e.g. "admin-test-a2c996ed"), causing filtering to miss it.
        if (ctx.topicSlug) {
          artifact.topicSlug = ctx.topicSlug;
        }
        dataStore.addArtifact(artifact);
        // Persist to DB so it survives page refresh
        persistArtifact(artifact);
        ctx.setArtifactParam(artifact.type);
        ctx.setActiveTab("");
      } else {
        console.warn(
          "[agent-dispatch] could not normalize artifact for",
          toolName,
        );
      }
      break;
    }

    case "analyze_learning_profile": {
      if (result.profile) {
        dataStore.patchLearningProfile(
          result.profile as Partial<LearningProfileData>,
        );
      }
      if (result.strengths) {
        dataStore.setProfileStrengths(result.strengths as ProfileStrength[]);
      }
      break;
    }

    case "generate_learning_guide": {
      if (result.blocks) {
        dataStore.setGuideBlocks(result.blocks as MockGuideBlock[]);
      }
      break;
    }

    case "update_mastery": {
      if (result.scores) {
        dataStore.setMasteryScores(result.scores as MockMastery[]);
      }
      break;
    }

    case "complete_guide_block": {
      const blockId = result.blockId as string | undefined;
      if (blockId) {
        dataStore.updateGuideBlock(blockId, { completed: true });
      }
      break;
    }

    case "generate_artifacts": {
      // Batch generation started — store workflowRunId for progress polling
      const workflowRunId = result.workflowRunId as string | undefined;
      if (workflowRunId) {
        dataStore.setActiveWorkflowRunId(workflowRunId);
      }
      break;
    }

    case "create_schedule":
    case "update_schedule":
    case "cancel_schedule":
      // Schedule changes are reflected via the API; no local state needed
      break;
  }
}

/**
 * Normalize the raw tool result into a flat Artifact shape.
 * Tools return { type, topicSlug?, data: { title, description, ... } }.
 * If the result already looks like a flat Artifact (has id+type), use it as-is.
 *
 * The AI SDK may wrap outputs in { type: "json", value: ... } or { type: "text", value: ... }.
 * We unwrap these before processing.
 */
function normalizeToolResultToArtifact(result: ToolResult): Artifact | null {
  // Unwrap AI SDK output wrapping: { type: "json"|"text", value: ... }
  let unwrapped = result;
  if (
    (result.type === "json" || result.type === "text") &&
    "value" in result &&
    typeof result.value === "object" &&
    result.value !== null
  ) {
    unwrapped = result.value as ToolResult;
    // Unwrapped AI SDK output wrapper
  }

  // Already a flat artifact (has id and type at top level)
  if (unwrapped.id && unwrapped.type) {
    return unwrapped as unknown as Artifact;
  }

  // Tool result shape: { type, topicSlug?, data: { title, description, ... } }
  const artifactType = unwrapped.type as string | undefined;
  const data = unwrapped.data as Record<string, unknown> | undefined;
  if (!artifactType || !data) {
    console.warn(
      "[agent-dispatch] Cannot normalize artifact — missing type or data",
    );
    return null;
  }

  return {
    id: `artifact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: artifactType,
    topicSlug: (unwrapped.topicSlug as string) ?? undefined,
    createdAt: new Date().toISOString().slice(0, 10),
    ...data,
  } as unknown as Artifact;
}

/** Fire-and-forget persist to /api/user-artifacts so artifacts survive page refresh */
function persistArtifact(artifact: Artifact) {
  fetch("/api/user-artifacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artifact }),
  }).catch((err) => {
    console.error("[agent-dispatch] Failed to persist artifact:", err);
  });
}

function handleNavigation(result: ToolResult, ctx: DispatchContext) {
  const type = result.type as string | undefined;
  switch (type) {
    case "navigate_to_view":
    case "show_guide":
    case "show_progress":
    case "show_sources": {
      const view = result.view as string | undefined;
      if (view) {
        ctx.setActiveTab(view);
        ctx.setArtifactParam(null);
      }
      break;
    }
    case "select_topic": {
      const view = result.view as string | undefined;
      if (view) ctx.setActiveTab(view);
      break;
    }
    case "select_project":
      break;
    case "open_artifact": {
      const artifact = result.artifact as string | undefined;
      if (artifact) {
        ctx.setArtifactParam(artifact);
        ctx.setActiveTab("");
      }
      break;
    }
  }
}
