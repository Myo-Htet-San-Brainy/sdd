import { ObjectId } from "mongodb";

export function groupProductsByCommonTypes(products: any[]) {
  const visited = new Set<string>();
  const groups: Array<typeof products> = [];

  for (const product of products) {
    if (visited.has(product._id.toString())) continue;

    const group: typeof products = [product];
    visited.add(product._id.toString());

    for (const other of products) {
      if (product._id.toString() === other._id.toString()) continue;
      if (visited.has(other._id.toString())) continue;

      const hasCommonType = product.type.some((t: any) =>
        other.type.includes(t)
      );

      if (hasCommonType) {
        group.push(other);
        visited.add(other._id.toString());
      }
    }

    groups.push(group);
  }

  return groups;
}

export async function syncProductTypesInGroups(
  groups: any[],
  productCollection: any
) {
  let updatedCount = 0;

  for (const group of groups) {
    const maxTypeProduct = group.reduce((longest: any, current: any) =>
      current.type.length > longest.type.length ? current : longest
    );

    const uniqueTypeSet = new Set(maxTypeProduct.type);

    for (const product of group) {
      const needsUpdate =
        product.type.length !== uniqueTypeSet.size ||
        product.type.some((t: any) => !uniqueTypeSet.has(t));

      if (needsUpdate) {
        await productCollection.updateOne(
          { _id: new ObjectId(product._id) },
          { $set: { type: Array.from(uniqueTypeSet) } }
        );
        updatedCount++;
      }
    }
  }

  return updatedCount;
}
