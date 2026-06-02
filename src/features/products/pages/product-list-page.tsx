import { toUserFacingMessage } from "@/lib/server/action-result";
import { getCartCount } from "@/server/cart/repository/get-cart-count";
import { getActiveCartRole } from "@/server/cart/repository/get-active-cart-role";
import { fetchAllProducts } from "@/server/product/fetch-all-products";
import { MiniCart } from "@/features/cart/components/mini-cart";
import { MiniCartSummary } from "@/features/cart/components/mini-cart-summary";
import { InvitationStatus } from "@/features/invitations/components/invitation-status";
import { GroupOrder } from "@/features/invitations/components/group-order";
import { ProductCard } from "@/features/products/components/product-card";
import { ProductsError } from "@/features/products/components/products-error";
import type { Product } from "@/server/product/types";
import { Header } from "@/ui/components/header";
import { Page } from "@/ui/components/layout/page";
import { Body } from "@/ui/components/layout/body";

const PRODUCTS_LOAD_ERROR =
  "We couldn't load the menu right now. Please try again.";

type ProductsResult =
  | { ok: true; products: Product[] }
  | { ok: false; error: string };

// Isolate the products fetch so a failure renders an inline error instead of
// rejecting the whole page (which would drop the header and mini-cart).
const loadProducts = (): Promise<ProductsResult> =>
  fetchAllProducts()
    .then((products) => ({ ok: true as const, products }))
    .catch((err: unknown) => ({
      ok: false as const,
      error: toUserFacingMessage(err, PRODUCTS_LOAD_ERROR),
    }));

export default async function ProductListPage() {
  const [cartCount, productsResult, cartRole] = await Promise.all([
    getCartCount(),
    loadProducts(),
    getActiveCartRole(),
  ]);

  return (
    <Page>
      <Header
        groupOrder={
          cartRole?.role !== "editor" ? (
            <GroupOrder inviteStatus={<InvitationStatus />} />
          ) : null
        }
        miniCart={
          <MiniCart initialCount={cartCount} summary={<MiniCartSummary />} />
        }
      />

      <Body>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Menu Items
        </h1>

        {productsResult.ok ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productsResult.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <ProductsError message={productsResult.error} />
        )}
      </Body>
    </Page>
  );
}
