import { User } from "@/Interfaces/User";
import { CustomError } from "@/lib/CustomError";
import axios from "axios";

//get roles fn
// no parameters

//return Role[]
//check if 200

export async function getUsers(): Promise<User[]> {
  try {
    const response = await axios.get("/api/user");

    if (response.status !== 200) {
      throw new CustomError("Failed to fetch users.", 500);
    }

    const { users } = response.data;
    return users;
  } catch (error: any) {
    console.log("error fetching users:", error);
    if (error.response?.status === 403) {
      throw new CustomError("Internal Sever Error!", 500);
    }
    if (error.response?.status === 500) {
      throw new CustomError("Internal Sever Error!", 500);
    }
    throw error;
  }
}

export async function createUser(user: any): Promise<void> {
  try {
    const response = await axios.post("/api/user", user);

    if (response.status !== 201) {
      throw new CustomError("Failed to create user.", 500);
    }
  } catch (error: any) {
    console.log("error creating user:", error);
    if (error.response?.status === 403) {
      throw new CustomError("Internal Sever Error!", 500);
    }
    if (error.response?.status === 500) {
      throw new CustomError("Internal Sever Error!", 500);
    }
    throw error;
  }
}

//
export async function updateUser({
  userId,
  userPayload,
}: {
  userId: string;
  userPayload: any;
}): Promise<void> {
  try {
    const response = await axios.patch(`/api/user/${userId}`, userPayload);

    if (response.status !== 200) {
      throw new Error("Failed to update user!");
    }
  } catch (error: any) {
    console.log("error creating user:", error);
    if (error.response?.status === 404) {
      throw new CustomError("User Not Found!", 404);
    } else {
      throw new CustomError("Internal Sever Error!", 500);
    }
  }
}

export async function getUser({ id }: { id: string }): Promise<User> {
  try {
    const response = await axios.get(`/api/user/${id}`);

    if (response.status !== 200) {
      throw new Error("Something went wrong!");
    }

    const { user } = response.data;
    return user;
  } catch (error: any) {
    console.log("error getting user:", error);
    if (error.response?.status === 404) {
      throw new CustomError("This user has been removed already!", 404);
    } else {
      throw new CustomError("Something went wrong!", 500);
    }
  }
}

export async function deleteUser({
  userId,
}: {
  userId: string;
}): Promise<void> {
  try {
    const response = await axios.delete(`/api/user/${userId}`);

    if (response.status !== 200) {
      throw new Error("Something went wrong!");
    }
  } catch (error: any) {
    console.log("error deleting user:", error);
    if (error.response?.status === 404) {
      throw new CustomError("This user has been removed already!", 404);
    } else {
      throw new CustomError("Something went wrong!", 500);
    }
  }
}
