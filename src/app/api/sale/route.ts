import { NextRequest, NextResponse } from "next/server";
import { createSale, updateStockAfterSale } from "@/db/sale";

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
