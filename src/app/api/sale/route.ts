import { NextRequest, NextResponse } from "next/server";
import { createSale, getAllSales, updateStockAfterSale } from "@/db/sale";
import { getProductById } from "@/db/product";
import { getUserById } from "@/db/user";

export async function POST(req: NextRequest) {
  try {
    const { soldProducts, buyer } = await req.json();

    await createSale({ soldProducts, buyer });
    await updateStockAfterSale(soldProducts);

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
    const rawSales = await getAllSales();

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
          buyer: buyer,
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
