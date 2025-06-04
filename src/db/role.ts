import { getCollection } from "@/lib/mongodb";

export async function getRoleByName(roleName: string) {
  const roleCollection = await getCollection("role");
  return await roleCollection.findOne({ name: roleName });
}

export async function getAllRoles() {
  const roleCollection = await getCollection("role");
  return await roleCollection.find({}).toArray();
}
