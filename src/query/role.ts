import { getRoles } from "@/services/role";
import { useQuery } from "@tanstack/react-query";

export const useGetRoles = () => {
  return useQuery({
    queryFn: getRoles,
    queryKey: ["roles"],
  });
};
