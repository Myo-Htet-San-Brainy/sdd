"use client";

import { useGetSales } from "@/query/sale";
import { format } from "date-fns";

const Page = () => {
  const {
    data: sales,
    isPending: isPendingSales,
    isFetching: isFetchingSales,
    isError: isErrorSales,
    error: errorSales,
  } = useGetSales();

  if (isPendingSales || isFetchingSales) {
    return <p>Loading sales...</p>;
  }

  if (isErrorSales) {
    return <p>Error while loading sales...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {sales.map((sale) => (
        <div
          key={sale._id}
          className="bg-white rounded-xl shadow p-4 space-y-2 border border-gray-200"
        >
          <div className="text-sm text-gray-500">
            🗓️ {format(new Date(sale.createdAt), "dd MMM yyyy, HH:mm")}
          </div>
          <div className="text-sm text-gray-600">
            👤 Buyer: {sale.buyer || "N/A"}
          </div>

          <div className="border-t pt-2 space-y-2">
            {sale.soldProducts.map((sp, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-2 rounded-md border text-sm space-y-1"
              >
                <div className="font-semibold text-blue-600">
                  {sp.product.type.join(", ")}
                </div>
                <div className="text-gray-700">{sp.product.description}</div>
                <div className="text-gray-600">Brand: {sp.product.brand}</div>
                <div className="text-gray-500">
                  Sold: {sp.itemsToSell} × {sp.sellingPrice} MMK
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Page;
