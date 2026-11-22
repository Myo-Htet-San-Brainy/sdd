import { Product } from "./Product";

export interface Sale {
  _id: string;
  createdAt: string;
  buyer: {
    _id: string;
    username: string;
    commissionRate: number | null;
  } | null;
  soldProducts: SoldProduct[];
}

export interface SoldProduct {
  product: Product;
  type: string[];
  description: string;
  brand: string;
  buyingPrice: number;
  sellingPrice: number;
  itemsToSell: number;
}

export interface CommissionReport {
  saleId: string;
  date: string;
  total: number;
  commissionAmount: number;
}
