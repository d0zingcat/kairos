CREATE TYPE "public"."book_status" AS ENUM('want_to_read', 'reading', 'finished', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('backlog', 'playing', 'completed', 'abandoned', 'platinum');--> statement-breakpoint
CREATE TYPE "public"."music_type" AS ENUM('track', 'album');--> statement-breakpoint
CREATE TYPE "public"."site_visibility" AS ENUM('public', 'private', 'password');--> statement-breakpoint
CREATE TYPE "public"."watch_status" AS ENUM('want_to_watch', 'watching', 'finished', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."watch_type" AS ENUM('movie', 'tv');--> statement-breakpoint
CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"visibility" "site_visibility" DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text,
	"title" text NOT NULL,
	"subtitle" text,
	"authors" text[],
	"cover_url" text,
	"isbn" text,
	"page_count" integer,
	"status" "book_status" DEFAULT 'want_to_read' NOT NULL,
	"rating" integer,
	"start_date" date,
	"finish_date" date,
	"notes" text,
	"favorite" boolean DEFAULT false NOT NULL,
	"tags" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text,
	"title" text NOT NULL,
	"cover_url" text,
	"platforms" text[],
	"genre" text[],
	"developer" text,
	"rating" integer,
	"start_date" date,
	"finish_date" date,
	"play_time_minutes" integer,
	"status" "game_status" DEFAULT 'backlog' NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"notes" text,
	"tags" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text,
	"type" "music_type" DEFAULT 'album' NOT NULL,
	"title" text NOT NULL,
	"artist" text,
	"album_title" text,
	"cover_url" text,
	"genre" text[],
	"rating" integer,
	"listen_date" date,
	"favorite" boolean DEFAULT false NOT NULL,
	"notes" text,
	"tags" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text,
	"type" "watch_type" DEFAULT 'movie' NOT NULL,
	"title" text NOT NULL,
	"poster_url" text,
	"director" text,
	"genre" text[],
	"runtime" integer,
	"rating" integer,
	"watch_date" date,
	"season_number" integer,
	"episode_number" integer,
	"status" "watch_status" DEFAULT 'want_to_watch' NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"notes" text,
	"tags" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
