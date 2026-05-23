import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/shadcn/card";

import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";

import type { Product } from "../data/product-data";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden pt-0">
      <img
        src={product.image}
        alt={product.title}
        className="h-48 w-full object-cover"
      />
      <CardHeader>
        <CardTitle>{product.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter>
        <AddToCartButton productId={product.id} />
      </CardFooter>
    </Card>
  );
}
