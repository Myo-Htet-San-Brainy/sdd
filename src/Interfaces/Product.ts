export interface Product {
  _id: string; // optional if creating new product
  type: string[]; // array of strings
  description: string;
  brand: string;
  noOfItemsInStock: number;
  sellingPrice: number;
  location: string;
  buyingPrice?: number;
  source?: string;
  lowStockThreshold?: number;
  lastUpdated: string;
}
