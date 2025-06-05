import { createRole, getRole, getRoles } from "@/services/role";
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
