ALTER TABLE "cart" DROP CONSTRAINT IF EXISTS "cart_host_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "cart" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" DROP COLUMN IF EXISTS "host_user_id";