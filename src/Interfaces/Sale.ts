import { Product } from "./Product";

export interface Sale {
  _id: string;
  createdAt: string;
  buyer: string;
  soldProducts: SoldProduct[];
}

export interface SoldProduct {
  product: Product;
  sellingPrice: number;
  itemsToSell: number;
}
