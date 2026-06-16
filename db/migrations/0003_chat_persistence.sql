CREATE TABLE IF NOT EXISTS "chat_session" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "title" text NOT NULL DEFAULT 'New chat',
  "message_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "chat_session_user_id_updated_at_idx"
  ON "chat_session" ("user_id", "updated_at" DESC);

CREATE TABLE IF NOT EXISTS "chat_message" (
  "id" text PRIMARY KEY NOT NULL,
  "session_id" text NOT NULL REFERENCES "chat_session"("id") ON DELETE CASCADE,
  "role" text NOT NULL,
  "parts" jsonb NOT NULL,
  "sequence" integer NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "chat_message_session_id_sequence_unique" UNIQUE ("session_id", "sequence")
);

CREATE INDEX IF NOT EXISTS "chat_message_session_id_sequence_idx"
  ON "chat_message" ("session_id", "sequence");

CREATE TABLE IF NOT EXISTS "chat_session_summary" (
  "id" text PRIMARY KEY NOT NULL,
  "session_id" text NOT NULL REFERENCES "chat_session"("id") ON DELETE CASCADE,
  "from_sequence" integer NOT NULL,
  "to_sequence" integer NOT NULL,
  "summary" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "chat_session_summary_session_to_sequence_unique" UNIQUE ("session_id", "to_sequence")
);
