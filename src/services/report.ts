import { Product } from "@/Interfaces/Product";
import { UnitsSoldReport } from "@/Interfaces/Report";
import { CommissionReport } from "@/Interfaces/Sale";
import { CustomError } from "@/lib/CustomError";
import axios from "axios";

export async function getLowStockProducts(): Promise<Product[]> {
  try {
    const response = await axios.get(`/api/report/lowStock`);

    if (response.status !== 200) {
      throw new Error("");
    }

    const { products } = response.data;
    return products;
  } catch (error: any) {
    console.log("Error fetching low stock products:", error);

    throw new CustomError("Internal Server Error!", 500);
  }
}

export async function getCommissionReports(params: {
  commissionerId: string;
  date: string;
}): Promise<CommissionReport[]> {
  try {
    const response = await axios.get(`/api/report/commission`, {
      params,
    });

    if (response.status !== 200) {
      throw new Error("");
    }

    const { report } = response.data;
    return report;
  } catch (error: any) {
    console.log("Error fetching commission Reports:", error);

    throw new CustomError("Internal Server Error!", 500);
  }
}

export async function getUnitsSoldReport(params: {
  from: string;
  to: string;
  sort: "most" | "least";
}): Promise<UnitsSoldReport[]> {
  try {
    const response = await axios.get(`/api/report/units-sold`, { params });

    if (response.status !== 200) {
      throw new Error("Failed to fetch units sold report");
    }

    return response.data.products;
  } catch (error: any) {
    console.log("Error fetching units sold report:", error);
    throw new CustomError("Internal Server Error!", 500);
  }
}
