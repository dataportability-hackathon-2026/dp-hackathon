import { db } from "@/db"
import { workflowRun, generatedArtifact } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const runs = await db
    .select()
    .from(workflowRun)
    .where(eq(workflowRun.id, id))
    .limit(1)

  if (!runs[0]) {
    return Response.json({ error: "Workflow run not found" }, { status: 404 })
  }

  const artifacts = await db
    .select()
    .from(generatedArtifact)
    .where(eq(generatedArtifact.workflowRunId, id))

  return Response.json({
    ...runs[0],
    output: runs[0].output ? JSON.parse(runs[0].output) : null,
    input: runs[0].input ? JSON.parse(runs[0].input) : null,
    artifacts,
  })
}
