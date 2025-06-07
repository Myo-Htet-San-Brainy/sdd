import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // 💡 important for _id!

export async function getAllUsers() {
  const userCollection = await getCollection("user");
  return await userCollection
    .find({}, { projection: { password: 0 } }) // 🚫 exclude 'password'
    .toArray();
}

export async function createUser(user: any) {
  const userCollection = await getCollection("user");
  return await userCollection.insertOne(user);
}
