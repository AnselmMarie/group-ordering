ALTER TABLE "order_invitation" DROP CONSTRAINT "order_invitation_order_slot_unique";--> statement-breakpoint
ALTER TABLE "order_invitation" DROP CONSTRAINT "order_invitation_slot_range";--> statement-breakpoint
ALTER TABLE "order_invitation" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "order_invitation" ADD COLUMN "expires_at" timestamp (3) with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "order_invitation" ADD COLUMN "updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "order_invitation" DROP COLUMN "slot";--> statement-breakpoint
ALTER TABLE "order_invitation" ADD CONSTRAINT "order_invitation_status_check" CHECK ("order_invitation"."status" IN ('pending','accepted','rejected'));