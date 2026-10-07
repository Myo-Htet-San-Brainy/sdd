"use client";

import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { CustomError } from "@/lib/CustomError";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useDeleteProductMutation, useGetProductById } from "@/query/product";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const t = useTranslations("prodDetailsPage");
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
  const { mutate: deleteProductMutate, isPending: isDeleting } =
    useDeleteProductMutation();
  const router = useRouter();

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

  function handleDeleteProduct() {
    if (!product?._id) return;
    if (!window.confirm(t("deleteConfirm"))) return;

    const toastId = toast.loading(t("deletingProd"));
    deleteProductMutate(
      { productId: product._id },
      {
        onSuccess() {
          toast.success(t("deleteSuccess"), { id: toastId });
          router.push("/main/product");
        },
        onError(error) {
          if (error instanceof CustomError && error.status === 404) {
            toast.success(t("deleteSuccess"), { id: toastId });
            router.push("/main/product");
          } else {
            toast.error(t("deleteFailed"), { id: toastId });
          }
        },
      }
    );
  }

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

  const canUpdate = hasPermission(
    myPermissions!,
    MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_UPDATE.name
  );
  const canDelete = hasPermission(
    myPermissions!,
    MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_DELETE.name
  );

  return (
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-10">
      <div className="max-w-2xl mx-auto p-6 rounded-2xl shadow-md border border-zinc-200 bg-white space-y-5">
        <h2 className="text-2xl font-bold text-red-600 border-b pb-2">
          {t("title")}
        </h2>

        <div className="grid gap-4">
          <Detail label={t("type")} value={product.type.join(", ")} />
          {product.description && (
            <Detail label={t("description")} value={product.description} />
          )}
          {product.brand && <Detail label={t("brand")} value={product.brand} />}
          <Detail label={t("itemsInStock")} value={product.noOfItemsInStock} />
          <Detail
            label={t("sellingPrice")}
            value={`${product.sellingPrice.toLocaleString()} MMK`}
          />
          <Detail label={t("location")} value={product.location} />
          {product.buyingPrice !== undefined && (
            <Detail
              label={t("buyingPrice")}
              value={`${product.buyingPrice.toLocaleString()} MMK`}
            />
          )}
          {product.source && (
            <Detail label={t("source")} value={product.source} />
          )}
          {product.lowStockThreshold !== undefined && (
            <Detail
              label={t("lowStockThreshold")}
              value={product.lowStockThreshold}
            />
          )}
          {product.lastUpdated && (
            <Detail
              label={t("lastUpdated")}
              value={
                typeof product.lastUpdated === "string" ||
                typeof product.lastUpdated === "number"
                  ? new Date(product.lastUpdated).toLocaleString()
                  : ""
              }
            />
          )}
        </div>

        {(canUpdate || canDelete) && (
          <div className="pt-4 flex flex-wrap gap-3">
            {canUpdate && (
              <Link
                href={`/main/product/${product._id}/update`}
                className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                {t("updateProd")}
              </Link>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="inline-block bg-zinc-800 hover:bg-zinc-900 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition"
              >
                {t("deleteProd")}
              </button>
            )}
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
