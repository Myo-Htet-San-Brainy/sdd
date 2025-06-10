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

export async function getMatchingProductTypes(type: string) {
  const productCollection = await getCollection("product");

  const pipeline = [
    {
      $match: {
        type: { $elemMatch: { $regex: type, $options: "i" } },
      },
    },
    {
      $project: {
        matchingTypes: {
          $filter: {
            input: "$type",
            as: "t",
            cond: { $regexMatch: { input: "$$t", regex: type, options: "i" } },
          },
        },
      },
    },
    { $unwind: "$matchingTypes" },
    { $group: { _id: "$matchingTypes" } },
    { $project: { _id: 0, type: "$_id" } },
  ];

  return await productCollection.aggregate(pipeline).toArray();
}
