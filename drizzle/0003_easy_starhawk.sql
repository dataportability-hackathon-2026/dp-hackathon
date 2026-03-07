CREATE TABLE "topic" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text DEFAULT 'Untitled' NOT NULL,
	"slug" text NOT NULL,
	"domain" text,
	"parent_group" text,
	"icon" text,
	"is_community" boolean DEFAULT false NOT NULL,
	"source_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "topic_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "topic_id" text;--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE no action ON UPDATE no action;