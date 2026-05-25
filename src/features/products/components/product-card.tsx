import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/shadcn/card";

import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { formatUSD } from "@/lib/money";
import type { Product } from "@/server/product/types";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden pt-0">
      {product.image ? (
        <img
          src={product.image}
          alt={product.title}
          className="h-48 w-full object-cover"
        />
      ) : null}
      <CardHeader>
        <CardTitle>{product.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold">
          {formatUSD(product.price)}
        </p>
      </CardContent>
      <CardFooter>
        <AddToCartButton productId={product.id} />
      </CardFooter>
    </Card>
  );
};
