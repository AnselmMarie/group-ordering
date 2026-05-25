ALTER TABLE "cart_item" ALTER COLUMN "price" SET DATA TYPE integer USING ROUND("price" * 100)::integer;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "price" SET DATA TYPE integer USING ROUND("price" * 100)::integer;
