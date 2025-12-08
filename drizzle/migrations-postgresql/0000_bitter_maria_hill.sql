CREATE TYPE "public"."billing_period" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."compliance_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('scheduled', 'completed', 'cancelled', 'no-show');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'past_due', 'trialing');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'starter', 'professional', 'enterprise');--> statement-breakpoint
CREATE TABLE "anonymous_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_active_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"converted_to_user_id" integer,
	"converted_at" timestamp,
	"ip_address" varchar(45),
	"user_agent" text,
	"referrer" text,
	"conversation_data" jsonb DEFAULT '[]'::jsonb,
	"extracted_data" jsonb DEFAULT '{}'::jsonb,
	"media_files" jsonb DEFAULT '[]'::jsonb,
	"engagement_score" integer DEFAULT 0 NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"session_duration_seconds" integer DEFAULT 0 NOT NULL,
	"value_delivered" boolean DEFAULT false NOT NULL,
	"conversion_prompt_shown" boolean DEFAULT false NOT NULL,
	"conversion_prompt_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "anonymous_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(256) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "client_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"folder_id" integer NOT NULL,
	"file_type" varchar(64) NOT NULL,
	"file_name" varchar(512) NOT NULL,
	"file_path" varchar(1024) NOT NULL,
	"file_size" integer,
	"mime_type" varchar(128),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"anonymous_session_id" uuid,
	"folder_path" varchar(512) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_folders_folder_path_unique" UNIQUE("folder_path")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"goals" text,
	"preferences" text,
	"imported_from_session_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"bio" text,
	"specialties" text,
	"certifications" text,
	"hourly_rate" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"content" text NOT NULL,
	"mood" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"token" varchar(256) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "magic_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" varchar(256),
	"password_salt" varchar(64),
	"name" text,
	"login_method" varchar(64) DEFAULT 'email',
	"role" "role" DEFAULT 'user' NOT NULL,
	"subscription_tier" "subscription_tier" DEFAULT 'free',
	"subscription_status" "subscription_status",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "anonymous_sessions" ADD CONSTRAINT "anonymous_sessions_converted_to_user_id_users_id_fk" FOREIGN KEY ("converted_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_files" ADD CONSTRAINT "client_files_folder_id_client_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."client_folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_folders" ADD CONSTRAINT "client_folders_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_folders" ADD CONSTRAINT "client_folders_anonymous_session_id_anonymous_sessions_id_fk" FOREIGN KEY ("anonymous_session_id") REFERENCES "public"."anonymous_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_imported_from_session_id_anonymous_sessions_id_fk" FOREIGN KEY ("imported_from_session_id") REFERENCES "public"."anonymous_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;