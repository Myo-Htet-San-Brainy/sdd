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

    let groupedLocations: string[][] = [];

    if (locations) {
      const locMap = new Map<string, string[]>();

      for (const loc of locations) {
        if (typeof loc !== "string") continue;

        if (!loc.includes("-")) {
          // Handle single, non-dash locations as their own group
          locMap.set(loc, [loc]);
          continue;
        }

        const parts = loc.split("-");
        const main = parts[0];
        const section = parts[1];
        const unit = parts[2];

        if (!main || !section || !unit) continue;

        const key = `${main}-${section}`;

        if (!locMap.has(key)) {
          locMap.set(key, []);
        }

        locMap.get(key)?.push(loc);
      }

      // Convert map values to array
      groupedLocations = Array.from(locMap.values());
    }

    return NextResponse.json(
      {
        brands,
        sources,
        locations: groupedLocations,
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
