import { artifactTools } from "./artifact-tools";
import { guideTools } from "./guide-tools";
import { profileTools } from "./profile-tools";
import { scheduleTools } from "./schedule-tools";

/**
 * Combined tool registry for the learning assistant.
 *
 * Four tool sets:
 *
 * 1. Profile Tools — Learning profile generation and assessment
 * 2. Guide Tools — 7-day learning guide generation and adaptation
 * 3. Artifact Tools — Learning material generation (quizzes, flashcards, etc.)
 * 4. Schedule Tools — Recurring tasks, batch generation, reminders
 */
export const tools = {
  ...profileTools,
  ...guideTools,
  ...artifactTools,
  ...scheduleTools,
};
