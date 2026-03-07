/**
 * Central domain data store using useSyncExternalStore pattern.
 * Holds artifacts, guide blocks, learning profile, mastery scores, and profile data.
 * Agent tool results write here; UI subscribes reactively.
 */

import { useRef, useSyncExternalStore } from "react"
import type { Artifact, ArtifactType } from "@/components/artifacts/artifact-store"
import {
  MOCK_VIDEOS,
  MOCK_AUDIO,
  MOCK_MINDMAPS,
  MOCK_QUIZZES,
  MOCK_DATATABLES,
  MOCK_FLASHCARDS,
  MOCK_REPORTS,
  MOCK_INFOGRAPHICS,
  MOCK_SLIDEDECKS,
  MOCK_SPATIALS,
  MOCK_MANIMS,
  MOCK_GEOS,
} from "@/components/artifacts/artifact-store"
import { TOPICS, type MockGuideBlock, type MockMastery } from "@/lib/topics"
import { MOCK_COMPLETED_PROFILE, type LearningProfileData } from "@/components/learning-profile-form"

// ── Types ──

export type ProfileStrength = {
  area: string
  score: number
  label: string
  description: string
}

export type MotivationProfile = {
  autonomy: number
  competence: number
  relatedness: number
}

export type CalibrationTendency = {
  tendency: string
  avgConfidence: number
  avgAccuracy: number
  gap: number
}

export type SystemAdaptation = {
  rule: string
  reason: string
}

export type DataState = {
  artifacts: Map<string, Artifact>
  artifactSeenCounts: Map<ArtifactType, number>
  guideBlocks: MockGuideBlock[]
  learningProfile: LearningProfileData | null
  masteryScores: MockMastery[]
  profileStrengths: ProfileStrength[]
  motivationProfile: MotivationProfile
  calibrationTendency: CalibrationTendency
  systemAdaptations: SystemAdaptation[]
  activeWorkflowRunId: string | null
}

// ── Seed values ──

const INITIAL_PROFILE_STRENGTHS: ProfileStrength[] = [
  { area: "Cognitive Reflection", score: 0.72, label: "Strong", description: "You pause to reason through tricky problems rather than going with your gut." },
  { area: "Metacognitive Awareness", score: 0.58, label: "Developing", description: "You have moderate self-awareness of your own learning, but tend to overestimate mastery." },
  { area: "Study Strategy Repertoire", score: 0.65, label: "Good", description: "You use active recall and spaced repetition. Could benefit from more elaboration techniques." },
  { area: "Self-Regulation", score: 0.52, label: "Developing", description: "Decent time management, but you sometimes skip reflection steps when pressed for time." },
]

const INITIAL_MOTIVATION_PROFILE: MotivationProfile = {
  autonomy: 0.78,
  competence: 0.62,
  relatedness: 0.45,
}

const INITIAL_CALIBRATION_TENDENCY: CalibrationTendency = {
  tendency: "Overconfident",
  avgConfidence: 0.80,
  avgAccuracy: 0.55,
  gap: 0.25,
}

const INITIAL_SYSTEM_ADAPTATIONS: SystemAdaptation[] = [
  { rule: "Chunk size reduced to 4 items", reason: "Cognitive load risk is high during eigenvalue practice" },
  { rule: "Reflection prompts every 3rd item", reason: "Calibration error (ECE 0.18) above threshold" },
  { rule: "Interleaved practice enabled at 40%", reason: "Cross-concept mastery reached 0.5 threshold" },
  { rule: "Autonomy-supportive coaching tone", reason: "High autonomy drive in motivation profile" },
]

function buildInitialArtifacts(): Map<string, Artifact> {
  const map = new Map<string, Artifact>()
  const allMocks: Artifact[] = [
    ...MOCK_VIDEOS,
    ...MOCK_AUDIO,
    ...MOCK_MINDMAPS,
    ...MOCK_QUIZZES,
    ...MOCK_DATATABLES,
    ...MOCK_FLASHCARDS,
    ...MOCK_REPORTS,
    ...MOCK_INFOGRAPHICS,
    ...MOCK_SLIDEDECKS,
    ...MOCK_SPATIALS,
    ...MOCK_MANIMS,
    ...MOCK_GEOS,
  ]
  for (const a of allMocks) {
    map.set(a.id, a)
  }
  return map
}

function buildInitialSeenCounts(artifacts: Map<string, Artifact>): Map<ArtifactType, number> {
  const counts = new Map<ArtifactType, number>()
  for (const a of artifacts.values()) {
    counts.set(a.type, (counts.get(a.type) ?? 0) + 1)
  }
  return counts
}

// ── Store ──

type Listener = () => void

function createDataStore() {
  const initialArtifacts = buildInitialArtifacts()
  let state: DataState = {
    artifacts: initialArtifacts,
    artifactSeenCounts: buildInitialSeenCounts(initialArtifacts),
    guideBlocks: TOPICS[0].guideBlocks,
    learningProfile: MOCK_COMPLETED_PROFILE,
    masteryScores: TOPICS[0].masteryData,
    profileStrengths: INITIAL_PROFILE_STRENGTHS,
    motivationProfile: INITIAL_MOTIVATION_PROFILE,
    calibrationTendency: INITIAL_CALIBRATION_TENDENCY,
    systemAdaptations: INITIAL_SYSTEM_ADAPTATIONS,
    activeWorkflowRunId: null,
  }

  const listeners = new Set<Listener>()

  function notify() {
    for (const listener of listeners) listener()
  }

  function getSnapshot(): DataState {
    return state
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  // ── Actions ──

  function addArtifact(artifact: Artifact) {
    const next = new Map(state.artifacts)
    next.set(artifact.id, artifact)
    state = { ...state, artifacts: next }
    notify()
  }

  function removeArtifact(id: string) {
    const next = new Map(state.artifacts)
    next.delete(id)
    state = { ...state, artifacts: next }
    notify()
  }

  function setGuideBlocks(blocks: MockGuideBlock[]) {
    state = { ...state, guideBlocks: blocks }
    notify()
  }

  function updateGuideBlock(id: string, patch: Partial<MockGuideBlock>) {
    state = {
      ...state,
      guideBlocks: state.guideBlocks.map((b) =>
        b.id === id ? { ...b, ...patch } : b
      ),
    }
    notify()
  }

  function setLearningProfile(profile: LearningProfileData) {
    state = { ...state, learningProfile: profile }
    notify()
  }

  function patchLearningProfile(patch: Partial<LearningProfileData>) {
    state = {
      ...state,
      learningProfile: state.learningProfile
        ? { ...state.learningProfile, ...patch }
        : null,
    }
    notify()
  }

  function setMasteryScores(scores: MockMastery[]) {
    state = { ...state, masteryScores: scores }
    notify()
  }

  function setProfileStrengths(strengths: ProfileStrength[]) {
    state = { ...state, profileStrengths: strengths }
    notify()
  }

  function setCalibrationTendency(cal: CalibrationTendency) {
    state = { ...state, calibrationTendency: cal }
    notify()
  }

  function setSystemAdaptations(adaptations: SystemAdaptation[]) {
    state = { ...state, systemAdaptations: adaptations }
    notify()
  }

  function setMotivationProfile(profile: MotivationProfile) {
    state = { ...state, motivationProfile: profile }
    notify()
  }

  function setActiveWorkflowRunId(runId: string | null) {
    state = { ...state, activeWorkflowRunId: runId }
    notify()
  }

  function markArtifactTypeSeen(type: ArtifactType) {
    const currentCount = Array.from(state.artifacts.values()).filter((a) => a.type === type).length
    const next = new Map(state.artifactSeenCounts)
    next.set(type, currentCount)
    state = { ...state, artifactSeenCounts: next }
    notify()
  }

  // ── Selectors ──

  function getArtifacts(): Artifact[] {
    return Array.from(state.artifacts.values())
  }

  function getArtifactsByType(type: ArtifactType): Artifact[] {
    return Array.from(state.artifacts.values()).filter((a) => a.type === type)
  }

  function getUnreadCount(type: ArtifactType): number {
    const total = Array.from(state.artifacts.values()).filter((a) => a.type === type).length
    const seen = state.artifactSeenCounts.get(type) ?? 0
    return Math.max(0, total - seen)
  }

  return {
    getSnapshot,
    subscribe,
    // Actions
    addArtifact,
    removeArtifact,
    setGuideBlocks,
    updateGuideBlock,
    setLearningProfile,
    patchLearningProfile,
    setMasteryScores,
    setProfileStrengths,
    setCalibrationTendency,
    setSystemAdaptations,
    setMotivationProfile,
    setActiveWorkflowRunId,
    markArtifactTypeSeen,
    // Selectors
    getArtifacts,
    getArtifactsByType,
    getUnreadCount,
  }
}

export const dataStore = createDataStore()

export function useDataStore<T>(selector: (state: DataState) => T): T {
  const prevRef = useRef<{ value: T; snapshot: DataState | null }>({ value: undefined as T, snapshot: null })

  return useSyncExternalStore(dataStore.subscribe, () => {
    const snapshot = dataStore.getSnapshot()
    if (snapshot === prevRef.current.snapshot) {
      return prevRef.current.value
    }
    const next = selector(snapshot)
    prevRef.current = { value: next, snapshot }
    return next
  })
}
