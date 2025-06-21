"use client";

import AllowedPermissions from "@/components/AllowedPermissions";
import { Sale } from "@/Interfaces/Sale";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetSales } from "@/query/sale";
import { useCartStore, useUpdatedSaleIdStore } from "@/store";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const Page = () => {
  const {
    data: myPermissions,
    isFetching: isFetchingMyPermissions,
    isPending: isPendingMyPermissions,
  } = useGetMyPermissions();
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
    setBuyer(sale.buyer ? sale.buyer._id : "");
    const cartProducts = sale.soldProducts.map((item) => ({
      product: item.product,
      itemsToSell: item.itemsToSell,
    }));
    setCart(cartProducts);
    router.push(`/main/product`);
  };

  if (isFetchingMyPermissions || isPendingMyPermissions) {
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

  if (isPendingSales || isFetchingSales) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-600 animate-pulse text-center">
          Loading sales...
        </p>
      </div>
    );
  }

  if (isErrorSales) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-red-600 text-center font-medium">
          Error while loading sales...
        </p>
      </div>
    );
  }

  if (sales.length <= 0) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-500 text-center">No sales recorded yet.</p>
      </div>
    );
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sales.map((sale) => (
          <div
            key={sale._id}
            className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="text-sm text-zinc-500">
                🗓️ {format(new Date(sale.createdAt), "dd MMM yyyy, HH:mm")}
              </div>
              <div className="text-sm text-zinc-600">
                👤 Buyer: {sale.buyer?.username || "N/A"}
              </div>

              <div className="border-t pt-2 max-h-56 overflow-y-auto pr-1 space-y-2">
                {sale.soldProducts.map((sp, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-50 p-2 rounded-md border border-zinc-200 text-sm space-y-1"
                  >
                    <div className="font-semibold text-red-600">
                      {sp.product.type.join(", ")}
                    </div>
                    <div className="text-zinc-700">
                      {sp.product.description}
                    </div>
                    <div className="text-zinc-600">
                      Brand: {sp.product.brand}
                    </div>
                    <div className="text-zinc-500">
                      Sold: {sp.itemsToSell} × {sp.sellingPrice} MMK
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {hasPermission(
              myPermissions!,
              MODULES_AND_PERMISSIONS.SALE.PERMISSION_UPDATE.name
            ) && (
              <button
                onClick={() => handleUpdateClick(sale)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                Update Sale
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Page;
