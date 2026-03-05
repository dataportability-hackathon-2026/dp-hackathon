import { NextResponse } from "next/server";
import { tools } from "@/lib/ai/tools";

type ToolName = keyof typeof tools;

export async function POST(req: Request) {
  const body = await req.json();
  const { tool: toolName, input } = body as {
    tool: string;
    input: Record<string, unknown>;
  };

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
  const result = await selectedTool.execute(input as never, {
    toolCallId: `agent-${toolName}-${Date.now()}`,
    messages: [],
  });
  return NextResponse.json(result);
}
