import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // 💡 important for _id!

export async function getProductsByType(type: string) {
  const productCollection = await getCollection("product");

  return await productCollection
    .find(
      { type: type }, // Matches if 'type' exists in the type array of the product
      {
        projection: {
          type: 1,
          description: 1,
          brand: 1,
          noOfItemsInStock: 1,
          sellingPrice: 1,
          location: 1,
        },
      }
    )
    .toArray();
}
