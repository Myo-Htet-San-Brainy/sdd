import { NextRequest, NextResponse } from "next/server";
import {
  createSale,
  getAllSales,
  updateStockAfterTransaction,
} from "@/db/sale";
import { getProductById } from "@/db/product";
import { getUserById } from "@/db/user";
import { verifyPermission } from "@/lib/serverUtils";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";

export async function PATCH(req: NextRequest) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.SALE.PERMISSION_UPDATE.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }
    const prodsToRestock = await req.json();
    await updateStockAfterTransaction(prodsToRestock, { mode: "increase" });

    return NextResponse.json(
      { message: "Restock successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Restock error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
