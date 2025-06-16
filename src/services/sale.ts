import { Product } from "@/Interfaces/Product";
import { Sale } from "@/Interfaces/Sale";
import { CustomError } from "@/lib/CustomError";
import axios from "axios";

export async function createSale({
  payload,
}: {
  payload: any;
  soldProductsTypes: string[];
}): Promise<void> {
  try {
    const response = await axios.post(`/api/sale`, payload);

    if (response.status !== 201) {
      throw new Error("Error creating sale!");
    }
  } catch (error: any) {
    console.log("error creating sale:", error);
    throw new CustomError("Internal Sever Error!", 500);
  }
}

export async function getAllSales(): Promise<Sale[]> {
  try {
    const response = await axios.get(`/api/sale`);

    if (response.status !== 200) {
      throw new Error("");
    }

    const { sales } = response.data;
    return sales;
  } catch (error: any) {
    console.log("error fetching sales:", error);
    throw new CustomError("Internal Sever Error!", 500);
  }
}
