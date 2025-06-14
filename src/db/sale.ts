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
