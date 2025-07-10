import { CustomError } from "@/lib/CustomError";
import {
  createProduct,
  getMatchingProductTypes,
  getProductById,
  getProductMeta,
  getProducts,
  updateProduct,
} from "@/services/product";
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
} from "@/services/role";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "@/services/user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetProductsByType = ({ type }: { type: string }) => {
  return useQuery({
    queryFn: () => getProducts({ type }),
    queryKey: ["products", type],
    enabled: Boolean(type),
  });
};

export const useGetSimilarProducts = ({
  type,
  brand,
}: {
  type: string;
  brand: string;
}) => {
  return useQuery({
    queryFn: () => getProducts({ type, brand }),
    queryKey: ["products", type, brand],
    enabled: Boolean(type) && Boolean(brand),
    staleTime: 0,
  });
};

export const useGetSuggestions = ({
  type,
  mode = "types",
}: {
  type: string;
  mode?: "types" | "arrays";
}) => {
  return useQuery({
    queryFn: () => getMatchingProductTypes(type, mode),
    queryKey: ["suggestions", type, mode],
    enabled: Boolean(type),
  });
};

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess(data, variables) {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-meta"] });
      queryClient.invalidateQueries({ queryKey: ["low-stock products"] });
    },
  });
};

export const useGetProductMeta = (params: {
  brand?: boolean;
  location?: boolean;
  source?: boolean;
}) => {
  return useQuery({
    queryFn: () => getProductMeta(params),
    queryKey: [
      "products-meta",
      params.brand && "brand",
      params.location && "location",
      params.source && "source",
    ],
  });
};

export const useGetProductById = (id?: string) => {
  return useQuery({
    queryFn: () => getProductById(id as string),
    queryKey: ["product", id],
    enabled: Boolean(id),
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient(); // ✨ get query client

  return useMutation({
    mutationFn: updateProduct,
    onSuccess(data, variables, context) {
      const { productPayload, productId } = variables;
      productPayload.type.forEach((type: string) => {
        queryClient.invalidateQueries({ queryKey: ["products", type] });
      });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["products-meta"] });
      queryClient.invalidateQueries({ queryKey: ["low-stock products"] });
    },
    onError(error, variables, context) {
      const { productPayload, productId } = variables;
      if (error instanceof CustomError && error.status === 404) {
        productPayload.type.forEach((type: string) => {
          queryClient.invalidateQueries({ queryKey: ["products", type] });
        });
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
        queryClient.invalidateQueries({ queryKey: ["products-meta"] });
        queryClient.invalidateQueries({ queryKey: ["low-stock products"] });
      }
    },
  });
};
