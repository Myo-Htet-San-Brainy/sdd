"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateProductMutation,
  useGetProductMeta,
  useGetSimilarProducts,
  useGetSuggestions,
} from "@/query/product";
import toast from "react-hot-toast";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { hasPermission } from "@/lib/utils";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { SubmitButton } from "@/components/SubmitButton";
import { productSchema } from "@/schema";
import { CustomError } from "@/lib/CustomError";
import Link from "next/link";
import { Product } from "@/Interfaces/Product";
import ManageProductForm, {
  ManageProductFormRef,
} from "@/components/ManageProductForm";
import { useModal } from "@/context/modalContext";
import { ConflictModalContent } from "@/components/ConflictModalContent";
import { getProducts } from "@/services/product";

const Page = () => {
  const { data: myPermissions, isFetching, isPending } = useGetMyPermissions();
  const {
    data: productMeta,
    isFetching: isMetaFetching,
    isPending: isMetaPending,
    isError: isMetaError,
  } = useGetProductMeta({ brand: true, source: true, location: true });
  const { mutate: createProductMutate, isPending: isPendingCreateProduct } =
    useCreateProductMutation();
  const { showFormModal } = useModal();
  const manageProductFormRef = useRef<ManageProductFormRef>(null);

  async function handleCreateProd(prod: any) {
    try {
      const similarProductsData = await getProducts({
        type: prod.type[0],
        brand: prod.brand,
      });
      if (similarProductsData.products.length > 0) {
        const result = await showFormModal({
          title: "Some title",
          showCloseButton: false,
          content: (
            <ConflictModalContent
              currentProduct={{
                brand: prod.brand,
                type: prod.type,
                description: prod.description,
              }}
              similarProducts={similarProductsData.products}
            />
          ),
        });
        if (result !== "create") {
          // manageProductFormRef.current?.resetForm();
          return;
        }
      }
      createProductMutate(
        { payload: prod },
        {
          onSuccess: () => {
            toast.success("Product Created!");
            manageProductFormRef.current?.resetForm();
          },
          onError(error, variables, context) {
            toast.error("Creating Product Failed! Try again later...");
          },
        }
      );
    } catch (error) {
      toast.error("Creating Product Failed! Try again later...");
    }
  }

  const onSubmit = (data: any) => {
    const type = data.type.map((item: any) => item.value);
    handleCreateProd({ ...data, type });
  };

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
      MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_CREATE.name
    )
  ) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-red-600 text-lg font-medium text-center">
          You are not permitted to create products.
        </p>
      </div>
    );
  }

  if (isMetaFetching || isMetaPending) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-600 animate-pulse text-center">
          Preparing product form...
        </p>
      </div>
    );
  }

  if (isMetaError) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-red-600 text-center text-lg font-medium">
          Failed to load product metadata.
        </p>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 py-10 px-4">
      <ManageProductForm
        productMeta={productMeta}
        isPending={false}
        onSubmit={onSubmit}
        ref={manageProductFormRef}
      />
    </div>
  );
};

export default Page;
