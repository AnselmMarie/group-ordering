export interface Product {
  id: string;
  title: string;
  price: number;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}
