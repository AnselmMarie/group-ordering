ALTER TABLE "cart_participant" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_participant" ADD COLUMN "role" text DEFAULT 'editor' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_participant_user_active_unique" ON "cart_participant" USING btree ("user_id") WHERE "cart_participant"."status" = 'active';--> statement-breakpoint
ALTER TABLE "cart_participant" ADD CONSTRAINT "cart_participant_status_check" CHECK ("cart_participant"."status" IN ('active','inactive'));--> statement-breakpoint
ALTER TABLE "cart_participant" ADD CONSTRAINT "cart_participant_role_check" CHECK ("cart_participant"."role" IN ('editor','owner'));