ALTER TABLE "order" RENAME TO "cart";--> statement-breakpoint
ALTER TABLE "order_invitation" RENAME TO "cart_invitation";--> statement-breakpoint
ALTER TABLE "order_item" RENAME TO "cart_item";--> statement-breakpoint
ALTER TABLE "order_participant" RENAME TO "cart_participant";--> statement-breakpoint
ALTER TABLE "cart_invitation" RENAME COLUMN "order_id" TO "cart_id";--> statement-breakpoint
ALTER TABLE "cart_item" RENAME COLUMN "order_id" TO "cart_id";--> statement-breakpoint
ALTER TABLE "cart_participant" RENAME COLUMN "order_id" TO "cart_id";--> statement-breakpoint
ALTER TABLE "cart_invitation" DROP CONSTRAINT "order_invitation_token_unique";--> statement-breakpoint
ALTER TABLE "cart_invitation" DROP CONSTRAINT "order_invitation_order_email_unique";--> statement-breakpoint
ALTER TABLE "cart_invitation" DROP CONSTRAINT "order_invitation_status_check";--> statement-breakpoint
ALTER TABLE "cart" DROP CONSTRAINT "order_host_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_invitation" DROP CONSTRAINT "order_invitation_order_id_order_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_invitation" DROP CONSTRAINT "order_invitation_accepted_by_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_item" DROP CONSTRAINT "order_item_order_id_order_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_item" DROP CONSTRAINT "order_item_product_id_product_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_item" DROP CONSTRAINT "order_item_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_participant" DROP CONSTRAINT "order_participant_order_id_order_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_participant" DROP CONSTRAINT "order_participant_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_participant" DROP CONSTRAINT "order_participant_order_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "cart_participant" ADD CONSTRAINT "cart_participant_cart_id_user_id_pk" PRIMARY KEY("cart_id","user_id");--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_host_user_id_user_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_invitation" ADD CONSTRAINT "cart_invitation_cart_id_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_invitation" ADD CONSTRAINT "cart_invitation_accepted_by_user_id_user_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_participant" ADD CONSTRAINT "cart_participant_cart_id_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_participant" ADD CONSTRAINT "cart_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_invitation" DROP COLUMN "token";--> statement-breakpoint
ALTER TABLE "cart_invitation" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "cart_invitation" ADD CONSTRAINT "cart_invitation_cart_email_unique" UNIQUE("cart_id","invited_email");--> statement-breakpoint
ALTER TABLE "cart_invitation" ADD CONSTRAINT "cart_invitation_status_check" CHECK ("cart_invitation"."status" IN ('pending','accepted','rejected'));