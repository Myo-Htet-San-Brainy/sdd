import axios from "axios";

export async function getMyPermissions(): Promise<string[]> {
  try {
    const response = await axios.get("/api/auth/myPermissions");

    if (response.status !== 200) {
      throw new Error("Failed to fetch permissions.");
    }

    const { permissions } = response.data;
    return permissions;
  } catch (error: any) {
    console.log("error fetching permissions:", error);
    throw error;
  }
}

//write a fn that is called 'getMyPermissions'
//no fn parameters
//api response body,   { permissions: role.permissions || [] }
//thus, this fn's return type is string[]
//it will do a GET to '/api/auth/myPermissions'
//if not 200, throw error, refer above
//handle these err status codes
// 500
