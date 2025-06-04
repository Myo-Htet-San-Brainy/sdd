import { Role } from "@/Interfaces/Role";
import axios from "axios";

//get roles fn
// no parameters

//return Role[]
//check if 200

export async function getRoles(): Promise<Role[]> {
  try {
    const response = await axios.get("/api/role");

    if (response.status !== 200) {
      throw new Error("Failed to fetch roles.");
    }

    const { roles } = response.data;
    return roles;
  } catch (error: any) {
    console.log("error fetching roles:", error);
    throw error;
  }
}
