import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
} from "@/services/role";
import { createUser, getUsers } from "@/services/user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetUsers = () => {
  return useQuery({
    queryFn: getUsers,
    queryKey: ["users"],
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient(); // ✨ get query client

  return useMutation({
    mutationFn: createUser,
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
