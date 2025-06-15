import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // 💡 important for _id!

export async function getProductById(id: string) {
  const productCollection = await getCollection("product");

  try {
    return await productCollection.findOne({ _id: new ObjectId(id) });
  } catch {
    return null; // If ObjectId throws or product not found
  }
}

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
  ];

  const result = await productCollection.aggregate(pipeline).toArray();
  return result.map((item) => item._id);
}

export async function createProduct(product: any) {
  const productCollection = await getCollection("product");
  return await productCollection.insertOne(product);
}

// db/product.ts
export async function getAllProductsFieldValues(
  field: "brand" | "source" | "location"
) {
  const productCollection = await getCollection("product");

  const values = await productCollection
    .find({}, { projection: { [field]: 1 } })
    .toArray();

  // extract, filter falsy, dedupe
  const uniqueValues = Array.from(
    new Set(values.map((item) => item[field]).filter(Boolean))
  );

  return uniqueValues;
}
