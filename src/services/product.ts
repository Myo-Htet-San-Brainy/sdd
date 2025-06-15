import { Product } from "@/Interfaces/Product";
import { CustomError } from "@/lib/CustomError";
import axios from "axios";

export async function getProductsByType(type: string): Promise<Product[]> {
  try {
    const response = await axios.get(`/api/product?type=${type}`);

    if (response.status !== 200) {
      throw new Error("Error fetching products!");
    }

    const { products } = response.data;
    return products;
  } catch (error: any) {
    console.log("error fetching products:", error);
    throw new CustomError("Internal Sever Error!", 500);
  }
}

export async function getMatchingProductTypes(type: string): Promise<string[]> {
  try {
    const response = await axios.get(`/api/product/suggestions?type=${type}`);

    if (response.status !== 200) {
      throw new Error("Error fetching suggestions!");
    }

    const { types } = response.data;
    return types;
  } catch (error: any) {
    console.log("error fetching suggestions:", error);
    throw new CustomError("Internal Sever Error!", 500);
  }
}

export async function createProduct({
  payload,
}: {
  payload: any;
}): Promise<void> {
  try {
    const response = await axios.post(`/api/product`, payload);

    if (response.status !== 201) {
      throw new Error("Error creating product!");
    }
  } catch (error: any) {
    console.log("error creating product:", error);
    throw new CustomError("Internal Sever Error!", 500);
  }
}

export async function getProductMeta(params: {
  brand?: boolean;
  location?: boolean;
  source?: boolean;
}): Promise<void> {
  try {
    const response = await axios.get(`/api/product/meta`, {
      params,
    });

    if (response.status !== 200) {
      throw new Error("Error product meta!");
    }
  } catch (error: any) {
    console.log("error getting product meta:", error);
    throw new CustomError("Internal Sever Error!", 500);
  }
}
