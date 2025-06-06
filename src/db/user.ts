import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // 💡 important for _id!

export async function getAllUsers() {
  const roleCollection = await getCollection("user");
  return await roleCollection.find({}).toArray();
}
