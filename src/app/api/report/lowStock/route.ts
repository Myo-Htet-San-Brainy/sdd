import { NextRequest, NextResponse } from "next/server";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { verifyPermission } from "@/lib/serverUtils";
import { getLowStockItems } from "@/db/report";

export async function GET(req: NextRequest) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.REPORT.PERMISSION_LOW_STOCK_ALERT.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    const lowStockItems = await getLowStockItems();

    return NextResponse.json(
      { products: lowStockItems || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Low stock fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
