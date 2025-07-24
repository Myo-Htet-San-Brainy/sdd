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
    const buyingPriceRaw = searchParams.get("buyingPrice");
    const sellingPriceRaw = searchParams.get("sellingPrice");
    // Pagination params
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

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
    if (buyingPriceRaw) {
      try {
        const buyingPriceFilter = JSON.parse(buyingPriceRaw);
        if (
          typeof buyingPriceFilter === "object" &&
          typeof buyingPriceFilter.val === "number" &&
          ["exact", "greater", "less"].includes(buyingPriceFilter.condition)
        ) {
          if (buyingPriceFilter.condition === "exact") {
            filterObj.buyingPrice = buyingPriceFilter.val;
          } else if (buyingPriceFilter.condition === "greater") {
            filterObj.buyingPrice = { $gt: buyingPriceFilter.val };
          } else if (buyingPriceFilter.condition === "less") {
            filterObj.buyingPrice = { $lt: buyingPriceFilter.val };
          }
        }
      } catch (e) {
        // ignore invalid JSON
      }
    }
    if (sellingPriceRaw) {
      try {
        const sellingPriceFilter = JSON.parse(sellingPriceRaw);
        if (
          typeof sellingPriceFilter === "object" &&
          typeof sellingPriceFilter.val === "number" &&
          ["exact", "greater", "less"].includes(sellingPriceFilter.condition)
        ) {
          if (sellingPriceFilter.condition === "exact") {
            filterObj.sellingPrice = sellingPriceFilter.val;
          } else if (sellingPriceFilter.condition === "greater") {
            filterObj.sellingPrice = { $gt: sellingPriceFilter.val };
          } else if (sellingPriceFilter.condition === "less") {
            filterObj.sellingPrice = { $lt: sellingPriceFilter.val };
          }
        }
      } catch (e) {
        // ignore invalid JSON
      }
    }
    console.log(filterObj);

    // Pagination logic
    // getProducts should be updated to accept skip and limit, but for now, let's assume it returns all and we slice here
    const allProducts = await getProducts(filterObj);
    const total = allProducts.length;
    const products = allProducts.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    const brands = new Set<string>();
    const descriptions = new Set<string>();

    for (const product of allProducts || []) {
      brands.add(product.brand);
      descriptions.add(product.description);
    }

    return NextResponse.json(
      {
        products: products || [],
        total,
        page,
        limit,
        totalPages,
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
