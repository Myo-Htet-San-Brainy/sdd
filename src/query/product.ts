import { CustomError } from "@/lib/CustomError";
import { getProductsByType } from "@/services/product";
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
