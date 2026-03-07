import { tool } from "ai"
import { z } from "zod"
import { start } from "workflow/api"
import { db } from "@/db"
import { scheduledTask } from "@/db/schema"
import { eq } from "drizzle-orm"
import { scheduledTaskWorkflow } from "@/workflows/scheduled-task"
import { generateAllArtifactsWorkflow } from "@/workflows/generate-all-artifacts"

export const scheduleTools = {
  create_schedule: tool({
    description:
      "Create a recurring schedule for reminders, artifact refresh, or progress reports. The schedule runs durably in the background using Vercel Workflows.",
    inputSchema: z.object({
      type: z
        .enum(["reminder", "artifact_refresh", "progress_report"])
        .describe("Type of scheduled task"),
      label: z.string().describe("Human-readable description of the schedule"),
      intervalHours: z
        .number()
        .positive()
        .describe("How often to run, in hours"),
      durationDays: z
        .number()
        .positive()
        .optional()
        .describe("How many days the schedule should last (null = forever)"),
      maxExecutions: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Maximum number of times to run (null = unlimited)"),
      message: z
        .string()
        .optional()
        .describe("Message content for reminders"),
      email: z
        .string()
        .email()
        .optional()
        .describe("Email address for notifications"),
      artifactTypes: z
        .array(z.string())
        .optional()
        .describe("Artifact types to refresh (for artifact_refresh type)"),
      subject: z.string().optional().describe("Subject for artifact generation"),
      concepts: z.array(z.string()).optional().describe("Concepts for artifact generation"),
    }),
    execute: async (input) => {
      const scheduleId = crypto.randomUUID()
      const intervalMs = input.intervalHours * 60 * 60 * 1000
      const expiresAt = input.durationDays
        ? new Date(Date.now() + input.durationDays * 24 * 60 * 60 * 1000)
        : null

      const payload = JSON.stringify({
        message: input.message,
        email: input.email,
        artifactTypes: input.artifactTypes,
        subject: input.subject,
        concepts: input.concepts,
      })

      await db.insert(scheduledTask).values({
        id: scheduleId,
        userId: "current-user", // Will be replaced by actual user ID at the API layer
        type: input.type,
        label: input.label,
        intervalMs,
        nextRunAt: new Date(Date.now() + intervalMs),
        expiresAt,
        payload,
        status: "active",
        maxExecutions: input.maxExecutions ?? null,
      })

      const run = await start(scheduledTaskWorkflow, [{ scheduleId }])

      await db
        .update(scheduledTask)
        .set({ wdkRunId: run.runId })
        .where(eq(scheduledTask.id, scheduleId))

      return {
        scheduleId,
        type: input.type,
        label: input.label,
        intervalHours: input.intervalHours,
        durationDays: input.durationDays ?? null,
        maxExecutions: input.maxExecutions ?? null,
        status: "active",
        message: `Schedule created: "${input.label}" — runs every ${input.intervalHours}h${input.durationDays ? ` for ${input.durationDays} days` : ""}.`,
      }
    },
  }),

  update_schedule: tool({
    description:
      "Update an existing schedule's settings. Changes take effect on the next wake cycle (DB-check-on-wake pattern).",
    inputSchema: z.object({
      scheduleId: z.string().describe("The schedule ID to update"),
      intervalHours: z
        .number()
        .positive()
        .optional()
        .describe("New interval in hours"),
      message: z.string().optional().describe("Updated message content"),
      maxExecutions: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Updated max executions"),
      durationDays: z
        .number()
        .positive()
        .optional()
        .describe("New duration in days from now"),
    }),
    execute: async (input) => {
      const existing = await db
        .select()
        .from(scheduledTask)
        .where(eq(scheduledTask.id, input.scheduleId))
        .limit(1)

      if (!existing[0]) {
        return { error: `Schedule ${input.scheduleId} not found.` }
      }

      const updates: Record<string, unknown> = { updatedAt: new Date() }

      if (input.intervalHours) {
        updates.intervalMs = input.intervalHours * 60 * 60 * 1000
      }

      if (input.durationDays) {
        updates.expiresAt = new Date(Date.now() + input.durationDays * 24 * 60 * 60 * 1000)
      }

      if (input.maxExecutions) {
        updates.maxExecutions = input.maxExecutions
      }

      if (input.message) {
        const currentPayload = existing[0].payload
          ? JSON.parse(existing[0].payload)
          : {}
        currentPayload.message = input.message
        updates.payload = JSON.stringify(currentPayload)
      }

      await db
        .update(scheduledTask)
        .set(updates)
        .where(eq(scheduledTask.id, input.scheduleId))

      return {
        scheduleId: input.scheduleId,
        updated: Object.keys(updates).filter((k) => k !== "updatedAt"),
        message: `Schedule "${existing[0].label}" updated. Changes take effect on next cycle.`,
      }
    },
  }),

  cancel_schedule: tool({
    description:
      "Cancel an active schedule. The workflow will exit on its next wake cycle.",
    inputSchema: z.object({
      scheduleId: z.string().describe("The schedule ID to cancel"),
    }),
    execute: async (input) => {
      const existing = await db
        .select()
        .from(scheduledTask)
        .where(eq(scheduledTask.id, input.scheduleId))
        .limit(1)

      if (!existing[0]) {
        return { error: `Schedule ${input.scheduleId} not found.` }
      }

      await db
        .update(scheduledTask)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(scheduledTask.id, input.scheduleId))

      return {
        scheduleId: input.scheduleId,
        label: existing[0].label,
        status: "cancelled",
        message: `Schedule "${existing[0].label}" cancelled. It will stop on its next cycle.`,
      }
    },
  }),

  generate_all_artifacts: tool({
    description:
      "Start a batch workflow to generate all artifact types (quiz, flashcards, mindmap, slides, spatial) for a given subject. Runs in the background and optionally sends an email when complete.",
    inputSchema: z.object({
      subject: z.string().describe("The subject or topic"),
      concepts: z.array(z.string()).min(1).describe("Key concepts to cover"),
      priorKnowledgeLevel: z
        .enum(["beginner", "intermediate", "advanced"])
        .describe("Learner's knowledge level"),
      goalType: z.string().describe("Learning goal"),
      notifyEmail: z
        .string()
        .email()
        .optional()
        .describe("Email to notify when all artifacts are ready"),
    }),
    execute: async (input) => {
      const workflowRunId = crypto.randomUUID()

      const run = await start(generateAllArtifactsWorkflow, [
        {
          userId: "current-user", // Replaced at API layer
          workflowRunId,
          input: {
            subject: input.subject,
            concepts: input.concepts,
            priorKnowledgeLevel: input.priorKnowledgeLevel,
            goalType: input.goalType,
          },
          notifyEmail: input.notifyEmail,
        },
      ])

      return {
        workflowRunId,
        wdkRunId: run.runId,
        status: "running",
        artifactTypes: ["quiz", "flashcards", "mindmap", "slidedeck", "spatial"],
        message: `Generating all 5 artifact types for "${input.subject}". This may take a few minutes. ${input.notifyEmail ? `You'll be emailed at ${input.notifyEmail} when complete.` : "Check back in the artifacts panel."}`,
      }
    },
  }),
}
