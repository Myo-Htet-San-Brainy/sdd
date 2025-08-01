import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
} from "@/services/role";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetRoles = () => {
  return useQuery({
    queryFn: getRoles,
    queryKey: ["roles"],
  });
};

export const useGetRole = ({ id }: { id: string }) => {
  return useQuery({
    queryFn: () => getRole({ id }),
    queryKey: ["role", id],
  });
};

export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient(); // ✨ get query client

  return useMutation({
    mutationFn: createRole,
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient(); // ✨ get query client

  return useMutation({
    mutationFn: updateRole,
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", variables.roleId] });
      queryClient.invalidateQueries({ queryKey: ["myPermissions"] });
    },
  });
};

export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient(); // ✨ get query client

  return useMutation({
    mutationFn: deleteRole,
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};
