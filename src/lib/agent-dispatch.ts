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
    // ── Artifact generation tools ──
    // All tools return { type: string, data: {...} }.
    // We build a full Artifact (adding id + createdAt) and add it to the store.
    case "create_adaptive_quiz":
    case "create_adaptive_flashcards":
    case "create_mind_map":
    case "create_slides":
    case "create_spatial":
    case "create_worked_example":
    case "create_elaborative_interrogation":
    case "create_prediction_reflection":
    case "create_interleaved_problem_set":
    // Legacy / direct-artifact names (kept for backwards compat)
    case "create_flashcards":
    case "create_mindmap":
    case "create_video":
    case "create_audio":
    case "create_datatable":
    case "create_report":
    case "create_infographic":
    case "create_slidedeck":
    case "create_manim":
    case "create_geo": {
      // Tools return { type, data } — extract and build a proper Artifact
      const toolResult = result as { type?: string; data?: Record<string, unknown> };
      const type = toolResult.type;
      const raw = toolResult.data;

      // Fallback: if result is already an artifact shape (legacy tools)
      const legacyArtifact = result as unknown as Artifact;

      if (type && raw) {
        let data = { ...raw };

        // Spatial: schema emits x/y/z fields; renderer expects position:[x,y,z]
        if (type === "spatial" && Array.isArray(data.objects)) {
          data = {
            ...data,
            objects: (data.objects as Array<Record<string, unknown>>).map(
              (obj) => ({
                ...obj,
                position: [
                  Number(obj.x ?? 0),
                  Number(obj.y ?? 0),
                  Number(obj.z ?? 0),
                ] as [number, number, number],
              }),
            ),
          };
        }

        // MindMap: schema emits parentId: string|null; renderer expects parentId?: string
        if (type === "mindmap" && Array.isArray(data.nodes)) {
          data = {
            ...data,
            nodes: (data.nodes as Array<Record<string, unknown>>).map(
              (node) => ({
                ...node,
                parentId: node.parentId ?? undefined,
              }),
            ),
          };
        }

        const artifact = {
          id: `${type}-${Date.now()}`,
          type,
          createdAt: new Date().toISOString().slice(0, 10),
          ...data,
        } as Artifact;

        dataStore.addArtifact(artifact);
        ctx.setArtifactParam(type);
        ctx.setActiveTab("");
      } else if (legacyArtifact.id && legacyArtifact.type) {
        // Legacy: result is already a full Artifact
        dataStore.addArtifact(legacyArtifact);
        ctx.setArtifactParam(legacyArtifact.type);
        ctx.setActiveTab("");
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

    case "generate_all_artifacts": {
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
