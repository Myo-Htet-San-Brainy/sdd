import { NextRequest, NextResponse } from "next/server";
import { createRole, getAllRoles } from "@/db/role";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hashPassword, verifyPermission } from "@/lib/serverUtils";
import { createUser, getAllUsers } from "@/db/user";
import { createProduct, getProducts } from "@/db/product";
import { stringSimilarity } from "string-similarity-js";

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
    const brand = searchParams.get("brand");
    const type = searchParams.get("type");
    const location = searchParams.get("location");
    const source = searchParams.get("source");
    const noOfItemsInStockRaw = searchParams.get("noOfItemsInStock");

    const filterObj: any = {};
    if (type) {
      filterObj.type = type;
    }
    if (location) {
      filterObj.location = location;
    }
    if (brand) {
      filterObj.brand = brand;
    }
    if (source) {
      filterObj.source = source;
    }
    if (noOfItemsInStockRaw) {
      try {
        const stockFilter = JSON.parse(noOfItemsInStockRaw);
        if (
          typeof stockFilter === "object" &&
          typeof stockFilter.val === "number" &&
          ["exact", "greater", "less"].includes(stockFilter.condition)
        ) {
          if (stockFilter.condition === "exact") {
            filterObj.noOfItemsInStock = stockFilter.val;
          } else if (stockFilter.condition === "greater") {
            filterObj.noOfItemsInStock = { $gt: stockFilter.val };
          } else if (stockFilter.condition === "less") {
            filterObj.noOfItemsInStock = { $lt: stockFilter.val };
          }
        }
      } catch (e) {
        // ignore invalid JSON
      }
    }
    console.log(filterObj);

    const products = await getProducts(filterObj);

    const brands = new Set<string>();
    const descriptions = new Set<string>();

    for (const product of products || []) {
      brands.add(product.brand);
      descriptions.add(product.description);
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
    const { payload } = body;

    const result = await createProduct(payload);

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
