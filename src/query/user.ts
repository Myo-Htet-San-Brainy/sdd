import { CustomError } from "@/lib/CustomError";
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

export const useGetUsers = () => {
  return useQuery({
    queryFn: getUsers,
    queryKey: ["users"],
  });
};

export const useGetUser = ({ id }: { id: string }) => {
  return useQuery({
    queryFn: () => getUser({ id }),
    queryKey: ["user", id],
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

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient(); // ✨ get query client

  return useMutation({
    mutationFn: updateUser,
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
    },
    onError(error, variables, context) {
      if (error instanceof CustomError && error.status === 404) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient(); // ✨ get query client

  return useMutation({
    mutationFn: deleteUser,
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError(error, variables, context) {
      if (error instanceof CustomError && error.status === 404) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
  });
};
