import { NextRequest, NextResponse } from "next/server";
import { updateSale, getSaleById } from "@/db/sale"; // your new DB functions

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 🧠 Step 1: Ensure sale exists
    const existingSale = await getSaleById(id);
    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // 🧠 Step 2: Get payload from body
    const salePayload = await req.json();

    // 🛠️ Step 3: Update the sale
    const result = await updateSale(id, salePayload);
    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Failed to update sale" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Sale updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update sale error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
