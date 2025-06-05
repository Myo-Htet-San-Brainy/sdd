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

export async function createRole({
  rolename,
  allowedPermissions,
}: {
  rolename: string;
  allowedPermissions: string[];
}): Promise<void> {
  try {
    const response = await axios.post("/api/role", {
      rolename,
      allowedPermissions,
    });

    if (response.status !== 201) {
      throw new Error("Failed to create role.");
    }
  } catch (error: any) {
    console.log("error creating role:", error);
    throw error;
  }
}
