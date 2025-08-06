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

    const allProducts = await productCollection.find({}).toArray();

    // 🧠 Group products by common type terms
    const visited = new Set<string>();
    const groups: Array<typeof allProducts> = [];

    for (const product of allProducts) {
      if (visited.has(product._id.toString())) continue;

      const group: typeof allProducts = [product];
      visited.add(product._id.toString());

      for (const other of allProducts) {
        if (product._id.toString() === other._id.toString()) continue;
        if (visited.has(other._id.toString())) continue;

        const hasCommonType = product.type.some((t: any) =>
          other.type.includes(t)
        );
        if (hasCommonType) {
          group.push(other);
          visited.add(other._id.toString());
        }
      }

      groups.push(group);
    }

    let updatedCount = 0;

    // ✨ Replace type arrays in each group with the most comprehensive one
    for (const group of groups) {
      const maxTypeProduct = group.reduce((longest, current) =>
        current.type.length > longest.type.length ? current : longest
      );

      const uniqueTypeSet = new Set(maxTypeProduct.type);

      for (const product of group) {
        const needsUpdate =
          product.type.length !== uniqueTypeSet.size ||
          product.type.some((t: any) => !uniqueTypeSet.has(t));

        if (needsUpdate) {
          await productCollection.updateOne(
            { _id: new ObjectId(product._id) },
            { $set: { type: Array.from(uniqueTypeSet) } }
          );
          updatedCount++;
        }
      }
    }

    return NextResponse.json(
      { updatedCount, groupCount: groups.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PATCH_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update product types." },
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

const prods: Omit<Product, "_id">[] = [
  {
    brand: "SMOW",
    noOfItemsInStock: 10,
    sellingPrice: 7800,
    description: "အလယ်‌ဒစ်",
    source: "Empire",
    type: ["ကွန်ထရိုလာဂွ", "controllerဂွ"],
    location: "MS-I-7",
    buyingPrice: 7020, // 7800 * 0.9
    lowStockThreshold: 0,
    lastUpdated: new Date(),
  },
  {
    brand: "OUOK",
    noOfItemsInStock: 8,
    sellingPrice: 7800,
    description: "အလယ်ဒစ်",
    source: "Empire",
    type: ["ကွန်ထရိုလာဂွ", "controllerဂွ"],
    location: "MS-I-7",
    buyingPrice: 7020,
    lowStockThreshold: 0,
    lastUpdated: new Date(),
  },
  {
    brand: "PRT",
    noOfItemsInStock: 3,
    sellingPrice: 7800,
    description: "အလယ်ဒစ်",
    source: "Empire",
    type: ["ကွန်ထရိုလာဂွ", "controllerဂွ"],
    location: "MS-I-7",
    buyingPrice: 7020,
    lowStockThreshold: 0,
    lastUpdated: new Date(),
  },
  {
    brand: "JRC",
    noOfItemsInStock: 1,
    sellingPrice: 7800,
    description: "အလယ်ဒစ်",
    source: "Empire",
    type: ["ကွန်ထရိုလာဂွ", "controllerဂွ"],
    location: "MS-I-7",
    buyingPrice: 7020,
    lowStockThreshold: 0,
    lastUpdated: new Date(),
  },
  {
    brand: "SABR",
    noOfItemsInStock: 1,
    sellingPrice: 7800,
    description: "အလယ်ဒစ်",
    source: "Empire",
    type: ["ကွန်ထရိုလာဂွ", "controllerဂွ"],
    location: "MS-I-7",
    buyingPrice: 7020,
    lowStockThreshold: 0,
    lastUpdated: new Date(),
  },
];

export async function POST(req: NextRequest) {
  try {
    console.log("1");
    const productCollection = await getCollection("product");
    console.log("2");

    if (!Array.isArray(prods) || prods.length === 0) {
      return NextResponse.json(
        { error: "No products to insert." },
        { status: 400 }
      );
    }

    console.log("before insertion");
    const insertResult = await productCollection.insertMany(prods);
    console.log("after insertion");

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
