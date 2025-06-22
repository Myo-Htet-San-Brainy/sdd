"use client";

import AllowedPermissions from "@/components/AllowedPermissions";
import { Product } from "@/Interfaces/Product";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { CustomError } from "@/lib/CustomError";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetProductById } from "@/query/product";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const Page = () => {
  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();
  const { id }: { id?: string } = useParams();
  const {
    data: product,
    isFetching: isFetchingProduct,
    isPending: isPendingProduct,
    isError: isErrorProduct,
    error: errorProduct,
  } = useGetProductById(id);

  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const type = typeParam ? JSON.parse(typeParam) : [];

  useEffect(() => {
    if (errorProduct instanceof CustomError && errorProduct.status === 404) {
      type.forEach((type: string) => {
        queryClient.invalidateQueries({ queryKey: ["products", type] });
      });
      queryClient.invalidateQueries({ queryKey: ["products-meta"] });
    }
  }, [isErrorProduct]);

  if (isFetchingMyPermissions) {
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
      MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_READ.name
    )
  ) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-red-600 text-center text-lg font-medium">
          You are not permitted to view{" "}
          {MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_READ.displayName}.
        </p>
      </div>
    );
  }

  if (isPendingProduct || isFetchingProduct) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-600 animate-pulse text-center">
          Loading product details...
        </p>
      </div>
    );
  }

  if (isErrorProduct) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-center text-red-600 text-lg font-medium">
          {errorProduct instanceof CustomError && errorProduct.status === 404
            ? "Product Not Found!"
            : "Something went wrong while loading the product!"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-10">
      <div className="max-w-2xl mx-auto p-6 rounded-2xl shadow-md border border-zinc-200 bg-white space-y-5">
        <h2 className="text-2xl font-bold text-red-600 border-b pb-2">
          Product Details
        </h2>

        <div className="grid gap-4">
          <Detail label="Type" value={product.type.join(", ")} />
          {product.description && (
            <Detail label="Description" value={product.description} />
          )}
          <Detail label="Brand" value={product.brand} />
          <Detail label="Items in Stock" value={product.noOfItemsInStock} />
          <Detail
            label="Selling Price"
            value={`${product.sellingPrice.toLocaleString()} MMK`}
          />
          <Detail label="Location" value={product.location} />
          {product.buyingPrice !== undefined && (
            <Detail
              label="Buying Price"
              value={`${product.buyingPrice.toLocaleString()} MMK`}
            />
          )}
          {product.source && <Detail label="Source" value={product.source} />}
          {product.lowStockThreshold !== undefined && (
            <Detail
              label="Low Stock Threshold"
              value={product.lowStockThreshold}
            />
          )}
        </div>

        {hasPermission(
          myPermissions!,
          MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_UPDATE.name
        ) && (
          <div className="pt-4">
            <Link
              href={`/main/product/${product._id}/update`}
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Update Product
            </Link>
          </div>
        )}
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
