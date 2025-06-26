import { CustomError } from "@/lib/CustomError";
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
} from "@/services/role";
import { createSale, getAllSales, getSale, updateSale } from "@/services/sale";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "@/services/user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateSaleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSale,
    onSuccess(data, variables) {
      const {
        soldProductsTypes,
        payload: { soldProducts },
      } = variables;

      // ✅ Invalidate the main 'sales' query
      queryClient.invalidateQueries({ queryKey: ["sales"] });

      // ✅ Invalidate each product type list: ['products', type]
      soldProductsTypes.forEach((type) => {
        queryClient.invalidateQueries({ queryKey: ["products", type] });
      });

      // ✅ Invalidate individual product queries: ['product', productId]
      soldProducts.forEach(({ _id }: { _id: string }) => {
        queryClient.invalidateQueries({ queryKey: ["product", _id] });
      });

      queryClient.invalidateQueries({ queryKey: ["low-stock products"] });
      queryClient.invalidateQueries({ queryKey: ["commission reports"] });
    },
  });
};

export const useGetSales = () => {
  return useQuery({
    queryFn: getAllSales,
    queryKey: ["sales"],
  });
};

export const useGetSale = ({
  isOwn,
  saleId,
}: {
  isOwn?: string;
  saleId: string;
}) => {
  return useQuery({
    queryFn: () => getSale({ saleId, isOwn }),
    queryKey: ["sale", saleId],
  });
};

export const useUpdateSaleMutation = () => {
  const queryClient = useQueryClient(); // ✨ get query client

  return useMutation({
    mutationFn: updateSale,
    onSuccess(data, variables, context) {
      const { saleId } = variables;
      queryClient.invalidateQueries({ queryKey: ["sales"] });

      queryClient.invalidateQueries({ queryKey: ["sale", saleId] });
      queryClient.invalidateQueries({ queryKey: ["low-stock products"] });
      queryClient.invalidateQueries({ queryKey: ["commission reports"] });
    },
  });
};
