"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  useGetProductById,
  useUpdateProductMutation,
  useGetProductMeta,
} from "@/query/product";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { hasPermission } from "@/lib/utils";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";

import { CustomError } from "@/lib/CustomError";

import { SubmitButton } from "@/components/SubmitButton";
import { productSchema } from "@/schema";
import ManageProductForm from "@/components/ManageProductForm";
import { Product } from "@/Interfaces/Product";
import { getProducts } from "@/services/product";

const colorEmoji = ["🔴", "🟢", "🔵", "🟣", "🟡", "🟤", "⚫", "⚪"];

const Page = () => {
  const { data: myPermissions, isFetching, isPending } = useGetMyPermissions();
  const { id }: { id?: string } = useParams();
  const router = useRouter();
  const {
    data: product,
    isFetching: isProductFetching,
    isPending: isProductPending,
    isError: isProductError,
    error: errorProduct,
  } = useGetProductById(id);

  const {
    data: productMeta,
    isFetching: isMetaFetching,
    isPending: isMetaPending,
    isError: isMetaError,
  } = useGetProductMeta({ brand: true, source: true, location: true });

  const { mutate: updateProdMutate, isPending: isPendingUpdateProduct } =
    useUpdateProductMutation();

  if (isFetching || isPending) {
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
      MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_UPDATE.name
    )
  ) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-red-600 text-lg font-medium text-center">
          You are not permitted to update products.
        </p>
      </div>
    );
  }

  if (
    isMetaFetching ||
    isMetaPending ||
    isProductFetching ||
    isProductPending
  ) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-600 animate-pulse text-center">
          Preparing product form...
        </p>
      </div>
    );
  }

  if (isMetaError || isProductError) {
    const notFound =
      errorProduct instanceof CustomError && errorProduct.status === 404;
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-red-600 text-center text-lg font-medium">
          {notFound
            ? "Product Not Found!"
            : "Something went wrong loading the product."}
        </p>
      </div>
    );
  }

  // async function handleUpdateProd(prod: Product) {
  //   try {
  //     const similarProductsData = await getProducts({
  //       type: prod.type[0],
  //       brand: prod.brand,
  //     });
  //     if (similarProductsData.products.length > 0) {
  //     }
  //   } catch (error) {
  //     toast.error("Updating Product Failed! Try again later...");
  //   }
  // }

  const onSubmit = (data: any) => {
    const type = data.type.map((item: any) => item.value);
    updateProdMutate(
      { productId: id!, productPayload: { ...data, type } },
      {
        onSuccess: () => {
          toast.success("Product Updated!");
          router.push(`/main/product/${id}`);
        },
        onError: () => {
          toast.error("Updating Product Failed! Try again later...");
        },
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 py-10 px-4">
      <ManageProductForm
        productMeta={productMeta}
        existingProduct={{
          ...product,
          type: product.type.map((item) => {
            return { value: item };
          }),
        }}
        isPending={false}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default Page;
