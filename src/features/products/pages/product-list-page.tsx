import { getCartCount } from "@/server/cart/actions";
import { findAll as findAllProducts } from "@/server/product/repository";
import { Cart } from "@/features/cart/components/cart";
import { GroupOrder } from "@/features/invitations/components/group-order";
import { ProductCard } from "@/features/products/components/product-card";
import { Header } from "@/ui/components/header";
import { Page } from "@/ui/layout/page";
import { Body } from "@/ui/layout/body";

export default async function ProductListPage() {
  const [cartCount, products] = await Promise.all([
    getCartCount(),
    findAllProducts(),
  ]);

  return (
    <Page>
      <Header
        groupOrder={<GroupOrder />}
        cart={<Cart initialCount={cartCount} />}
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
