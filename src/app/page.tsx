"use client";

import { useState } from "react";
import { ShoppingCart, Users } from "lucide-react";

import { Button } from "@/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/components/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/components/sheet";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
}

const products: Product[] = [
  {
    id: "1",
    title: "Margherita Pizza",
    price: 12.99,
    image: "https://picsum.photos/seed/pizza/400/300",
  },
  {
    id: "2",
    title: "Spicy Tuna Roll",
    price: 9.5,
    image: "https://picsum.photos/seed/sushi/400/300",
  },
  {
    id: "3",
    title: "Classic Cheeseburger",
    price: 10.75,
    image: "https://picsum.photos/seed/burger/400/300",
  },
];

export default function Home() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">
            G
          </div>
          <span className="text-lg font-semibold tracking-tight">GroupOrder</span>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setSheetOpen(true)}>
            <Users />
            Group Order
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open cart"
            onClick={() => setSheetOpen(true)}
          >
            <ShoppingCart />
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Featured items
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden pt-0">
              <img
                src={product.image}
                alt={product.title}
                className="h-48 w-full object-cover"
              />
              <CardHeader>
                <CardTitle>{product.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  ${product.price.toFixed(2)}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Add to cart</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Your order</SheetTitle>
            <SheetDescription>
              Group order and cart details will appear here.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 text-sm text-muted-foreground">
            Nothing here yet — this is a shared placeholder for both the group
            order and cart views.
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
