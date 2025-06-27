"use client";

import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetSale } from "@/query/sale";
import { useParams } from "next/navigation";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import { CustomError } from "@/lib/CustomError";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { format } from "date-fns";

const Page = () => {
  const { data: myPermissions, isFetching: isFetchingPermissions } =
    useGetMyPermissions();
  const { id }: { id?: string } = useParams();

  const {
    data: sale,
    isPending: isPendingSale,
    isFetching: isFetchingSale,
    isError: isErrorSale,
    error: errorSale,
  } = useGetSale({ saleId: id });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (errorSale instanceof CustomError && errorSale.status === 404) {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    }
  }, [isErrorSale]);

  if (isFetchingPermissions) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-600 animate-pulse text-center">
          Checking permissions...
        </p>
      </div>
    );
  }

  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.SALE.PERMISSION_READ.name
    )
  ) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-red-600 text-center text-lg font-medium">
          You are not permitted to view{" "}
          {MODULES_AND_PERMISSIONS.SALE.PERMISSION_READ.displayName}.
        </p>
      </div>
    );
  }

  if (isPendingSale || isFetchingSale) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-600 animate-pulse text-center">
          Loading sale details...
        </p>
      </div>
    );
  }

  if (isErrorSale) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-center text-red-600 text-lg font-medium">
          {errorSale instanceof CustomError && errorSale.status === 404
            ? "Sale Not Found!"
            : "Something went wrong while loading the sale!"}
        </p>
      </div>
    );
  }

  const totalPrice = sale.soldProducts.reduce(
    (sum, sp) => sum + sp.itemsToSell * sp.sellingPrice,
    0
  );

  return (
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-10">
      <div className="max-w-2xl mx-auto p-6 rounded-2xl shadow-md border border-zinc-200 bg-white space-y-6">
        <h2 className="text-2xl font-bold text-red-600 border-b pb-2">
          Sale Details
        </h2>

        <div className="space-y-2 text-sm text-zinc-600">
          <Detail
            label="🗓️ Date"
            value={format(new Date(sale.createdAt), "dd MMM yyyy, HH:mm")}
          />
          <Detail label="👤 Buyer" value={sale.buyer?.username || "N/A"} />
          <Detail
            label="💰 Total"
            value={`${totalPrice.toLocaleString()} MMK`}
          />
        </div>

        <div className="border-t pt-4 max-h-64 overflow-y-auto pr-1 space-y-2">
          {sale.soldProducts.map((sp, idx) => (
            <div
              key={idx}
              className="bg-zinc-50 p-2 rounded-md border border-zinc-200 text-sm flex justify-between items-center"
            >
              <div className="space-y-1">
                <div className="font-semibold text-red-600">
                  {sp.product.type.join(", ")}
                </div>
                <div className="text-zinc-500 text-xs">{sp.product.brand}</div>
                <div className="text-zinc-700 text-xs">
                  {sp.product.description}
                </div>
              </div>
              <div className="text-red-600 font-medium ml-2 text-sm text-right">
                {sp.itemsToSell} × {sp.sellingPrice.toLocaleString()} MMK
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Detail = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex justify-between text-zinc-700">
    <span className="font-medium">{label}:</span>
    <span className="text-right">{value}</span>
  </div>
);

export default Page;
