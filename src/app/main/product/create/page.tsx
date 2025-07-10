"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateProductMutation,
  useGetProductMeta,
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
import ManageProductForm from "@/components/ManageProductForm";

const Page = () => {
  const [conflictModal, setConflictModal] = useState<{
    currentProduct: any;
    similarProducts: Product[];
    variables: any;
  } | null>(null);

  const { data: myPermissions, isFetching, isPending } = useGetMyPermissions();

  const {
    data: productMeta,
    isFetching: isMetaFetching,
    isPending: isMetaPending,
    isError: isMetaError,
  } = useGetProductMeta({ brand: true, source: true, location: true });

  const { mutate: createProductMutate, isPending: isPendingCreateProduct } =
    useCreateProductMutation();

  const onSubmit = (data: any) => {
    const type = data.type.map((item: any) => item.value);
    mutate(
      { payload: { ...data, type } },
      {
        onSuccess: () => {
          toast.success("Product Created!");
          reset();
        },
        onError(error, variables, context) {
          if (error instanceof CustomError) {
            if (error.status === 409) {
              // Open modal
              setConflictModal({
                currentProduct: {
                  brand: variables.payload.brand,
                  type: variables.payload.type,
                  description: variables.payload.description,
                },
                similarProducts: error.body.similarProducts,
                variables,
              });
            } else {
              toast.error("Creating Product Failed! Try again later...");
            }
          }
        },
      }
    );
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
      {conflictModal && (
        <div className="fixed inset-0 bg-red-600/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/30 backdrop-blur-lg p-6 rounded-2xl max-w-lg w-full space-y-6 border border-red-200 shadow-lg">
            <h2 className="text-lg font-semibold text-white">
              Similar Products Found
            </h2>

            {/* Current Product */}
            <div className="space-y-2">
              <h3 className="font-medium text-white">
                Product You Tried to Create:
              </h3>
              <p className="text-sm text-white">
                <strong>Brand:</strong>{" "}
                {conflictModal.currentProduct.brand || "N/A"} <br />
                <strong>Type:</strong>{" "}
                {conflictModal.currentProduct.type.join(", ")} <br />
                <strong>Description:</strong>{" "}
                {conflictModal.currentProduct.description}
              </p>
            </div>

            {/* Similar Products */}
            <div className="space-y-2">
              <h3 className="font-medium text-white">Similar Products:</h3>
              {conflictModal.similarProducts.map((prod) => (
                <div
                  key={prod._id}
                  className="border border-white/30 bg-white/20 backdrop-blur-md p-3 rounded-md flex items-start justify-between"
                >
                  <div className="text-sm text-white">
                    <strong>Brand:</strong> {prod.brand || "N/A"} <br />
                    <strong>Type:</strong> {prod.type.join(", ")} <br />
                    <strong>Description:</strong> {prod.description}
                  </div>
                  <Link
                    href={`/main/product/${prod._id}/update`}
                    className="ml-4 text-white underline hover:text-red-700 text-sm"
                  >
                    Update This Product
                  </Link>
                </div>
              ))}
            </div>

            {/* Confirm */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  mutate(
                    {
                      payload: conflictModal.variables.payload,
                      isForSureNewProd: true,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Product Created!");
                        reset();
                        setConflictModal(null);
                      },
                      onError: () => {
                        toast.error(
                          "Creating Product Failed! Try again later..."
                        );
                      },
                    }
                  );
                  console.log("confirm create");
                }}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-md"
              >
                Confirm Create New
              </button>
            </div>
          </div>
        </div>
      )}

      <ManageProductForm
        productMeta={productMeta}
        isPendingAction={isPendingCreateProduct}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default Page;
