CREATE TYPE "public"."user_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"is_public_profile" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "music" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "watches" ADD COLUMN "user_id" uuid;--> statement-breakpoint
DO $$
DECLARE
	default_user_id uuid;
BEGIN
	SELECT "id" INTO default_user_id
	FROM "users"
	ORDER BY "created_at" ASC
	LIMIT 1;

	IF default_user_id IS NULL THEN
		INSERT INTO "users" (
			"username",
			"password_hash",
			"role",
			"is_public_profile",
			"is_active"
		)
		VALUES (
			'legacy_migrated_user',
			'migrated-no-login',
			'member',
			false,
			false
		)
		RETURNING "id" INTO default_user_id;
	END IF;

	UPDATE "books" SET "user_id" = default_user_id WHERE "user_id" IS NULL;
	UPDATE "games" SET "user_id" = default_user_id WHERE "user_id" IS NULL;
	UPDATE "music" SET "user_id" = default_user_id WHERE "user_id" IS NULL;
	UPDATE "watches" SET "user_id" = default_user_id WHERE "user_id" IS NULL;
END $$;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "music" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "watches" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_public_profile_idx" ON "users" USING btree ("is_public_profile");--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music" ADD CONSTRAINT "music_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watches" ADD CONSTRAINT "watches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "books_user_idx" ON "books" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "games_user_idx" ON "games" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "music_user_idx" ON "music" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "watches_user_idx" ON "watches" USING btree ("user_id");