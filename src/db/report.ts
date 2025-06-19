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
