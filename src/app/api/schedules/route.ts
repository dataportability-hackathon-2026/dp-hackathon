import { db } from "@/db"
import { scheduledTask } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  const schedules = await db
    .select()
    .from(scheduledTask)
    .where(eq(scheduledTask.status, "active"))
    .orderBy(desc(scheduledTask.createdAt))
    .limit(50)

  return Response.json(
    schedules.map((s) => ({
      ...s,
      payload: s.payload ? JSON.parse(s.payload) : null,
    })),
  )
}
