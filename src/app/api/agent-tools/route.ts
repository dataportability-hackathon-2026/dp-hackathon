import { NextResponse } from "next/server";
import { tools } from "@/lib/ai/tools";
import { TOPICS } from "@/lib/topics";

// State management tools that return state-update instructions for the client
const stateHandlers: Record<
  string,
  (input: Record<string, unknown>) => {
    __stateUpdate: boolean;
    [key: string]: unknown;
  }
> = {
  navigate_to_view: (input) => {
    const view = input.view as string;
    return { __stateUpdate: true, type: "navigate_to_view", view };
  },
  select_topic: (input) => {
    const topicIdentifier = input.topicIdentifier as string;
    const topic = TOPICS.find(
      (t) =>
        t.id === topicIdentifier ||
        t.name.toLowerCase() === topicIdentifier.toLowerCase(),
    );
    if (!topic) {
      return {
        __stateUpdate: false,
        error: `Topic "${topicIdentifier}" not found.`,
      };
    }
    return {
      __stateUpdate: true,
      type: "select_topic",
      topicId: topic.id,
      topicName: topic.name,
      projectId: topic.projects[0]?.id ?? null,
    };
  },
  select_project: (input) => {
    const projectIdentifier = input.projectIdentifier as string;
    for (const topic of TOPICS) {
      const project = topic.projects.find(
        (p) =>
          p.id === projectIdentifier ||
          p.name.toLowerCase() === projectIdentifier.toLowerCase(),
      );
      if (project) {
        return {
          __stateUpdate: true,
          type: "select_project",
          topicId: topic.id,
          projectId: project.id,
        };
      }
    }
    return {
      __stateUpdate: false,
      error: `Project "${projectIdentifier}" not found.`,
    };
  },
  show_guide: (input) => {
    return {
      __stateUpdate: true,
      type: "show_guide",
      view: "guide",
      highlightBlockId: (input.highlightBlockId as string) ?? null,
    };
  },
  show_progress: () => {
    return { __stateUpdate: true, type: "show_progress", view: "progress" };
  },
  show_sources: () => {
    return { __stateUpdate: true, type: "show_sources", view: "sources" };
  },
  complete_guide_block: (input) => {
    return {
      __stateUpdate: true,
      type: "complete_guide_block",
      blockId: input.blockId as string,
    };
  },
  open_artifact: (input) => {
    return {
      __stateUpdate: true,
      type: "open_artifact",
      artifact: input.artifactType as string,
    };
  },
  get_current_state: () => {
    const topicSummaries = TOPICS.map((t) => ({
      id: t.id,
      name: t.name,
      domain: t.domain,
      projects: t.projects.map((p) => ({
        id: p.id,
        name: p.name,
        mastery: p.mastery,
      })),
    }));
    return { __stateUpdate: false, topics: topicSummaries };
  },
};

type ToolName = keyof typeof tools;

export async function POST(req: Request) {
  const body = await req.json();
  const { tool: toolName, input } = body as {
    tool: string;
    input: Record<string, unknown>;
  };

  // Check state tools first
  if (toolName in stateHandlers) {
    const result = stateHandlers[toolName](input);
    return NextResponse.json(result);
  }

  if (!(toolName in tools)) {
    return NextResponse.json(
      {
        error: `Unknown tool: ${toolName}`,
        availableTools: Object.keys(tools),
      },
      { status: 400 },
    );
  }

  const selectedTool = tools[toolName as ToolName];
  if (!selectedTool?.execute) {
    return NextResponse.json(
      { error: `Tool "${toolName}" has no execute method` },
      { status: 400 },
    );
  }
  const result = await selectedTool.execute(input as never, {
    toolCallId: `agent-${toolName}-${Date.now()}`,
    messages: [],
  });
  return NextResponse.json(result);
}
