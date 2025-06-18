import { NextRequest, NextResponse } from "next/server";
import { getAllProductsFieldValues } from "@/db/product";
import { verifyPermission } from "@/lib/serverUtils";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";

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
    const brand = searchParams.get("brand") === "true";
    const source = searchParams.get("source") === "true";
    const location = searchParams.get("location") === "true";

    if (!brand && !source && !location) {
      return NextResponse.json(
        {
          error:
            "Please provide at least one filter: brand, source, or location",
        },
        { status: 400 }
      );
    }

    const promises = [];

    brand
      ? promises.push(getAllProductsFieldValues("brand"))
      : promises.push(null);
    source
      ? promises.push(getAllProductsFieldValues("source"))
      : promises.push(null);
    location
      ? promises.push(getAllProductsFieldValues("location"))
      : promises.push(null);

    const [brands, sources, locations] = await Promise.all(promises);

    return NextResponse.json(
      {
        brands,
        sources,
        locations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get product meta error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
