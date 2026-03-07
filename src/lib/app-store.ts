// Centralized app state store with external-store pattern for React
// Allows AI agent tools to update UI state from server-side tool calls

export type AppView = "guide" | "sources" | "progress";

export type AppState = {
  /** Currently active tab/view */
  activeView: AppView;
  /** Currently selected topic ID */
  selectedTopicId: string;
  /** Currently selected project ID */
  selectedProjectId: string;
  /** Whether the agent panel is open */
  agentOpen: boolean;
  /** Active artifact type being displayed */
  activeArtifact: string | null;
  /** IDs of guide blocks marked completed */
  completedGuideBlocks: Set<string>;
  /** IDs of guide blocks the agent has highlighted */
  highlightedGuideBlock: string | null;
  /** Last state-change event for downstream consumers */
  lastEvent: StateChangeEvent | null;
};

export type StateChangeEvent = {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
};

function createAppStore(initial?: Partial<AppState>) {
  let state: AppState = {
    activeView: "guide",
    selectedTopicId: "topic-1",
    selectedProjectId: "proj-1",
    agentOpen: false,
    activeArtifact: null,
    completedGuideBlocks: new Set(),
    highlightedGuideBlock: null,
    lastEvent: null,
    ...initial,
  };

  const listeners = new Set<() => void>();

  function emit() {
    for (const listener of listeners) listener();
  }

  return {
    getSnapshot(): AppState {
      return state;
    },

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    // ── Mutations ──

    setActiveView(view: AppView) {
      state = {
        ...state,
        activeView: view,
        activeArtifact: null,
        lastEvent: {
          type: "view_changed",
          payload: { view },
          timestamp: Date.now(),
        },
      };
      emit();
    },

    setSelectedTopic(topicId: string) {
      state = {
        ...state,
        selectedTopicId: topicId,
        lastEvent: {
          type: "topic_changed",
          payload: { topicId },
          timestamp: Date.now(),
        },
      };
      emit();
    },

    setSelectedProject(projectId: string) {
      state = {
        ...state,
        selectedProjectId: projectId,
        lastEvent: {
          type: "project_changed",
          payload: { projectId },
          timestamp: Date.now(),
        },
      };
      emit();
    },

    setAgentOpen(open: boolean) {
      state = {
        ...state,
        agentOpen: open,
        lastEvent: {
          type: "agent_toggled",
          payload: { open },
          timestamp: Date.now(),
        },
      };
      emit();
    },

    setActiveArtifact(artifact: string | null) {
      state = {
        ...state,
        activeArtifact: artifact,
        lastEvent: {
          type: "artifact_changed",
          payload: { artifact },
          timestamp: Date.now(),
        },
      };
      emit();
    },

    completeGuideBlock(blockId: string) {
      const completedGuideBlocks = new Set(state.completedGuideBlocks);
      completedGuideBlocks.add(blockId);
      state = {
        ...state,
        completedGuideBlocks,
        lastEvent: {
          type: "guide_block_completed",
          payload: { blockId },
          timestamp: Date.now(),
        },
      };
      emit();
    },

    uncompleteGuideBlock(blockId: string) {
      const completedGuideBlocks = new Set(state.completedGuideBlocks);
      completedGuideBlocks.delete(blockId);
      state = {
        ...state,
        completedGuideBlocks,
        lastEvent: {
          type: "guide_block_uncompleted",
          payload: { blockId },
          timestamp: Date.now(),
        },
      };
      emit();
    },

    highlightGuideBlock(blockId: string | null) {
      state = {
        ...state,
        highlightedGuideBlock: blockId,
        lastEvent: {
          type: "guide_block_highlighted",
          payload: { blockId },
          timestamp: Date.now(),
        },
      };
      emit();
    },

    /** Batch apply state from agent tool calls */
    applyAgentUpdate(
      update: Partial<
        Pick<
          AppState,
          | "activeView"
          | "selectedTopicId"
          | "selectedProjectId"
          | "agentOpen"
          | "activeArtifact"
          | "highlightedGuideBlock"
        >
      >,
    ) {
      state = {
        ...state,
        ...update,
        lastEvent: {
          type: "agent_update",
          payload: update as Record<string, unknown>,
          timestamp: Date.now(),
        },
      };
      emit();
    },
  };
}

export type AppStore = ReturnType<typeof createAppStore>;

// Singleton store
export const appStore = createAppStore();
