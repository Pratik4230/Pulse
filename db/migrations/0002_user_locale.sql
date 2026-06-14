ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "country" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "currency" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "timezone" text;
