export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
}

export const products: ReadonlyArray<Product> = [
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
