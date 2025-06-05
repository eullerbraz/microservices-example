CREATE TABLE "streamings-progress" (
	"user_id" text NOT NULL,
	"streaming_id" text NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "streamings-progress" ADD CONSTRAINT "streamings-progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;