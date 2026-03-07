import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { sleep } from "workflow";
import { db } from "@/db";
import { generatedArtifact, scheduledTask } from "@/db/schema";
import {
  type ArtifactInput,
  generateFlashcards,
  generateQuiz,
} from "@/lib/ai/generate-artifact";
import { sendEmail } from "@/lib/email";

type ScheduledTaskParams = {
  scheduleId: string;
};

type ScheduleRow = {
  id: string;
  userId: string;
  type: string;
  label: string;
  intervalMs: number;
  expiresAt: Date | null;
  payload: string | null;
  status: string;
  totalExecutions: number;
  maxExecutions: number | null;
};

async function loadScheduleFromDb(
  scheduleId: string,
): Promise<ScheduleRow | null> {
  "use step";
  const rows = await db
    .select()
    .from(scheduledTask)
    .where(eq(scheduledTask.id, scheduleId))
    .limit(1);
  return (rows[0] as ScheduleRow) ?? null;
}

function shouldTerminate(schedule: ScheduleRow): boolean {
  if (schedule.status === "cancelled" || schedule.status === "expired")
    return true;
  if (schedule.expiresAt && new Date() >= schedule.expiresAt) return true;
  if (
    schedule.maxExecutions &&
    schedule.totalExecutions >= schedule.maxExecutions
  )
    return true;
  return false;
}

async function executeReminder(schedule: ScheduleRow) {
  "use step";
  const payload = schedule.payload ? JSON.parse(schedule.payload) : {};
  const email = payload.email as string | undefined;
  if (!email) {
    console.log(`Reminder for user ${schedule.userId}: ${schedule.label}`);
    return;
  }
  await sendEmail({
    to: email,
    subject: `Reminder: ${schedule.label}`,
    html: `<p>${payload.message || schedule.label}</p>
<p>This is an automated reminder from CoreModel.</p>`,
  });
}

async function executeArtifactRefresh(schedule: ScheduleRow) {
  "use step";
  const payload = schedule.payload ? JSON.parse(schedule.payload) : {};
  const artifactTypes = (payload.artifactTypes as string[]) || ["quiz"];
  const input: ArtifactInput = {
    subject: payload.subject || "General",
    concepts: payload.concepts || [],
    priorKnowledgeLevel: payload.priorKnowledgeLevel || "intermediate",
    goalType: payload.goalType || "review",
  };

  for (const type of artifactTypes) {
    let data: unknown;
    switch (type) {
      case "quiz":
        data = await generateQuiz(input);
        break;
      case "flashcards":
        data = await generateFlashcards(input);
        break;
      default:
        continue;
    }
    const blob = await put(
      `artifacts/${schedule.userId}/${type}-refresh-${Date.now()}.json`,
      JSON.stringify(data),
      { access: "public", contentType: "application/json" },
    );
    await db.insert(generatedArtifact).values({
      userId: schedule.userId,
      artifactType: type,
      title: `${type} (refreshed) — ${new Date().toLocaleDateString()}`,
      blobUrl: blob.url,
      status: "completed",
    });
  }
}

async function executeProgressReport(schedule: ScheduleRow) {
  "use step";
  const payload = schedule.payload ? JSON.parse(schedule.payload) : {};
  const email = payload.email as string | undefined;
  if (!email) return;

  await sendEmail({
    to: email,
    subject: "Your Learning Progress Report — CoreModel",
    html: `<p>Here's your periodic progress update:</p>
<p><strong>${schedule.label}</strong></p>
<p>Sessions completed: ${schedule.totalExecutions + 1}</p>
<p>Visit CoreModel to see your full mastery dashboard.</p>`,
  });
}

async function incrementExecution(scheduleId: string, intervalMs: number) {
  "use step";
  const { sql } = await import("drizzle-orm");
  await db.execute(
    sql`UPDATE scheduled_task
        SET total_executions = total_executions + 1,
            next_run_at = ${new Date(Date.now() + intervalMs)},
            updated_at = NOW()
        WHERE id = ${scheduleId}`,
  );
}

async function expireSchedule(scheduleId: string) {
  "use step";
  await db
    .update(scheduledTask)
    .set({ status: "expired", updatedAt: new Date() })
    .where(eq(scheduledTask.id, scheduleId));
}

export async function scheduledTaskWorkflow(params: ScheduledTaskParams) {
  "use workflow";

  while (true) {
    const schedule = await loadScheduleFromDb(params.scheduleId);
    if (!schedule) return { terminated: true, reason: "schedule_not_found" };

    if (shouldTerminate(schedule)) {
      if (schedule.status === "active") {
        await expireSchedule(params.scheduleId);
      }
      return { terminated: true, reason: schedule.status };
    }

    switch (schedule.type) {
      case "reminder":
        await executeReminder(schedule);
        break;
      case "artifact_refresh":
        await executeArtifactRefresh(schedule);
        break;
      case "progress_report":
        await executeProgressReport(schedule);
        break;
    }

    await incrementExecution(params.scheduleId, schedule.intervalMs);

    // Sleep until the next run — durable, no resources consumed
    await sleep(new Date(Date.now() + schedule.intervalMs));
  }
}
