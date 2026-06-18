CREATE TABLE IF NOT EXISTS "ai_daily_usage" (
	"user_id" text NOT NULL,
	"usage_date" text NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_daily_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "ai_daily_usage_pkey" PRIMARY KEY("user_id","usage_date")
);
