import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // 💡 important for _id!
import stringSimilarity from "string-similarity-js";

export async function getProductById(id: string) {
  const productCollection = await getCollection("product");

  try {
    return await productCollection.findOne({ _id: new ObjectId(id) });
  } catch {
    return null; // If ObjectId throws or product not found
  }
}

export async function getProducts(
  filterObj: object = {},
  projectionObj: object = {
    type: 1,
    description: 1,
    brand: 1,
    noOfItemsInStock: 1,
    sellingPrice: 1,
    location: 1,
    lastUpdated: 1,
  }
) {
  const productCollection = await getCollection("product");

  return await productCollection
    .find(filterObj, { projection: projectionObj })
    .toArray();
}

const SIMILARITY = 0.45;

export async function getMatchingProductTypes(inputType: string) {
  const productCollection = await getCollection("product");

  // 1️⃣ Get all type arrays
  const pipeline = [
    {
      $match: {
        type: { $exists: true, $ne: [] },
      },
    },
    {
      $project: {
        type: 1,
      },
    },
  ];

  const result = await productCollection.aggregate(pipeline).toArray();

  // 2️⃣ Flatten all type strings
  const allTypes = result.flatMap((doc) => doc.type);

  // 3️⃣ Get unique types only
  const uniqueTypes = [...new Set(allTypes)];

  // 4️⃣ Filter by similarity
  const matchingTypes = uniqueTypes.filter((typeValue) => {
    const similarity = stringSimilarity(
      inputType.toLowerCase(),
      typeValue.toLowerCase()
    );
    return similarity >= SIMILARITY;
  });

  return matchingTypes;
}

export async function getUniqueTypeArraysOfMatchedProducts(inputType: string) {
  const productCollection = await getCollection("product");

  // 1. Pull all products with type arrays
  const pipeline = [
    {
      $match: {
        type: { $exists: true, $ne: [] },
      },
    },
    {
      $project: {
        type: 1,
      },
    },
  ];

  const result = await productCollection.aggregate(pipeline).toArray();

  // 2. Filter by similarity in JS
  const seen = new Set<string>();
  const uniqueTypeArrays: string[][] = [];

  for (const product of result) {
    const typeArr: string[] = product.type;

    const hasSimilar = typeArr.some((typeValue) => {
      const similarity = stringSimilarity(
        inputType.toLowerCase(),
        typeValue.toLowerCase()
      );
      return similarity >= SIMILARITY;
    });

    if (hasSimilar) {
      const key = JSON.stringify([...typeArr].sort());
      if (!seen.has(key)) {
        seen.add(key);
        uniqueTypeArrays.push(typeArr);
      }
    }
  }

  return uniqueTypeArrays;
}

export async function createProduct(product: any) {
  const productCollection = await getCollection("product");
  const productWithLastUpdated = { ...product, lastUpdated: new Date() };
  return await productCollection.insertOne(productWithLastUpdated);
}

// db/product.ts
export async function getAllProductsFieldValues(
  field: "brand" | "source" | "location"
) {
  const productCollection = await getCollection("product");

  const values = await productCollection
    .find({}, { projection: { [field]: 1 } })
    .toArray();

  // extract, dedupe
  const uniqueValues = Array.from(new Set(values.map((item) => item[field])));

  return uniqueValues;
}

export async function updateProductById(id: string, update: any) {
  const productCollection = await getCollection("product");
  return await productCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...update, lastUpdated: new Date() } }
  );
}
