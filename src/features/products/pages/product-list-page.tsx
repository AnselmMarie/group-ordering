import { getCartCount } from "@/server/cart/actions/get-cart-count";
import { productFindAll } from "@/server/product/repository/product-find-all";
import { MiniCart } from "@/features/cart/components/mini-cart";
import { MiniCartSummary } from "@/features/cart/components/mini-cart-summary";
import { GroupOrder } from "@/features/invitations/components/group-order";
import { ProductCard } from "@/features/products/components/product-card";
import { Header } from "@/ui/components/header";
import { Page } from "@/ui/components/layout/page";
import { Body } from "@/ui/components/layout/body";

export default async function ProductListPage() {
  const [cartCount, products] = await Promise.all([
    getCartCount(),
    productFindAll(),
  ]);

  return (
    <Page>
      <Header
        groupOrder={<GroupOrder />}
        miniCart={
          <MiniCart initialCount={cartCount} summary={<MiniCartSummary />} />
        }
      />

      <Body>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Featured items
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Body>
    </Page>
  );
}
