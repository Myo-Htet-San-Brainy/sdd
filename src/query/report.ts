import { CustomError } from "@/lib/CustomError";
import {
  getCommissionReports,
  getLowStockProducts,
  getUnitsSoldReport,
} from "@/services/report";
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

export const useGetCommissionReports = (params: {
  commissionerId: string;
  date: string;
}) => {
  return useQuery({
    queryFn: () => getCommissionReports(params),
    queryKey: ["commission reports", params.commissionerId, params.date],
    enabled: Boolean(params.commissionerId),
  });
};

export const useGetUnitsSoldReport = (params: {
  from: string;
  to: string;
  sort: "most" | "least";
}) => {
  return useQuery({
    queryFn: () => getUnitsSoldReport(params),
    queryKey: ["units sold report", params.from, params.to, params.sort],
  });
};
