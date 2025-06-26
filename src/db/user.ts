// src/lib/db-users.ts (or wherever your DB functions are)
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function getAllUsers(isOnlyNames: boolean = false) {
  const userCollection = await getCollection("user");
  let projection: { [key: string]: number } = { password: 0 }; // Always exclude password

  if (isOnlyNames) {
    projection = { _id: 1, username: 1 }; // Only include _id, name, and id (if you store both)
    // Adjust these fields based on what your "basic info" truly entails.
    // If your user model has an `id` field separate from `_id`, include it.
    // Assuming `name` is the field for username/name.
  }

  return await userCollection.find({}, { projection }).toArray();
}

export async function getUsersByRole(
  role: string,
  isOnlyNames: boolean = false
) {
  const userCollection = await getCollection("user");
  let projection: { [key: string]: number } = { password: 0 }; // Always exclude password

  if (isOnlyNames) {
    projection = { _id: 1, username: 1 }; // Only include _id, name, and id (if you store both)
  }

  return await userCollection
    .find(
      { role }, // Filter by the specified role
      { projection }
    )
    .toArray();
}

// And ensure your getUserById (for individual user fetch) does NOT use isOnlyNames
// as it should always return full details if authorized.
// export async function getUserById(id: string) {
//   const userCollection = await getCollection("user");
//   return await userCollection.findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
// }

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
