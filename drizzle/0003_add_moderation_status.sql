CREATE TYPE "public"."moderation_status" AS ENUM('approved', 'rejected', 'pending');--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "moderation_status" "moderation_status" DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "music" ADD COLUMN "moderation_status" "moderation_status" DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "watches" ADD COLUMN "moderation_status" "moderation_status" DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "moderation_status" "moderation_status" DEFAULT 'approved' NOT NULL;--> statement-breakpoint
CREATE INDEX "books_moderation_idx" ON "books" USING btree ("moderation_status");--> statement-breakpoint
CREATE INDEX "music_moderation_idx" ON "music" USING btree ("moderation_status");--> statement-breakpoint
CREATE INDEX "watches_moderation_idx" ON "watches" USING btree ("moderation_status");--> statement-breakpoint
CREATE INDEX "games_moderation_idx" ON "games" USING btree ("moderation_status");
