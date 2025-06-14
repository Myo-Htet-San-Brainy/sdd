import { Product } from "@/Interfaces/Product";
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
