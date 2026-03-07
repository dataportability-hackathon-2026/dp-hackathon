import { tool } from "ai";
import { eq } from "drizzle-orm";
import { start } from "workflow/api";
import { z } from "zod";
import { db } from "@/db";
import { scheduledTask } from "@/db/schema";
import { generateArtifactsWorkflow } from "@/workflows/generate-all-artifacts";
import { scheduledTaskWorkflow } from "@/workflows/scheduled-task";

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
      message: z.string().optional().describe("Message content for reminders"),
      email: z
        .string()
        .email()
        .optional()
        .describe("Email address for notifications"),
      artifactTypes: z
        .array(z.string())
        .optional()
        .describe("Artifact types to refresh (for artifact_refresh type)"),
      subject: z
        .string()
        .optional()
        .describe("Subject for artifact generation"),
      concepts: z
        .array(z.string())
        .optional()
        .describe("Concepts for artifact generation"),
    }),
    execute: async (input) => {
      const scheduleId = crypto.randomUUID();
      const intervalMs = input.intervalHours * 60 * 60 * 1000;
      const expiresAt = input.durationDays
        ? new Date(Date.now() + input.durationDays * 24 * 60 * 60 * 1000)
        : null;

      const payload = JSON.stringify({
        message: input.message,
        email: input.email,
        artifactTypes: input.artifactTypes,
        subject: input.subject,
        concepts: input.concepts,
      });

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
      });

      const run = await start(scheduledTaskWorkflow, [{ scheduleId }]);

      await db
        .update(scheduledTask)
        .set({ wdkRunId: run.runId })
        .where(eq(scheduledTask.id, scheduleId));

      return {
        scheduleId,
        type: input.type,
        label: input.label,
        intervalHours: input.intervalHours,
        durationDays: input.durationDays ?? null,
        maxExecutions: input.maxExecutions ?? null,
        status: "active",
        message: `Schedule created: "${input.label}" — runs every ${input.intervalHours}h${input.durationDays ? ` for ${input.durationDays} days` : ""}.`,
      };
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
        .limit(1);

      if (!existing[0]) {
        return { error: `Schedule ${input.scheduleId} not found.` };
      }

      const updates: Record<string, unknown> = { updatedAt: new Date() };

      if (input.intervalHours) {
        updates.intervalMs = input.intervalHours * 60 * 60 * 1000;
      }

      if (input.durationDays) {
        updates.expiresAt = new Date(
          Date.now() + input.durationDays * 24 * 60 * 60 * 1000,
        );
      }

      if (input.maxExecutions) {
        updates.maxExecutions = input.maxExecutions;
      }

      if (input.message) {
        const currentPayload = existing[0].payload
          ? JSON.parse(existing[0].payload)
          : {};
        currentPayload.message = input.message;
        updates.payload = JSON.stringify(currentPayload);
      }

      await db
        .update(scheduledTask)
        .set(updates)
        .where(eq(scheduledTask.id, input.scheduleId));

      return {
        scheduleId: input.scheduleId,
        updated: Object.keys(updates).filter((k) => k !== "updatedAt"),
        message: `Schedule "${existing[0].label}" updated. Changes take effect on next cycle.`,
      };
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
        .limit(1);

      if (!existing[0]) {
        return { error: `Schedule ${input.scheduleId} not found.` };
      }

      await db
        .update(scheduledTask)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(scheduledTask.id, input.scheduleId));

      return {
        scheduleId: input.scheduleId,
        label: existing[0].label,
        status: "cancelled",
        message: `Schedule "${existing[0].label}" cancelled. It will stop on its next cycle.`,
      };
    },
  }),

  generate_artifacts: tool({
    description:
      "Start a batch workflow to generate one or many learning artifacts. " +
      "Supports multiple of the same type with different configs. " +
      "Shared fields apply to all artifacts unless overridden per-artifact. " +
      "Runs in the background via Vercel Workflows.",
    inputSchema: z.object({
      subject: z.string().describe("Shared subject or topic"),
      concepts: z
        .array(z.string())
        .min(1)
        .describe("Shared key concepts to cover"),
      priorKnowledgeLevel: z
        .enum(["beginner", "intermediate", "advanced"])
        .describe("Shared learner knowledge level"),
      goalType: z.string().describe("Shared learning goal"),
      sourceIds: z
        .array(z.string())
        .optional()
        .describe("Shared source IDs to include as reference material"),
      instructions: z
        .string()
        .optional()
        .describe("Shared additional instructions for generation"),
      artifacts: z
        .array(
          z.object({
            type: z
              .enum(["quiz", "flashcards", "mindmap", "slidedeck", "spatial"])
              .describe("Artifact type to generate"),
            subject: z
              .string()
              .optional()
              .describe("Override shared subject for this artifact"),
            concepts: z
              .array(z.string())
              .optional()
              .describe("Override shared concepts for this artifact"),
            priorKnowledgeLevel: z
              .enum(["beginner", "intermediate", "advanced"])
              .optional()
              .describe("Override shared level for this artifact"),
            goalType: z
              .string()
              .optional()
              .describe("Override shared goal for this artifact"),
            sourceIds: z
              .array(z.string())
              .optional()
              .describe("Override shared source IDs for this artifact"),
            instructions: z
              .string()
              .optional()
              .describe("Override shared instructions for this artifact"),
          }),
        )
        .min(1)
        .describe(
          "List of artifacts to generate. Each inherits shared config unless it provides overrides.",
        ),
      notifyEmail: z
        .string()
        .email()
        .optional()
        .describe("Email to notify when all artifacts are ready"),
    }),
    execute: async (input) => {
      const workflowRunId = crypto.randomUUID();

      const run = await start(generateArtifactsWorkflow, [
        {
          userId: "current-user", // Replaced at API layer
          workflowRunId,
          shared: {
            subject: input.subject,
            concepts: input.concepts,
            priorKnowledgeLevel: input.priorKnowledgeLevel,
            goalType: input.goalType,
            sourceIds: input.sourceIds,
            instructions: input.instructions,
          },
          artifacts: input.artifacts,
          notifyEmail: input.notifyEmail,
        },
      ]);

      const typeSummary = input.artifacts
        .map((a) => a.type)
        .reduce(
          (acc, t) => {
            acc[t] = (acc[t] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );
      const summaryStr = Object.entries(typeSummary)
        .map(([t, n]) => (n > 1 ? `${n}x ${t}` : t))
        .join(", ");

      return {
        workflowRunId,
        wdkRunId: run.runId,
        status: "running",
        totalArtifacts: input.artifacts.length,
        artifacts: input.artifacts.map((a) => a.type),
        message: `Generating ${input.artifacts.length} artifact(s) (${summaryStr}) for "${input.subject}". ${input.notifyEmail ? `You'll be emailed at ${input.notifyEmail} when complete.` : "Check back in the artifacts panel."}`,
      };
    },
  }),
};
