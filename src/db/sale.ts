import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function createSale(salePayload: any) {
  const saleCollection = await getCollection("sale");
  return await saleCollection.insertOne({
    ...salePayload,
    createdAt: new Date(), // ✅ still add it manually
  });
}

export async function getSaleProductDetails(
  soldProducts: {
    _id: string;
    buyingPrice: number;
    sellingPrice: number;
    itemsToSell: number;
  }[]
) {
  const productCollection = await getCollection("product");
  const productIds = soldProducts.map((product) => new ObjectId(product._id));
  const products = await productCollection
    .find({ _id: { $in: productIds } })
    .project({ type: 1, description: 1, brand: 1 })
    .toArray();
  const productsById = new Map(
    products.map((product) => [product._id.toString(), product])
  );

  return soldProducts.map((soldProduct) => {
    const product = productsById.get(soldProduct._id);
    if (!product) {
      throw new Error(`Product not found: ${soldProduct._id}`);
    }

    return {
      ...soldProduct,
      type: product.type,
      description: product.description,
      brand: product.brand,
    };
  });
}

export async function migrateSaleProductDetails() {
  const saleCollection = await getCollection("sale");
  const productCollection = await getCollection("product");
  const sales = await saleCollection.find({}).toArray();
  const productIds = sales.flatMap((sale) =>
    sale.soldProducts.map((soldProduct: { _id: string }) => {
      if (!ObjectId.isValid(soldProduct._id)) {
        console.warn(`Skipping invalid product id: ${soldProduct._id}`);
        return null;
      }
      return new ObjectId(soldProduct._id);
    })
  ).filter((productId): productId is ObjectId => productId !== null);
  const products = await productCollection
    .find({ _id: { $in: productIds } })
    .project({ type: 1, description: 1, brand: 1 })
    .toArray();
  const productsById = new Map(
    products.map((product) => [product._id.toString(), product])
  );
  const operations = sales.map((sale) => ({
    updateOne: {
      filter: { _id: sale._id },
      update: {
        $set: {
          soldProducts: sale.soldProducts.flatMap(
            (soldProduct: { _id: string }) => {
              if (!ObjectId.isValid(soldProduct._id)) {
                console.warn(
                  `Removing sold product with invalid id from sale ${sale._id}: ${soldProduct._id}`
                );
                return [];
              }

              const product = productsById.get(soldProduct._id);
              if (!product) {
                console.warn(
                  `Removing deleted product from sale ${sale._id}: ${soldProduct._id}`
                );
                return [];
              }

              return {
                ...soldProduct,
                type: product.type,
                description: product.description,
                brand: product.brand,
              };
            }
          ),
        },
      },
    },
  }));

  if (operations.length === 0) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  return saleCollection.bulkWrite(operations);
}

export async function deleteSale(id: string) {
  const saleCollection = await getCollection("sale");
  return await saleCollection.deleteOne({ _id: new ObjectId(id) });
}

export async function updateStockAfterTransaction(
  products: { _id: string; itemsToSell: number }[],
  options: { mode: "increase" | "decrease" }
) {
  const productCollection = await getCollection("product");

  const incValue = options.mode === "increase" ? 1 : -1;

  const bulkOps = products.map((product) => ({
    updateOne: {
      filter: { _id: new ObjectId(product._id) },
      update: {
        $inc: { noOfItemsInStock: product.itemsToSell * incValue },
        $set: { lastUpdated: new Date() },
      },
    },
  }));

  const result = await productCollection.bulkWrite(bulkOps);

  if (result.modifiedCount !== products.length) {
    console.warn(
      `Only ${result.modifiedCount} of ${products.length} products updated`
    );
  }

  return result;
}

export async function getAllSales(createdDate?: Date) {
  const saleCollection = await getCollection("sale");

  const query: any = {};

  if (createdDate) {
    const startOfDay = new Date(createdDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(createdDate);
    endOfDay.setHours(23, 59, 59, 999);

    query.createdAt = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  return await saleCollection.find(query).sort({ createdAt: -1 }).toArray();
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
