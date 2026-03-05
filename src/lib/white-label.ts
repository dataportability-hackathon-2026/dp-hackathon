// ─── White-Label Site Configuration ─────────────────────────────────────────
// This module centralizes all brand-specific values so the entire app can be
// white-labeled by swapping a single config object (or pointing the
// NEXT_PUBLIC_SITE_CONFIG env var at a different preset).

export type SiteConfig = {
  // ── Identity ──
  name: string
  tagline: string
  description: string
  /** URL path to logo (placed in /public). null = use default icon. */
  logoPath: string | null
  /** Lucide icon name used when logoPath is null */
  fallbackIcon: string
  supportEmail: string
  /** Legal entity shown in footer / terms */
  legalEntity: string

  // ── Auth copy ──
  auth: {
    signInHeading: string
    signUpHeading: string
    signUpCta: string
    emailPlaceholder: string
  }

  // ── Feature flags ──
  features: {
    /** Show credit-pack billing UI */
    billing: boolean
    /** Show MCP / API integration panel */
    integrations: boolean
    /** Show LiveKit voice agent */
    voiceAgent: boolean
    /** Show the landing / marketing page */
    landingPage: boolean
    /** Allow users to create custom topics */
    customTopics: boolean
  }

  // ── Theme overrides (CSS custom properties) ──
  // Values here are injected as CSS vars on <html>, overriding globals.css.
  // Use oklch() strings to match the existing design tokens.
  theme: {
    light?: Record<string, string>
    dark?: Record<string, string>
  }

  // ── Content defaults ──
  /** Pre-loaded topic groups shown for new users (empty = all) */
  defaultTopicGroups: string[]
  /** URL shown in MCP / API integration panel */
  apiBaseUrl: string
  mcpBaseUrl: string
}

// ─── Built-in Presets ────────────────────────────────────────────────────────

const coreModelConfig: SiteConfig = {
  name: "CoreModel",
  tagline: "Evidence-Based Adaptive Learning",
  description:
    "Ingest your study materials, build a scientific learner profile, and get adaptive recommendations with explicit uncertainty and full audit trails.",
  logoPath: null,
  fallbackIcon: "Brain",
  supportEmail: "support@coremodel.ai",
  legalEntity: "CoreModel Inc.",

  auth: {
    signInHeading: "Welcome back",
    signUpHeading: "Create your account",
    signUpCta: "Start your adaptive learning journey",
    emailPlaceholder: "you@university.edu",
  },

  features: {
    billing: true,
    integrations: true,
    voiceAgent: true,
    landingPage: true,
    customTopics: true,
  },

  theme: {},

  defaultTopicGroups: [],
  apiBaseUrl: "https://api.coremodel.ai/v1",
  mcpBaseUrl: "https://mcp.coremodel.ai/v1/sse",
}

const consumerConfig: SiteConfig = {
  name: "StudyPal",
  tagline: "Learn Anything, Your Way",
  description:
    "Upload your notes, let AI build a personalized study plan, and master any subject with smart flashcards, quizzes, and progress tracking.",
  logoPath: null,
  fallbackIcon: "Sparkles",
  supportEmail: "help@studypal.app",
  legalEntity: "StudyPal LLC",

  auth: {
    signInHeading: "Welcome back!",
    signUpHeading: "Start learning for free",
    signUpCta: "Create your free account",
    emailPlaceholder: "you@email.com",
  },

  features: {
    billing: true,
    integrations: false, // consumers don't need MCP/API
    voiceAgent: true,
    landingPage: true,
    customTopics: true,
  },

  theme: {
    light: {
      "--primary": "oklch(0.55 0.25 260)",
      "--primary-foreground": "oklch(0.98 0 0)",
    },
    dark: {
      "--primary": "oklch(0.65 0.25 260)",
      "--primary-foreground": "oklch(0.12 0 0)",
    },
  },

  defaultTopicGroups: [],
  apiBaseUrl: "https://api.studypal.app/v1",
  mcpBaseUrl: "https://mcp.studypal.app/v1/sse",
}

const higherEdConfig: SiteConfig = {
  name: "Adaptive Campus",
  tagline: "Institutional Adaptive Learning Platform",
  description:
    "Evidence-based adaptive learning for your entire institution. LTI-ready, FERPA-compliant, with full audit trails and instructor dashboards.",
  logoPath: null,
  fallbackIcon: "GraduationCap",
  supportEmail: "support@adaptivecampus.edu",
  legalEntity: "Adaptive Campus, a CoreModel product",

  auth: {
    signInHeading: "Sign in with your institution",
    signUpHeading: "Register with your .edu email",
    signUpCta: "Get started with your institutional account",
    emailPlaceholder: "you@university.edu",
  },

  features: {
    billing: false, // institution pays, not students
    integrations: true, // LTI / LMS integrations
    voiceAgent: true,
    landingPage: false, // redirect straight to SSO
    customTopics: false, // admin-managed curriculum
  },

  theme: {
    light: {
      "--primary": "oklch(0.35 0.15 240)",
      "--primary-foreground": "oklch(0.98 0 0)",
    },
    dark: {
      "--primary": "oklch(0.55 0.18 240)",
      "--primary-foreground": "oklch(0.98 0 0)",
    },
  },

  defaultTopicGroups: [],
  apiBaseUrl: "https://api.adaptivecampus.edu/v1",
  mcpBaseUrl: "https://mcp.adaptivecampus.edu/v1/sse",
}

// ─── Preset registry ─────────────────────────────────────────────────────────

export const SITE_PRESETS = {
  coremodel: coreModelConfig,
  consumer: consumerConfig,
  "higher-ed": higherEdConfig,
} as const

export type SitePresetKey = keyof typeof SITE_PRESETS

// ─── Active config resolution ────────────────────────────────────────────────
// Set NEXT_PUBLIC_SITE_PRESET=consumer | higher-ed | coremodel (default)

function resolveConfig(): SiteConfig {
  const key =
    (process.env.NEXT_PUBLIC_SITE_PRESET as SitePresetKey) || "coremodel"
  return SITE_PRESETS[key] ?? SITE_PRESETS.coremodel
}

/** The active site configuration. Import this everywhere you need brand values. */
export const siteConfig: SiteConfig = resolveConfig()
