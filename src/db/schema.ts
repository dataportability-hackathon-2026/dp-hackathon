import {
  bigint,
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── Auth tables ────────────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  stripeCustomerId: text("stripe_customer_id"),
  role: text("role").default("user"),
  creditBalance: integer("credit_balance").default(0),
  creditExhaustionPolicy: text("credit_exhaustion_policy").default("pause"),
});

export const session = pgTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Billing tables ─────────────────────────────────────────────────────────

export const creditPurchase = pgTable("credit_purchase", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  stripeCheckoutSessionId: text("stripe_checkout_session_id")
    .notNull()
    .unique(),
  packSlug: text("pack_slug").notNull(),
  creditAmount: integer("credit_amount").notNull(),
  priceCents: integer("price_cents").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const creditLedger = pgTable("credit_ledger", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  referenceId: text("reference_id"),
  balanceAfter: integer("balance_after").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Topic table ───────────────────────────────────────────────────────────

export const topic = pgTable("topic", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull().default("Untitled"),
  slug: text("slug").notNull().unique(),
  domain: text("domain"),
  parentGroup: text("parent_group"),
  icon: text("icon"),
  isCommunity: boolean("is_community").notNull().default(false),
  isFavorite: boolean("is_favorite").notNull().default(false),
  sourceCount: integer("source_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Project & Source tables ────────────────────────────────────────────────

export const project = pgTable("project", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull(),
  topicSlug: text("topic_slug").notNull(),
  topicId: text("topic_id").references(() => topic.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const source = pgTable("source", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  projectId: text("project_id").references(() => project.id),
  topicSlug: text("topic_slug").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  blobUrl: text("blob_url").notNull(),
  status: text("status").notNull().default("ready"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Conversation tables ───────────────────────────────────────────────────

export const conversation = pgTable("conversation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const message = pgTable("message", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversation.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant"
  text: text("text").notNull(),
  modality: text("modality").notNull(), // "voice" | "text"
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Promo code tables ─────────────────────────────────────────────────────

export const promoCode = pgTable("promo_code", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  creditAmount: integer("credit_amount").notNull(), // internal units (1000x display)
  maxUses: integer("max_uses"), // null = unlimited
  usedCount: integer("used_count").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdBy: text("created_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const promoCodeRedemption = pgTable("promo_code_redemption", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  promoCodeId: text("promo_code_id")
    .notNull()
    .references(() => promoCode.id),
  creditAmount: integer("credit_amount").notNull(),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
});

// ─── Workflow tables ────────────────────────────────────────────────────────

export const workflowRun = pgTable("workflow_run", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  workflowType: text("workflow_type").notNull(),
  wdkRunId: text("wdk_run_id"),
  status: text("status").notNull().default("running"),
  input: text("input"),
  output: text("output"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scheduledTask = pgTable("scheduled_task", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  type: text("type").notNull(),
  label: text("label").notNull(),
  intervalMs: bigint("interval_ms", { mode: "number" }).notNull(),
  nextRunAt: timestamp("next_run_at"),
  expiresAt: timestamp("expires_at"),
  payload: text("payload"),
  status: text("status").notNull().default("active"),
  wdkRunId: text("wdk_run_id"),
  totalExecutions: integer("total_executions").default(0).notNull(),
  maxExecutions: integer("max_executions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const generatedArtifact = pgTable("generated_artifact", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  workflowRunId: text("workflow_run_id").references(() => workflowRun.id),
  artifactType: text("artifact_type").notNull(),
  title: text("title").notNull(),
  blobUrl: text("blob_url").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Usage tables ───────────────────────────────────────────────────────────

export const usageLog = pgTable("usage_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  creditsConsumed: integer("credits_consumed").notNull(),
  feature: text("feature").notNull(),
  stripeEventId: text("stripe_event_id"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── User preferences ───────────────────────────────────────────────────────

export const userPreferences = pgTable("user_preferences", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id),
  preferences: text("preferences").notNull(), // JSON-serialized UserPreferences
  templateId: text("template_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Assessment tables ──────────────────────────────────────────────────────

export const assessment = pgTable("assessment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  type: text("type").notNull(), // "full_onboarding" | "section_retake" | "periodic_check_in"
  status: text("status").notNull().default("in_progress"), // "in_progress" | "completed"
  version: integer("version").notNull().default(1),
  currentStep: integer("current_step").notNull().default(0),
  responses: text("responses"), // JSON-serialized LearningProfileData
  fingerprint: text("fingerprint"), // JSON-serialized cognitive fingerprint
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
