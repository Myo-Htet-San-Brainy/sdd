import { NextRequest, NextResponse } from "next/server";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { verifyPermission } from "@/lib/serverUtils";
import { getSalesByBuyerAndMonth } from "@/db/report";
import { getUserById } from "@/db/user";

export async function GET(req: NextRequest) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.REPORT.PERMISSION_COMMISSION.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const commissionerId = searchParams.get("commissionerId");
    const dateParam = searchParams.get("date");

    if (!commissionerId || !dateParam) {
      return NextResponse.json(
        { error: "commissionerId and date are required" },
        { status: 400 }
      );
    }

    const commissioner = await getUserById(commissionerId);
    if (!commissioner) {
      return NextResponse.json(
        { error: "Commissioner not found" },
        { status: 404 }
      );
    }

    const commissionRate = commissioner.commissionRate;
    if (typeof commissionRate !== "number") {
      return NextResponse.json(
        { error: "Commission rate not defined for user" },
        { status: 400 }
      );
    }

    const sales = await getSalesByBuyerAndMonth(commissionerId, dateParam);

    const commissionReport = sales.map((sale: any) => {
      const total = sale.soldProducts.reduce(
        (sum: number, sp: any) => sum + sp.itemsToSell * sp.sellingPrice,
        0
      );
      return {
        saleId: sale._id,
        date: sale.createdAt,
        total,
        commissionAmount: total * (commissionRate / 100),
      };
    });

    return NextResponse.json({ report: commissionReport }, { status: 200 });
  } catch (error) {
    console.error("Commission report fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
