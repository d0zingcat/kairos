ALTER TABLE "users" ADD COLUMN "publish_to_plaza" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "users_publish_to_plaza_idx" ON "users" USING btree ("publish_to_plaza");