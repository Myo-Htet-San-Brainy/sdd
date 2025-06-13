import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // 💡 important for _id!

export async function getAllUsers() {
  const userCollection = await getCollection("user");
  return await userCollection
    .find({}, { projection: { password: 0 } }) // 🚫 exclude 'password'
    .toArray();
}

export async function getUsersByRole(role: string) {
  const userCollection = await getCollection("user");
  return await userCollection
    .find(
      { role }, // Filter by the specified role
      { projection: { password: 0 } } // 🚫 exclude 'password'
    )
    .toArray();
}

export async function createUser(user: any) {
  const userCollection = await getCollection("user");
  return await userCollection.insertOne(user);
}

export async function getUserById(userId: string) {
  const userCollection = await getCollection("user");
  return await userCollection.findOne({ _id: new ObjectId(userId) });
}

export async function updateUser(userId: string, userPayload: any) {
  const userCollection = await getCollection("user");
  return await userCollection.updateOne(
    { _id: new ObjectId(userId) }, // Filter by ID
    { $set: userPayload } // Update fields
  );
}

export async function deleteUserById(userId: string) {
  const userCollection = await getCollection("user");
  return await userCollection.deleteOne({ _id: new ObjectId(userId) });
}
