import { Role } from "@/Interfaces/Role";
import { CustomError } from "@/lib/CustomError";
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

export async function getRole({ id }: { id: string }): Promise<Role> {
  try {
    const response = await axios.get(`/api/role/${id}`);

    if (response.status !== 200) {
      throw new Error("Something went wrong!");
    }

    const { role } = response.data;
    return role;
  } catch (error: any) {
    console.log("error fetching roles:", error);
    if (error.response?.status === 404) {
      throw new Error("Role Not Found!");
    }
    if (error.response?.status === 500) {
      throw new Error("Internal Sever Error!");
    }
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

export async function updateRole({
  roleId,
  rolename,
  allowedPermissions,
}: {
  roleId: string;
  rolename: string;
  allowedPermissions: string[];
}): Promise<void> {
  try {
    const response = await axios.patch(`/api/role/${roleId}`, {
      name: rolename,
      permissions: allowedPermissions,
    });

    if (response.status !== 200) {
      throw new CustomError("Failed to update role.", 500);
    }
  } catch (error: any) {
    console.log("error creating role:", error);
    if (error.response?.status === 404) {
      throw new CustomError("Role Not Found!", 404);
    }
    if (error.response?.status === 500) {
      throw new CustomError("Internal Sever Error!", 500);
    }
    throw error;
  }
}
