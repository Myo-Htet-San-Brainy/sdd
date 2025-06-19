import { getCollection } from "@/lib/mongodb";

export async function getLowStockItems() {
  const productCollection = await getCollection("product");

  return await productCollection
    .find({
      $expr: {
        $lte: ["$noOfItemsInStock", "$lowStockThreshold"],
      },
    })
    .toArray();
}
