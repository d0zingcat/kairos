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
ALTER TABLE "books" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "music" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "watches" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
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