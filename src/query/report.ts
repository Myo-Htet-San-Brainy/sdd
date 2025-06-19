import { CustomError } from "@/lib/CustomError";
import { getLowStockProducts } from "@/services/report";
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
} from "@/services/role";
import { createSale, getAllSales, updateSale } from "@/services/sale";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "@/services/user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetLowStockProducts = () => {
  return useQuery({
    queryFn: getLowStockProducts,
    queryKey: ["low-stock products"],
  });
};
