import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { source } from "@/db/schema";
import type { ClientStateSnapshot } from "@/lib/ai/client-state-snapshot";
import { extractSourceContent } from "@/lib/sources/extract-content";
import { TOPICS } from "@/lib/topics";

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
      return { __stateUpdate: true, type: "navigate_to_view", view };
    },
  }),

  select_topic: tool({
    description:
      "Select a learning topic to focus on. Available topics include subjects like Linear Algebra, Calculus III, Machine Learning, etc. Use the topic name or ID.",
    inputSchema: z.object({
      topicIdentifier: z
        .string()
        .describe(
          "The topic name (e.g. 'Linear Algebra') or topic ID (e.g. 'topic-1')",
        ),
    }),
    execute: async ({ topicIdentifier }) => {
      const topic = TOPICS.find(
        (t) =>
          t.id === topicIdentifier ||
          t.name.toLowerCase() === topicIdentifier.toLowerCase(),
      );
      if (!topic) {
        return {
          __stateUpdate: false,
          error: `Topic "${topicIdentifier}" not found. Available topics: ${TOPICS.map((t) => t.name).join(", ")}`,
        };
      }
      const defaultProject = topic.projects[0];
      return {
        __stateUpdate: true,
        type: "select_topic",
        topicId: topic.id,
        topicName: topic.name,
        projectId: defaultProject?.id ?? null,
        projectName: defaultProject?.name ?? null,
      };
    },
  }),

  select_project: tool({
    description:
      "Select a specific project within the current topic. Projects represent learning goals like 'Midterm Exam Prep' or 'Deep Dive - Eigenvalues'.",
    inputSchema: z.object({
      projectIdentifier: z
        .string()
        .describe(
          "The project name (e.g. 'Midterm Exam Prep') or project ID (e.g. 'proj-1')",
        ),
      topicIdentifier: z
        .string()
        .optional()
        .describe(
          "Optional topic name or ID to search within. If omitted, searches all topics.",
        ),
    }),
    execute: async ({ projectIdentifier, topicIdentifier }) => {
      const searchTopics = topicIdentifier
        ? TOPICS.filter(
            (t) =>
              t.id === topicIdentifier ||
              t.name.toLowerCase() === topicIdentifier.toLowerCase(),
          )
        : TOPICS;

      for (const topic of searchTopics) {
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
            topicName: topic.name,
            projectId: project.id,
            projectName: project.name,
          };
        }
      }

      const allProjects = searchTopics.flatMap((t) =>
        t.projects.map((p) => `${t.name} > ${p.name}`),
      );
      return {
        __stateUpdate: false,
        error: `Project "${projectIdentifier}" not found. Available projects: ${allProjects.join(", ")}`,
      };
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
          "Optional guide block ID to highlight/scroll to (e.g. 'gb-1')",
        ),
    }),
    execute: async ({ highlightBlockId }) => {
      return {
        __stateUpdate: true,
        type: "show_guide",
        view: "guide",
        highlightBlockId: highlightBlockId ?? null,
      };
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
      return { __stateUpdate: true, type: "show_progress", view: "progress" };
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
      return { __stateUpdate: true, type: "show_sources", view: "sources" };
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
      };
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
      };
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
      }));
      return {
        __stateUpdate: false,
        topics: topicSummaries,
      };
    },
  }),
};

// ── Read-only tools that inspect client-side state ──
// These are built dynamically per-request because the state snapshot
// comes from the client in the request body.

export function buildStateReadTools(
  snapshot: ClientStateSnapshot | null,
  context?: { userId?: string; topicSlug?: string },
) {
  return {
    read_app_state: tool({
      description:
        "Read the current app UI state: which view is active, which topic and project are selected, and which artifact type is displayed. Call this first to orient yourself before taking actions.",
      inputSchema: z.object({}),
      execute: async () => {
        if (!snapshot) return { error: "No client state available" };
        const topic = TOPICS.find((t) => t.id === snapshot.selectedTopicId);
        const project = topic?.projects.find(
          (p) => p.id === snapshot.selectedProjectId,
        );
        return {
          activeView: snapshot.activeView,
          selectedTopic: topic
            ? { id: topic.id, name: topic.name }
            : { id: snapshot.selectedTopicId, name: "Unknown" },
          selectedProject: project
            ? { id: project.id, name: project.name }
            : { id: snapshot.selectedProjectId, name: "Unknown" },
          activeArtifact: snapshot.activeArtifact,
          artifactCount: snapshot.artifacts.length,
          guideBlockCount: snapshot.guideBlocks.length,
          completedGuideBlocks: snapshot.completedGuideBlockIds.length,
        };
      },
    }),

    read_all_artifacts: tool({
      description:
        "List all learning artifacts currently in the app (quizzes, flashcards, mind maps, slides, etc.). Returns id, type, title, description, and topicSlug for each. Use read_artifact_detail to get the full content of a specific artifact.",
      inputSchema: z.object({
        type: z
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
            "remix",
          ])
          .optional()
          .describe("Optional: filter by artifact type"),
      }),
      execute: async ({ type }) => {
        if (!snapshot) return { error: "No client state available" };
        const filtered = type
          ? snapshot.artifacts.filter((a) => a.type === type)
          : snapshot.artifacts;
        return {
          count: filtered.length,
          artifacts: filtered.map((a) => ({
            id: a.id,
            type: a.type,
            title: a.title,
            description: a.description,
            topicSlug: a.topicSlug,
            createdAt: a.createdAt,
          })),
        };
      },
    }),

    read_artifact_detail: tool({
      description:
        "Get the full content of a specific artifact by ID, including all type-specific data (quiz questions, flashcard cards, mind map nodes, slide content, etc.).",
      inputSchema: z.object({
        artifactId: z.string().describe("The artifact ID to retrieve"),
      }),
      execute: async ({ artifactId }) => {
        if (!snapshot) return { error: "No client state available" };
        const artifact = snapshot.artifacts.find((a) => a.id === artifactId);
        if (!artifact) {
          return {
            error: `Artifact "${artifactId}" not found. Available IDs: ${snapshot.artifacts.map((a) => a.id).join(", ")}`,
          };
        }
        return artifact;
      },
    }),

    read_guide_blocks: tool({
      description:
        "Read the current 7-day study guide blocks, including which ones are completed. Use this to understand the learner's study plan and progress.",
      inputSchema: z.object({}),
      execute: async () => {
        if (!snapshot) return { error: "No client state available" };
        return {
          totalBlocks: snapshot.guideBlocks.length,
          completedCount: snapshot.completedGuideBlockIds.length,
          blocks: snapshot.guideBlocks.map((b) => ({
            ...b,
            completed:
              b.completed || snapshot.completedGuideBlockIds.includes(b.id),
          })),
        };
      },
    }),

    read_learner_profile: tool({
      description:
        "Read the learner's full profile including cognitive strengths, motivation (SDT), calibration tendency, and active system adaptations. Use this to personalize your responses and artifact generation.",
      inputSchema: z.object({}),
      execute: async () => {
        if (!snapshot) return { error: "No client state available" };
        return {
          learningProfile: snapshot.learningProfile,
          profileStrengths: snapshot.profileStrengths,
          motivationProfile: snapshot.motivationProfile,
          calibrationTendency: snapshot.calibrationTendency,
          systemAdaptations: snapshot.systemAdaptations,
        };
      },
    }),

    read_mastery_scores: tool({
      description:
        "Read the learner's per-concept mastery scores. Use this to identify weak areas, suggest practice topics, and track progress.",
      inputSchema: z.object({}),
      execute: async () => {
        if (!snapshot) return { error: "No client state available" };
        return {
          scores: snapshot.masteryScores,
          averageMastery:
            snapshot.masteryScores.length > 0
              ? snapshot.masteryScores.reduce((sum, s) => sum + s.score, 0) /
                snapshot.masteryScores.length
              : 0,
        };
      },
    }),

    read_sources: tool({
      description:
        "Read the uploaded source files/materials. Can return sources for a specific topic, the current topic, or ALL topics. Use this to understand what reference materials the learner has uploaded before generating artifacts or guides. When the learner asks 'what sources do I have' without specifying a topic, set allTopics to true.",
      inputSchema: z.object({
        topicSlug: z
          .string()
          .optional()
          .describe(
            "Topic slug to fetch sources for. If omitted, uses the currently selected topic (unless allTopics is true).",
          ),
        allTopics: z
          .boolean()
          .optional()
          .describe(
            "If true, return sources across ALL topics regardless of which topic is selected. Use this when the learner asks about their sources in general.",
          ),
      }),
      execute: async ({ topicSlug: slugOverride, allTopics }) => {
        const uid = context?.userId;
        if (!uid) return { error: "No authenticated user" };

        if (allTopics) {
          const rows = await db
            .select({
              id: source.id,
              topicSlug: source.topicSlug,
              filename: source.filename,
              mimeType: source.mimeType,
              sizeBytes: source.sizeBytes,
              blobUrl: source.blobUrl,
              excluded: source.excluded,
              status: source.status,
              createdAt: source.createdAt,
            })
            .from(source)
            .where(eq(source.userId, uid));

          return {
            allTopics: true,
            count: rows.length,
            totalSizeBytes: rows.reduce(
              (sum, r) => sum + Number(r.sizeBytes),
              0,
            ),
            sources: rows.map((r) => ({
              id: r.id,
              topicSlug: r.topicSlug,
              filename: r.filename,
              mimeType: r.mimeType,
              sizeBytes: Number(r.sizeBytes),
              blobUrl: r.blobUrl,
              excluded: r.excluded,
              status: r.status,
              createdAt: r.createdAt,
            })),
          };
        }

        const slug =
          slugOverride ?? context?.topicSlug ?? snapshot?.selectedTopicId;
        if (!slug) return { error: "No topic selected" };

        const rows = await db
          .select({
            id: source.id,
            filename: source.filename,
            mimeType: source.mimeType,
            sizeBytes: source.sizeBytes,
            blobUrl: source.blobUrl,
            excluded: source.excluded,
            status: source.status,
            createdAt: source.createdAt,
          })
          .from(source)
          .where(and(eq(source.userId, uid), eq(source.topicSlug, slug)));

        return {
          topicSlug: slug,
          count: rows.length,
          totalSizeBytes: rows.reduce((sum, r) => sum + Number(r.sizeBytes), 0),
          sources: rows.map((r) => ({
            id: r.id,
            filename: r.filename,
            mimeType: r.mimeType,
            sizeBytes: Number(r.sizeBytes),
            blobUrl: r.blobUrl,
            excluded: r.excluded,
            status: r.status,
            createdAt: r.createdAt,
          })),
        };
      },
    }),

    read_source_content: tool({
      description:
        "Read the full text content of an uploaded source file by its ID. Use this when the learner asks questions about a specific file, wants a summary, or you need to understand the material before generating artifacts. Call read_sources first to get the list of source IDs.",
      inputSchema: z.object({
        sourceId: z.string().describe("The source file ID to read"),
      }),
      execute: async ({ sourceId }) => {
        const uid = context?.userId;
        if (!uid) return { error: "No authenticated user" };

        const [row] = await db
          .select({
            id: source.id,
            filename: source.filename,
            mimeType: source.mimeType,
            blobUrl: source.blobUrl,
          })
          .from(source)
          .where(and(eq(source.id, sourceId), eq(source.userId, uid)));

        if (!row) return { error: "Source not found" };

        const content = await extractSourceContent(
          row.blobUrl,
          row.mimeType,
          row.filename,
        );

        if (!content) {
          return {
            id: row.id,
            filename: row.filename,
            error: "Could not extract text content from this file type",
          };
        }

        return { id: row.id, filename: row.filename, content };
      },
    }),
  };
}
