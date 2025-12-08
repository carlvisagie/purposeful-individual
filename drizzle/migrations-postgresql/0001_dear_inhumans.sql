ALTER TABLE "anonymous_sessions" ALTER COLUMN "conversation_data" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "anonymous_sessions" ALTER COLUMN "extracted_data" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "anonymous_sessions" ALTER COLUMN "media_files" SET NOT NULL;