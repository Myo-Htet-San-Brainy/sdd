"use client";

import { Sale } from "@/Interfaces/Sale";
import { useGetSales } from "@/query/sale";
import { useCartStore, useUpdatedSaleIdStore } from "@/store";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Page = () => {
  const {
    data: sales,
    isPending: isPendingSales,
    isFetching: isFetchingSales,
    isError: isErrorSales,
  } = useGetSales();

  const router = useRouter();
  const { setUpdatedSaleId } = useUpdatedSaleIdStore();
  const { setCart, setBuyer } = useCartStore();

  const handleUpdateClick = (sale: Sale) => {
    setUpdatedSaleId(sale._id);
    console.log(sale.buyer);
    setBuyer(sale.buyer ? sale.buyer._id : "");
    const cartProducts = sale.soldProducts.map((item) => {
      return {
        product: item.product,
        itemsToSell: item.itemsToSell,
      };
    });
    setCart(cartProducts);
    router.push(`/main/product`);
  };

  if (isPendingSales || isFetchingSales) {
    return <p>Loading sales...</p>;
  }

  if (isErrorSales) {
    return <p>Error while loading sales...</p>;
  }

  if (sales.length <= 0) {
    return <p>no sales...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {sales.map((sale) => (
        <div
          key={sale._id}
          className="bg-white rounded-xl shadow p-4 border border-gray-200 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="text-sm text-gray-500">
              🗓️ {format(new Date(sale.createdAt), "dd MMM yyyy, HH:mm")}
            </div>
            <div className="text-sm text-gray-600">
              👤 Buyer: {sale.buyer?.username || "N/A"}
            </div>

            {/* Scrollable products list */}
            <div className="border-t pt-2 max-h-56 overflow-y-auto pr-1 space-y-2">
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

          {/* Update Sale Button */}
          <button
            onClick={() => handleUpdateClick(sale)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Update Sale
          </button>
        </div>
      ))}
    </div>
  );
};

export default Page;
