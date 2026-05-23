import { getCartCount } from "@/server/cart/actions";
import { CartSheet } from "@/features/cart/cart-sheet";
import { ProductCard } from "@/features/products/components/product-card";
import { products } from "@/features/products/data/product-data";

export default async function PageListPage() {
  const cartCount = await getCartCount();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">
            G
          </div>
          <span className="text-lg font-semibold tracking-tight">
            GroupOrder
          </span>
        </div>

        <CartSheet initialCount={cartCount} />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Featured items
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
