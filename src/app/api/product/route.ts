import { NextRequest, NextResponse } from "next/server";
import { createRole, getAllRoles } from "@/db/role";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hashPassword, verifyPermission } from "@/lib/serverUtils";
import { createUser, getAllUsers } from "@/db/user";
import { createProduct, getProductsByType } from "@/db/product";

export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type");

    const products = await getProductsByType(type!);

    const brands = new Set<string>();
    const descriptions = new Set<string>();

    for (const product of products || []) {
      if (product.brand) {
        brands.add(product.brand);
      } else {
        brands.add("no brand");
      }
      if (product.description) {
        descriptions.add(product.description);
      } else {
        descriptions.add("no description");
      }
    }

    return NextResponse.json(
      {
        products: products || [],
        distinctBrands: [...brands],
        distinctDescriptions: [...descriptions],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const permissionCheck = await verifyPermission(
      MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_CREATE.name
    );

    if (!permissionCheck.ok) {
      return NextResponse.json(
        { error: permissionCheck.message },
        { status: permissionCheck.status }
      );
    }

    const body = await req.json();

    const result = await createProduct(body);

    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create product." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Creating product successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
