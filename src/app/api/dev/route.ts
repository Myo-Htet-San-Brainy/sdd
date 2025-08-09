import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // ✅ Make sure to import this
import { deleteDuplicateProducts } from "@/lib/serverUtils";
import { Product } from "@/Interfaces/Product";

const DEV_SECRET = process.env.DEV_SECRET;

export async function DELETE(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (process.env.NODE_ENV !== "development" || secret !== DEV_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await deleteDuplicateProducts();

    return NextResponse.json(
      {
        message: `Deleted ${result.totalDeleted} duplicate products ✨`,
        details: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE_DUPLICATE_PRODUCTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to delete duplicate products" },
      { status: 500 }
    );
  }
}

const locationUpdates = [
  { old: "MSlV-2", new: "MS-IV-2" },
  { old: "MRI-2", new: "MR-I-2" },
  { old: "MSIII-10", new: "MS-III-10" },
  { old: "MSIII-8", new: "MS-III-8" },
  { old: "MSI-14", new: "MS-I-14" },
  { old: "MSIII-5", new: "MS-III-5" },
  { old: "MSI-4", new: "MS-I-4" },
  { old: "MSA-2", new: "MS-A-2" },
  { old: "MSI-12", new: "MS-I-12" },
  { old: "MRII-2", new: "MR-II-2" },
  { old: "MSVL-2", new: "MS-VI-2" },
  { old: "MSlV-3", new: "MS-IV-3" },
  { old: "MSI-10", new: "MS-I-10" },
  { old: "MSII-1", new: "MS-II-1" },
  { old: "MRI-1", new: "MR-I-1" },
  { old: "MSl-2", new: "MS-I-2" },
  { old: "MSIII-9", new: "MS-III-9" },
  { old: "MSII-9", new: "MS-II-9" },
  { old: "MSI-16", new: "MS-I-16" },
  { old: "MSB-7", new: "MS-B-7" },
  { old: "MSIV-2", new: "MS-IV-2" },
  { old: "MSIV-2 ", new: "MS-IV-2" },
  { old: "CII-1", new: "C-II-1" },
  { old: "MSI-13", new: "MS-I-13" },
  { old: "CII-3", new: "C-II-3" },
  { old: "MSB-4", new: "MS-B-4" },
  { old: "လှေကား", new: "လှေကား" },
  { old: "MRII-1", new: "MR-II-1" },
];

export async function PATCH(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (process.env.NODE_ENV !== "development" || secret !== DEV_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const productCollection = await getCollection("product");

    // Match products where brand exists and is not already uppercase
    const result = await productCollection.updateMany(
      {
        brand: { $exists: true, $type: "string" },
        $expr: { $ne: ["$brand", { $toUpper: "$brand" }] },
      },
      [
        {
          $set: {
            brand: { $toUpper: "$brand" },
          },
        },
      ]
    );

    return NextResponse.json(
      {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PATCH_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update product brands." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (process.env.NODE_ENV !== "development" || secret !== DEV_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const productCollection = await getCollection("product");
    // Find the latest entered product document (by _id descending)
    const latestProduct = await productCollection
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .toArray();
    if (!latestProduct.length) {
      return NextResponse.json(
        { message: "No products found." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { latestProduct: latestProduct[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET_LATEST_PRODUCT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch latest product." },
      { status: 500 }
    );
  }
}

type ProductWithDateNoId = Omit<Product, "_id" | "lastUpdated"> & {
  lastUpdated: Date;
};

const prods: ProductWithDateNoId[] = [
  {
    brand: "Rapid",
    sellingPrice: 12000,
    description: "CLICK2014_Black",
    noOfItemsInStock: 4,
    source: "Empire",
    location: "MS-B-3",
    buyingPrice: 10800, // 12000 * 0.9
    lowStockThreshold: 0,
    lastUpdated: new Date(),
    type: ["ဘက်မှန်"],
  },
  {
    brand: "Rapid",
    sellingPrice: 12500,
    description: "CLICK2017_Black",
    noOfItemsInStock: 5,
    source: "Empire",
    location: "MS-B-3",
    buyingPrice: 11250, // 12500 * 0.9
    lowStockThreshold: 0,
    lastUpdated: new Date(),
    type: ["ဘက်မှန်"],
  },
  {
    brand: "Rapid",
    sellingPrice: 13500,
    description: "CLICK2018i_Black",
    noOfItemsInStock: 5,
    source: "Empire",
    location: "MS-B-3",
    buyingPrice: 12150, // 13500 * 0.9
    lowStockThreshold: 0,
    lastUpdated: new Date(),
    type: ["ဘက်မှန်"],
  },
  {
    brand: "Yamaha",
    sellingPrice: 12000,
    description: "FZ_Black",
    noOfItemsInStock: 2,
    source: "Empire",
    location: "MS-B-3",
    buyingPrice: 10800,
    lowStockThreshold: 0,
    lastUpdated: new Date(),
    type: ["ဘက်မှန်"],
  },
  {
    brand: "Rapid",
    sellingPrice: 11500,
    description: "FZ16_Black",
    noOfItemsInStock: 3,
    source: "Empire",
    location: "MS-B-3",
    buyingPrice: 10350, // 11500 * 0.9
    lowStockThreshold: 0,
    lastUpdated: new Date(),
    type: ["ဘက်မှန်"],
  },
  {
    brand: "Honda",
    sellingPrice: 22000,
    description: "Scoopyi2017_Black",
    noOfItemsInStock: 2,
    source: "Empire",
    location: "MS-B-3",
    buyingPrice: 19800, // 22000 * 0.9
    lowStockThreshold: 0,
    lastUpdated: new Date(),
    type: ["ဘက်မှန်"],
  },
  {
    brand: "Rapid",
    sellingPrice: 12000,
    description: "Scoopy_Black",
    noOfItemsInStock: 1,
    source: "Empire",
    location: "MS-B-3",
    buyingPrice: 10800,
    lowStockThreshold: 0,
    lastUpdated: new Date(),
    type: ["ဘက်မှန်"],
  },
  {
    brand: "Rapid",
    sellingPrice: 12000,
    description: "Scoopy_Gold",
    noOfItemsInStock: 1,
    source: "Empire",
    location: "MS-B-3",
    buyingPrice: 10800,
    lowStockThreshold: 0,
    lastUpdated: new Date(),
    type: ["ဘက်မှန်"],
  },
  {
    brand: "Rapid",
    sellingPrice: 12000,
    description: "Scoopy_Green",
    noOfItemsInStock: 1,
    source: "Empire",
    location: "MS-B-3",
    buyingPrice: 10800,
    lowStockThreshold: 0,
    lastUpdated: new Date(),
    type: ["ဘက်မှန်"],
  },
  {
    brand: "Rapid",
    sellingPrice: 12000,
    description: "Scoopy_Orange",
    noOfItemsInStock: 1,
    source: "Empire",
    location: "MS-B-3",
    buyingPrice: 10800,
    lowStockThreshold: 0,
    lastUpdated: new Date(),
    type: ["ဘက်မှန်"],
  },
];

export async function POST(req: NextRequest) {
  try {
    const productCollection = await getCollection("product");

    if (!Array.isArray(prods) || prods.length === 0) {
      return NextResponse.json(
        { error: "No products to insert." },
        { status: 400 }
      );
    }

    const insertResult = await productCollection.insertMany(prods);

    return NextResponse.json(
      {
        message: `Inserted ${insertResult.insertedCount} products successfully ✨`,
        insertedIds: insertResult.insertedIds,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST_PRODUCT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to insert products." },
      { status: 500 }
    );
  }
}
