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

export async function POST(req: NextRequest) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.SALE.PERMISSION_CREATE.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }
    const { soldProducts, buyer } = await req.json();

    await createSale({ soldProducts, buyer });
    await updateStockAfterTransaction(soldProducts, { mode: "decrease" });

    return NextResponse.json(
      { message: "Creating sale successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create sale error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.SALE.PERMISSION_READ.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const createdDateStr = searchParams.get("createdDate");

    let createdDate: Date | undefined = undefined;

    if (createdDateStr) {
      createdDate = new Date(createdDateStr);
      if (isNaN(createdDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid createdDate format" },
          { status: 400 }
        );
      }
    }

    const rawSales = await getAllSales(createdDate); // 💥 pass it into DB function

    const formattedSales = await Promise.all(
      rawSales.map(async (sale) => {
        const enrichedSoldProducts = await Promise.all(
          sale.soldProducts.map(async (sp: any) => {
            const product = await getProductById(sp._id);
            return {
              product,
              sellingPrice: sp.sellingPrice,
              itemsToSell: sp.itemsToSell,
            };
          })
        );
        const buyer = sale.buyer && (await getUserById(sale.buyer));

        return {
          ...sale,
          buyer,
          soldProducts: enrichedSoldProducts,
        };
      })
    );

    return NextResponse.json({ sales: formattedSales }, { status: 200 });
  } catch (error) {
    console.error("Get sales error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
