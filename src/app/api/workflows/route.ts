import { db } from "@/db"
import { workflowRun } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const type = searchParams.get("type")

  let query = db
    .select()
    .from(workflowRun)
    .orderBy(desc(workflowRun.createdAt))
    .limit(50)

  if (status) {
    query = query.where(eq(workflowRun.status, status)) as typeof query
  }
  if (type) {
    query = query.where(eq(workflowRun.workflowType, type)) as typeof query
  }

  const runs = await query
  return Response.json(runs)
}
