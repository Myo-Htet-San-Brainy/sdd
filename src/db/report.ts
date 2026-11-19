import { getCollection } from "@/lib/mongodb";
import { UnitsSoldReport } from "@/Interfaces/Report";

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

export async function getSalesByBuyerAndMonth(
  buyerId: string,
  date: string // ISO string or 'all'
) {
  const saleCollection = await getCollection("sale");

  const match: any = {
    buyer: buyerId,
  };

  if (date !== "all") {
    const inputDate = new Date(date);
    const startOfMonth = new Date(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      inputDate.getFullYear(),
      inputDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    match.createdAt = {
      $gte: startOfMonth,
      $lte: endOfMonth,
    };
  }

  return await saleCollection.find(match).toArray();
}

export async function getUnitsSoldReport({
  from,
  to,
  sort,
}: {
  from: Date;
  to: Date;
  sort: "most" | "least";
}): Promise<UnitsSoldReport[]> {
  const saleCollection = await getCollection("sale");

  return await saleCollection
    .aggregate<UnitsSoldReport>([
      {
        $match: {
          createdAt: {
            $gte: from,
            $lt: to,
          },
        },
      },
      { $unwind: "$soldProducts" },
      {
        $group: {
          _id: "$soldProducts._id",
          type: { $first: "$soldProducts.type" },
          description: { $first: "$soldProducts.description" },
          brand: { $first: "$soldProducts.brand" },
          unitsSold: { $sum: "$soldProducts.itemsToSell" },
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          type: 1,
          description: 1,
          brand: 1,
          unitsSold: 1,
        },
      },
      { $sort: { unitsSold: sort === "most" ? -1 : 1, _id: 1 } },
    ])
    .toArray();
}
