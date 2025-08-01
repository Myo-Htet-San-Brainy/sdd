import { Product } from "@/Interfaces/Product";
import { Sale } from "@/Interfaces/Sale";
import { CustomError } from "@/lib/CustomError";
import axios, { isAxiosError } from "axios";

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

export async function getAllSales(createdDate: Date): Promise<Sale[]> {
  try {
    const dateString = createdDate.toISOString().split("T")[0]; // Format: yyyy-mm-dd
    const response = await axios.get(`/api/sale`, {
      params: { createdDate: dateString },
    });

    if (response.status !== 200) {
      throw new Error("Failed to fetch sales");
    }

    const { sales } = response.data;
    return sales;
  } catch (error: any) {
    console.error("error fetching sales:", error);
    throw new CustomError("Internal Server Error!", 500);
  }
}

export async function getSale({
  saleId,
  isOwn,
}: {
  saleId: string;
  isOwn?: "own";
}): Promise<Sale> {
  try {
    const response = await axios.get(`/api/sale/${saleId}`, {
      params: {
        isOwn,
      },
    });

    if (response.status !== 200) {
      throw new Error("");
    }

    const { sale } = response.data;
    return sale;
  } catch (error: any) {
    console.log("error fetching sale:", error);
    throw new CustomError("Internal Sever Error!", 500);
  }
}

export async function updateSale({
  saleId,
  salePayload,
}: {
  saleId: string;
  salePayload: any;
}): Promise<void> {
  try {
    const response = await axios.patch(`/api/sale/${saleId}`, salePayload);

    if (response.status !== 200) {
      throw new Error("");
    }
  } catch (error: any) {
    console.log("error updating sale:", error);
    if (isAxiosError(error) && error.response?.status === 404) {
      throw new CustomError("Sale Not Found!", 404);
    }
    throw new CustomError("Internal Sever Error!", 500);
  }
}

export async function restockSale({
  prodsToRestock,
}: {
  prodsToRestock: { _id: string; itemsToSell: number }[];
  typesOfRestockedProds: string[];
}): Promise<void> {
  try {
    const response = await axios.patch(`/api/sale/restock`, prodsToRestock);

    if (response.status !== 200) {
      throw new Error("");
    }
  } catch (error: any) {
    console.log("error restocking sale:", error);
    throw new CustomError("Internal Sever Error!", 500);
  }
}

export async function deleteSale({
  saleId,
}: {
  saleId: string;
}): Promise<void> {
  try {
    const response = await axios.delete(`/api/sale/${saleId}`);

    if (response.status !== 200) {
      throw new Error("");
    }
  } catch (error: any) {
    console.log("error deleting sale:", error);
    throw new CustomError("Internal Sever Error!", 500);
  }
}
