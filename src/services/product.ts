import { Product } from "@/Interfaces/Product";
import { CustomError } from "@/lib/CustomError";
import axios from "axios";

//get roles fn
// no parameters

//return Role[]
//check if 200

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

export async function getMatchingProductTypes(
  type: string
): Promise<Product[]> {
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
