import { Product } from "@/Interfaces/Product";
import { CustomError } from "@/lib/CustomError";
import axios, { isAxiosError } from "axios";

export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await axios.get(`/api/product/${id}`);

    if (response.status !== 200) {
      throw new Error("Error fetching product!");
    }

    const { product } = response.data;
    return product;
  } catch (error: any) {
    console.log("error fetching product:", error);
    if (isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new CustomError("Product not found!", 404);
      }
    }
    throw new CustomError("Internal Sever Error!", 500);
  }
}

export async function getProducts(filterObj: Object): Promise<{
  products: Product[];
  distinctBrands: string[];
  distinctDescriptions: string[];
}> {
  try {
    const response = await axios.get(`/api/product`, {
      params: filterObj,
    });

    if (response.status !== 200) {
      throw new Error("Error fetching products!");
    }

    const { products, distinctBrands, distinctDescriptions } = response.data;
    return { products, distinctBrands, distinctDescriptions };
  } catch (error: any) {
    console.log("error fetching products:", error);
    throw new CustomError("Internal Sever Error!", 500);
  }
}

export async function getMatchingProductTypes(
  type: string,
  mode: "types" | "arrays"
): Promise<string[] | string[][]> {
  try {
    const response = await axios.get(
      `/api/product/suggestions?type=${type}&mode=${mode}`
    );

    if (response.status !== 200) {
      throw new Error("Error fetching suggestions!");
    }

    const { types } = response.data;
    return types;
  } catch (error: any) {
    console.log("error fetching suggestions:", error);
    throw new CustomError("Internal Sever Error!", 500);
  }
}

export async function createProduct({
  payload,
  isForSureNewProd,
}: {
  payload: any;
  isForSureNewProd?: boolean;
}): Promise<void> {
  try {
    const response = await axios.post(`/api/product`, {
      payload,
      isForSureNewProd,
    });

    if (response.status !== 201) {
      throw new Error("Error creating product!");
    }
  } catch (error: any) {
    console.log("error creating product:", error);
    if (isAxiosError(error) && error.status === 409) {
      throw new CustomError(
        error.response?.data.error,
        error.status,
        error.response?.data
      );
    }
    throw new CustomError("Internal Sever Error!", 500);
  }
}

export async function getProductMeta(params: {
  brand?: boolean;
  location?: boolean;
  source?: boolean;
}): Promise<{
  brands: string[] | null;
  locations: string[][] | null;
  sources: string[] | null;
}> {
  try {
    const response = await axios.get(`/api/product/meta`, {
      params,
    });

    if (response.status !== 200) {
      throw new Error("Error product meta!");
    }
    return response.data;
  } catch (error: any) {
    console.log("error getting product meta:", error);
    throw new CustomError("Internal Sever Error!", 500);
  }
}

export async function updateProduct({
  productId,
  productPayload,
}: {
  productId: string;
  productPayload: any;
}): Promise<void> {
  try {
    const response = await axios.patch(
      `/api/product/${productId}`,
      productPayload
    );

    if (response.status !== 200) {
      throw new Error("Failed to update product!");
    }
  } catch (error: any) {
    console.log("error updating product:", error);
    if (isAxiosError(error) && error.response?.status === 404) {
      throw new CustomError("Product Not Found!", 404);
    }
    throw new CustomError("Internal Sever Error!", 500);
  }
}
