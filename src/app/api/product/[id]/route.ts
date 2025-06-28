import { NextRequest, NextResponse } from "next/server";
import { getProductById, updateProductById } from "@/db/product";
import { verifyPermission } from "@/lib/serverUtils";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_READ.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }
    const { id } = await params;

    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_UPDATE.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();

    const result = await updateProductById(id, body);

    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Failed to update product." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Updating product successful!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
