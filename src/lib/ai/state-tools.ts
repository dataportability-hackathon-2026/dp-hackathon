import { tool } from "ai"
import { z } from "zod"
import { TOPICS } from "@/lib/topics"

/**
 * AI agent tools for updating UI state.
 *
 * These tools return "state update" objects that the client reads from
 * tool-call results and applies to the appStore.
 */
export const stateTools = {
  navigate_to_view: tool({
    description:
      "Switch the main view/tab in the app. Use 'guide' to show the study guide, 'sources' to show uploaded files and materials, or 'progress' to show mastery and analytics.",
    inputSchema: z.object({
      view: z
        .enum(["guide", "sources", "progress"])
        .describe("The view to navigate to"),
    }),
    execute: async ({ view }) => {
      return { __stateUpdate: true, type: "navigate_to_view", view }
    },
  }),

  select_topic: tool({
    description:
      "Select a learning topic to focus on. Available topics include subjects like Linear Algebra, Calculus III, Machine Learning, etc. Use the topic name or ID.",
    inputSchema: z.object({
      topicIdentifier: z
        .string()
        .describe(
          "The topic name (e.g. 'Linear Algebra') or topic ID (e.g. 'topic-1')"
        ),
    }),
    execute: async ({ topicIdentifier }) => {
      const topic = TOPICS.find(
        (t) =>
          t.id === topicIdentifier ||
          t.name.toLowerCase() === topicIdentifier.toLowerCase()
      )
      if (!topic) {
        return {
          __stateUpdate: false,
          error: `Topic "${topicIdentifier}" not found. Available topics: ${TOPICS.map((t) => t.name).join(", ")}`,
        }
      }
      const defaultProject = topic.projects[0]
      return {
        __stateUpdate: true,
        type: "select_topic",
        topicId: topic.id,
        topicName: topic.name,
        projectId: defaultProject?.id ?? null,
        projectName: defaultProject?.name ?? null,
      }
    },
  }),

  select_project: tool({
    description:
      "Select a specific project within the current topic. Projects represent learning goals like 'Midterm Exam Prep' or 'Deep Dive - Eigenvalues'.",
    inputSchema: z.object({
      projectIdentifier: z
        .string()
        .describe(
          "The project name (e.g. 'Midterm Exam Prep') or project ID (e.g. 'proj-1')"
        ),
      topicIdentifier: z
        .string()
        .optional()
        .describe(
          "Optional topic name or ID to search within. If omitted, searches all topics."
        ),
    }),
    execute: async ({ projectIdentifier, topicIdentifier }) => {
      const searchTopics = topicIdentifier
        ? TOPICS.filter(
            (t) =>
              t.id === topicIdentifier ||
              t.name.toLowerCase() === topicIdentifier.toLowerCase()
          )
        : TOPICS

      for (const topic of searchTopics) {
        const project = topic.projects.find(
          (p) =>
            p.id === projectIdentifier ||
            p.name.toLowerCase() === projectIdentifier.toLowerCase()
        )
        if (project) {
          return {
            __stateUpdate: true,
            type: "select_project",
            topicId: topic.id,
            topicName: topic.name,
            projectId: project.id,
            projectName: project.name,
          }
        }
      }

      const allProjects = searchTopics.flatMap((t) =>
        t.projects.map((p) => `${t.name} > ${p.name}`)
      )
      return {
        __stateUpdate: false,
        error: `Project "${projectIdentifier}" not found. Available projects: ${allProjects.join(", ")}`,
      }
    },
  }),

  show_guide: tool({
    description:
      "Navigate to the study guide view and optionally highlight a specific guide block/day. Use this when the learner asks about their study plan or schedule.",
    inputSchema: z.object({
      highlightBlockId: z
        .string()
        .optional()
        .describe(
          "Optional guide block ID to highlight/scroll to (e.g. 'gb-1')"
        ),
    }),
    execute: async ({ highlightBlockId }) => {
      return {
        __stateUpdate: true,
        type: "show_guide",
        view: "guide",
        highlightBlockId: highlightBlockId ?? null,
      }
    },
  }),

  show_progress: tool({
    description:
      "Navigate to the progress/mastery view to show the learner their current mastery levels across concepts.",
    inputSchema: z.object({
      message: z
        .string()
        .optional()
        .describe("Optional message to accompany the navigation"),
    }),
    execute: async () => {
      return { __stateUpdate: true, type: "show_progress", view: "progress" }
    },
  }),

  show_sources: tool({
    description:
      "Navigate to the sources/files view to show uploaded materials, PDFs, and notes.",
    inputSchema: z.object({
      message: z
        .string()
        .optional()
        .describe("Optional message to accompany the navigation"),
    }),
    execute: async () => {
      return { __stateUpdate: true, type: "show_sources", view: "sources" }
    },
  }),

  complete_guide_block: tool({
    description:
      "Mark a study guide block as completed. Use when the learner says they finished a study session or block.",
    inputSchema: z.object({
      blockId: z.string().describe("The guide block ID to mark as completed"),
    }),
    execute: async ({ blockId }) => {
      return {
        __stateUpdate: true,
        type: "complete_guide_block",
        blockId,
      }
    },
  }),

  open_artifact: tool({
    description:
      "Open the artifact canvas to display a specific type of learning artifact. Types include: quiz, flashcards, mindmap, slidedeck, spatial, video, audio, report, infographic, datatable, manim, geo.",
    inputSchema: z.object({
      artifactType: z
        .enum([
          "quiz",
          "flashcards",
          "mindmap",
          "slidedeck",
          "spatial",
          "video",
          "audio",
          "report",
          "infographic",
          "datatable",
          "manim",
          "geo",
        ])
        .describe("The type of artifact to display"),
    }),
    execute: async ({ artifactType }) => {
      return {
        __stateUpdate: true,
        type: "open_artifact",
        artifact: artifactType,
      }
    },
  }),

  get_current_state: tool({
    description:
      "Get the current app state including active view, selected topic, selected project, and mastery data. Useful for understanding context before making suggestions.",
    inputSchema: z.object({}),
    execute: async () => {
      // Return available topics and their structure for the agent to reason about
      const topicSummaries = TOPICS.map((t) => ({
        id: t.id,
        name: t.name,
        domain: t.domain,
        parentGroup: t.parentGroup,
        projects: t.projects.map((p) => ({
          id: p.id,
          name: p.name,
          goalType: p.goalType,
          mastery: p.mastery,
        })),
        guideBlockCount: t.guideBlocks.length,
        completedBlocks: t.guideBlocks.filter((b) => b.completed).length,
        fileCount: t.files.length,
        conceptCount: t.masteryData.length,
      }))
      return {
        __stateUpdate: false,
        topics: topicSummaries,
      }
    },
  }),
}
