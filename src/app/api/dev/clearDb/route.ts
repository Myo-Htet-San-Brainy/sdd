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
    const userCol = await getCollection("User");

    await userCol.deleteMany({
      _id: { $ne: new ObjectId("683c2298de25e07b9ade7a14") },
    });

    return NextResponse.json({ message: "All data wiped ✨" }, { status: 200 });
  } catch (error) {
    console.error("[CLEAR_DB_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to clear collections" },
      { status: 500 }
    );
  }
}
