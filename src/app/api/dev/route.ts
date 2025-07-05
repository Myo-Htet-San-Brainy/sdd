import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // ✅ Make sure to import this

const DEV_SECRET = process.env.DEV_SECRET;

export async function DELETE(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (process.env.NODE_ENV !== "development" || secret !== DEV_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userCol = await getCollection("user");
    const productCollection = await getCollection("product");
    const saleCollection = await getCollection("sale");
    const roleCollection = await getCollection("role");

    await userCol.deleteMany({
      _id: { $ne: new ObjectId("683c2298de25e07b9ade7a14") },
    });
    await productCollection.deleteMany({});
    await saleCollection.deleteMany({});
    await roleCollection.deleteMany({});

    return NextResponse.json({ message: "All data wiped ✨" }, { status: 200 });
  } catch (error) {
    console.error("[CLEAR_DB_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to clear collections" },
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

    // 1️⃣ Find products where ANY type array item has '+'
    const productsWithPlus = await productCollection
      .find({ type: { $elemMatch: { $regex: /\+/ } } })
      .toArray();

    if (!productsWithPlus.length) {
      return NextResponse.json({
        message: "No products with '+' in type array found.",
      });
    }

    // 2️⃣ Loop & replace '+' in EACH type array item
    const bulkOps = productsWithPlus.map((prod) => {
      const updatedTypeArray = prod.type.map((t: string) =>
        typeof t === "string" ? t.replace(/\+/g, "N") : t
      );

      return {
        updateOne: {
          filter: { _id: prod._id },
          update: { $set: { type: updatedTypeArray } },
        },
      };
    });

    // 3️⃣ Bulk update
    const result = await productCollection.bulkWrite(bulkOps);

    return NextResponse.json(
      {
        message: `Updated ${result.modifiedCount} products' type arrays successfully ✨`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[MANUAL_ARRAY_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update products with array types." },
      { status: 500 }
    );
  }
}
