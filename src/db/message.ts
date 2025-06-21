import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function getMessageById(id: string) {
  const messageCollection = await getCollection("message");
  return await messageCollection.findOne({ _id: new ObjectId(id) });
}

export async function updateMessageById(
  id: string,
  updatePayload: { message: string }
) {
  const messageCollection = await getCollection("message");
  return await messageCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatePayload }
  );
}
