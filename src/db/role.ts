import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // 💡 important for _id!

export async function getRoleByName(roleName: string) {
  const roleCollection = await getCollection("role");
  return await roleCollection.findOne({ name: roleName });
}

export async function getRoleById(roleId: string) {
  const roleCollection = await getCollection("role");
  return await roleCollection.findOne({ _id: new ObjectId(roleId) });
}

export async function getAllRoles() {
  const roleCollection = await getCollection("role");
  return await roleCollection.find({}).toArray();
}

export async function createRole(role: {
  name: string;
  permissions: string[];
}) {
  const roleCollection = await getCollection("role");
  return await roleCollection.insertOne(role);
}
