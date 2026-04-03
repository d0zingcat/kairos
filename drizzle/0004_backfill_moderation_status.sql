DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'moderation_status'
  ) THEN
    CREATE TYPE "public"."moderation_status" AS ENUM('approved', 'rejected', 'pending');
  END IF;
END
$$;--> statement-breakpoint

ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "moderation_status" "moderation_status";--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "moderation_status" SET DEFAULT 'approved';--> statement-breakpoint
UPDATE "books" SET "moderation_status" = 'approved' WHERE "moderation_status" IS NULL;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "moderation_status" SET NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "books_moderation_idx" ON "books" USING btree ("moderation_status");--> statement-breakpoint

ALTER TABLE "music" ADD COLUMN IF NOT EXISTS "moderation_status" "moderation_status";--> statement-breakpoint
ALTER TABLE "music" ALTER COLUMN "moderation_status" SET DEFAULT 'approved';--> statement-breakpoint
UPDATE "music" SET "moderation_status" = 'approved' WHERE "moderation_status" IS NULL;--> statement-breakpoint
ALTER TABLE "music" ALTER COLUMN "moderation_status" SET NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "music_moderation_idx" ON "music" USING btree ("moderation_status");--> statement-breakpoint

ALTER TABLE "watches" ADD COLUMN IF NOT EXISTS "moderation_status" "moderation_status";--> statement-breakpoint
ALTER TABLE "watches" ALTER COLUMN "moderation_status" SET DEFAULT 'approved';--> statement-breakpoint
UPDATE "watches" SET "moderation_status" = 'approved' WHERE "moderation_status" IS NULL;--> statement-breakpoint
ALTER TABLE "watches" ALTER COLUMN "moderation_status" SET NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watches_moderation_idx" ON "watches" USING btree ("moderation_status");--> statement-breakpoint

ALTER TABLE "games" ADD COLUMN IF NOT EXISTS "moderation_status" "moderation_status";--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "moderation_status" SET DEFAULT 'approved';--> statement-breakpoint
UPDATE "games" SET "moderation_status" = 'approved' WHERE "moderation_status" IS NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "moderation_status" SET NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "games_moderation_idx" ON "games" USING btree ("moderation_status");
