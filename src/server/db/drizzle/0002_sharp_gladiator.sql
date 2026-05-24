CREATE TABLE "order_invitation" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"invited_email" text NOT NULL,
	"token" text NOT NULL,
	"accepted_by_user_id" uuid,
	"slot" smallint NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_invitation_token_unique" UNIQUE("token"),
	CONSTRAINT "order_invitation_order_slot_unique" UNIQUE("order_id","slot"),
	CONSTRAINT "order_invitation_order_email_unique" UNIQUE("order_id","invited_email"),
	CONSTRAINT "order_invitation_slot_range" CHECK ("order_invitation"."slot" BETWEEN 1 AND 3)
);
--> statement-breakpoint
ALTER TABLE "order_invitation" ADD CONSTRAINT "order_invitation_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_invitation" ADD CONSTRAINT "order_invitation_accepted_by_user_id_user_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;