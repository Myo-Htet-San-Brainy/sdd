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
    const type = searchParams.get("type");
    const location = searchParams.get("location");

    const filterObj: any = {};
    if (type) {
      filterObj.type = type;
    }
    if (location) {
      filterObj.location = location;
    }
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

    const searchParams = req.nextUrl.searchParams;
    const isForSureNewProd = searchParams.get("isForSureNewProd") === "true";

    const body = await req.json();

    if (!isForSureNewProd) {
      const { brand, type, description } = body;

      const existing = await getProducts({
        brand,
        type: { $in: type },
      });

      const duplicate = existing.find((prod) => {
        const similarity = stringSimilarity(
          prod.description || "",
          description || ""
        );
        return similarity >= 0.9;
      });

      if (duplicate) {
        return NextResponse.json(
          {
            error: "Similar product already exists.",
            _id: duplicate._id,
            similarity: "90%+",
          },
          { status: 409 }
        );
      }
    }

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
