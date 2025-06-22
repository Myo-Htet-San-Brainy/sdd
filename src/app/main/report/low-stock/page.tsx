"use client";

import Link from "next/link";
import { useGetLowStockProducts } from "@/query/report";
import { Product } from "@/Interfaces/Product";
import { hasPermission } from "@/lib/utils";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { useMyPermissionsContext } from "@/context";

const Page = () => {
  const { myPermissions } = useMyPermissionsContext();
  const {
    data: lowStockProducts,
    isPending,
    isFetching,
    isError,
  } = useGetLowStockProducts();

  // Check if user has permission to view products
  const hasProductReadPermission = hasPermission(
    myPermissions,
    MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_READ.name
  );

  if (
    !hasPermission(
      myPermissions,
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

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {lowStockProducts.map((product: Product) =>
          hasProductReadPermission ? (
            <Link
              key={product._id}
              href={`/main/product/${product._id}`}
              className="bg-red-50 border border-red-200 rounded-xl p-3 shadow-sm hover:bg-red-100 transition-colors"
            >
              <ProductCardContent product={product} />
            </Link>
          ) : (
            <div
              key={product._id}
              className="bg-red-50 border border-red-200 rounded-xl p-3 shadow-sm"
            >
              <ProductCardContent product={product} />
            </div>
          )
        )}
      </div>
    </section>
  );
};

// Extracted product card content as a separate component to avoid duplication
const ProductCardContent = ({ product }: { product: Product }) => {
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-1">
        {product.type.map((type) => (
          <span
            key={type}
            className="text-xs font-bold bg-red-100 text-red-700 p-2 rounded-lg"
          >
            {type}
          </span>
        ))}
      </div>

      {product.description && (
        <div className="text-xs text-zinc-600 truncate">
          {product.description}
        </div>
      )}

      {product.brand && (
        <div className="text-xs text-zinc-500">{product.brand}</div>
      )}

      <div className="mt-2 text-xs text-red-700 font-semibold">
        In Stock: {product.noOfItemsInStock}
      </div>

      <div className="text-xs text-zinc-700">
        Threshold: {product.lowStockThreshold ?? "Not Set"}
      </div>

      <div className="mt-2 text-xs text-zinc-600">
        Location: <span className="font-medium">{product.location}</span>
      </div>

      <div className="text-xs text-zinc-600">
        Source: <span className="font-medium">{product.source}</span>
      </div>
    </>
  );
};

export default Page;
