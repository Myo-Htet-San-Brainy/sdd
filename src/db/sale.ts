import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function createSale(salePayload: any) {
  const saleCollection = await getCollection("sale");
  return await saleCollection.insertOne({
    ...salePayload,
    createdAt: new Date(), // ✅ still add it manually
  });
}

export async function updateStockAfterSale(soldProducts: any[]) {
  const productCollection = await getCollection("product");

  const updates = soldProducts.map((product) =>
    productCollection.updateOne(
      { _id: new ObjectId(product._id) },
      { $inc: { noOfItemsInStock: -product.itemsToSell } }
    )
  );

  return await Promise.all(updates);
}

export async function getAllSales() {
  const saleCollection = await getCollection("sale");
  return await saleCollection
    .find()
    .sort({ createdAt: -1 }) // ← newest first
    .toArray();
}

export async function updateSale(id: string, salePayload: any) {
  const saleCollection = await getCollection("sale");
  return await saleCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: salePayload }
  );
}

export async function getSaleByFilter(filter: Record<string, any>) {
  const saleCollection = await getCollection("sale");

  // Convert _id to ObjectId if present
  if (filter._id) {
    filter._id = new ObjectId(filter._id);
  }

  return await saleCollection.findOne(filter);
}
