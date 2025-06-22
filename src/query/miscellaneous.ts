import { getMyAccount, getMyPermissions } from "@/services/miscellaneous";
import { useQuery } from "@tanstack/react-query";

export const useGetMyPermissions = () => {
  return useQuery({
    queryFn: getMyPermissions,
    queryKey: ["myPermissions"],
    throwOnError: true,
  });
};

export const useGetMyAccount = () => {
  return useQuery({
    queryFn: getMyAccount,
    queryKey: ["My Account"],
  });
};
