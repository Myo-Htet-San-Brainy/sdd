import { NextRequest, NextResponse } from "next/server";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { verifyPermission } from "@/lib/serverUtils";
import {
  getMatchingProductTypes,
  getUniqueTypeArraysOfMatchedProducts,
} from "@/db/product";

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
    const mode = searchParams.get("mode"); // ➤ new param: types | arrays

    if (!type || !mode) {
      return NextResponse.json(
        { error: "Missing required query parameters: 'type' and 'mode'" },
        { status: 400 }
      );
    }

    let data;

    if (mode === "types") {
      data = await getMatchingProductTypes(type);
    } else if (mode === "arrays") {
      data = await getUniqueTypeArraysOfMatchedProducts(type);
    } else {
      return NextResponse.json(
        { error: "Invalid mode. Use 'types' or 'arrays'" },
        { status: 400 }
      );
    }

    return NextResponse.json({ types: data }, { status: 200 });
  } catch (error) {
    console.error("Get product types error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
