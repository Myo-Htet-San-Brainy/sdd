"use client";

import Link from "next/link";
import { useGetLowStockProducts } from "@/query/report";
import { Product } from "@/Interfaces/Product";
import { hasPermission } from "@/lib/utils";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import AllowedPermissions from "@/components/AllowedPermissions";
import { useMyPermissionsContext } from "@/context";

const Page = () => {
  const { myPermissions, isFetchingMyPermissions } = useMyPermissionsContext();
  const {
    data: lowStockProducts,
    isPending,
    isFetching,
    isError,
  } = useGetLowStockProducts();

  if (isFetchingMyPermissions) {
    return (
      <div className="w-full min-h-[calc(100vh-72px)] py-6 text-center bg-zinc-50">
        <p className="text-zinc-800 animate-pulse">Checking permissions...</p>
      </div>
    );
  }

  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.REPORT.PERMISSION_LOW_STOCK_ALERT.name
    )
  ) {
    return (
      <p className="mt-6 text-center text-red-700">
        You are not permitted to view{" "}
        {MODULES_AND_PERMISSIONS.REPORT.PERMISSION_LOW_STOCK_ALERT.displayName}.
      </p>
    );
  }

  if (isFetching || isPending) {
    return (
      <div className="text-center text-zinc-600 animate-pulse py-8 bg-zinc-50">
        Loading low stock data...
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-red-700 mt-6">
        Something went wrong while fetching low stock products 😢
      </p>
    );
  }

  if (lowStockProducts.length === 0) {
    return (
      <p className="text-center text-green-600 mt-6">
        All products have sufficient stock 🎉
      </p>
    );
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-8">
      <h1 className="text-2xl font-bold text-red-700 mb-6">
        Low Stock Alerts 🚨
      </h1>
      <ul className="space-y-4">
        {lowStockProducts.map((product: Product) => (
          <li key={product._id}>
            <Link
              href={`/main/product/${product._id}`}
              className="block border border-red-200 bg-red-50 rounded-xl p-4 shadow-sm hover:bg-red-100 transition-colors"
            >
              <div className="font-semibold text-zinc-800 text-lg">
                {product.brand}
                {product.description && ` - ${product.description}`}
              </div>
              <div className="text-sm text-zinc-700 mt-1">
                In Stock:{" "}
                <span className="font-bold text-red-700">
                  {product.noOfItemsInStock}
                </span>
              </div>
              <div className="text-sm text-zinc-700">
                Threshold:{" "}
                <span className="font-bold">
                  {product.lowStockThreshold ?? "Not Set"}
                </span>
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                Location:{" "}
                <span className="font-medium">{product.location}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Page;
