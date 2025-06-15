import { CustomError } from "@/lib/CustomError";
import {
  createProduct,
  getMatchingProductTypes,
  getProductById,
  getProductMeta,
  getProductsByType,
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
    queryFn: () => getProductsByType(type),
    queryKey: ["products", type],
    enabled: Boolean(type),
  });
};

export const useGetSuggestions = ({ type }: { type: string }) => {
  return useQuery({
    queryFn: () => getMatchingProductTypes(type),
    queryKey: ["suggestions", type],
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
