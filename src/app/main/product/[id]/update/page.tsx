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

const colorEmoji = ["🔴", "🟢", "🔵", "🟣", "🟡", "🟤", "⚫", "⚪"];

const Page = () => {
  const { data: myPermissions, isFetching, isPending } = useGetMyPermissions();
  const { id }: { id?: string } = useParams();
  const router = useRouter();

  const [isNewBrand, setIsNewBrand] = useState(false);
  const [isNewSource, setIsNewSource] = useState(false);
  const [isNewLocation, setIsNewLocation] = useState(false);

  const {
    data: productMeta,
    isFetching: isMetaFetching,
    isPending: isMetaPending,
    isError: isMetaError,
  } = useGetProductMeta({ brand: true, source: true, location: true });

  const {
    data: product,
    isFetching: isProductFetching,
    isPending: isProductPending,
    isError: isProductError,
    error: errorProduct,
  } = useGetProductById(id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: [{ value: "" }],
      brand: "",
      source: "",
      location: "",
      noOfItemsInStock: 0,
      buyingPrice: 0,
      sellingPrice: 0,
      description: "",
      lowStockThreshold: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ name: "type", control });
  const { mutate, isPending: isPendingUpdateProduct } =
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

  const onSubmit = (data: any) => {
    const type = data.type.map((item: any) => item.value);
    mutate(
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-zinc-200 shadow-md rounded-2xl max-w-2xl mx-auto p-6 space-y-6"
      >
        <h1 className="text-xl font-semibold text-red-600 border-b pb-2">
          Update Product
        </h1>

        {/* Type Fields */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            Type(s):
          </label>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  {...register(`type.${index}.value`)}
                  className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => append({ value: "" })}
              className="text-blue-600 hover:underline text-sm"
            >
              + Add Type
            </button>
          </div>
          {errors.type && (
            <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">Brand</label>
          {isNewBrand ? (
            <input
              {...register("brand")}
              className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
            />
          ) : (
            <select
              {...register("brand")}
              className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
            >
              <option value="" className="">
                No Brand
              </option>
              {productMeta.brands?.map((opt: string) => (
                <option key={opt} value={opt} className="">
                  {opt}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => setIsNewBrand((prev) => !prev)}
            className="text-blue-600 text-sm mt-1 hover:underline"
          >
            {isNewBrand ? `Use Select` : `+ Add New Brand`}
          </button>
          {errors["brand"] && (
            <p className="text-sm text-red-500 mt-1">
              {errors["brand"]?.message as string}
            </p>
          )}
        </div>

        {/* 🔹 Source Field */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            Source:
          </label>
          {isNewSource ? (
            <input
              {...register("source")}
              className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
            />
          ) : (
            <select
              {...register("source")}
              className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
            >
              <option value="" className="">
                Select a source
              </option>
              {productMeta.sources &&
                productMeta.sources.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => setIsNewSource((prev) => !prev)}
            className="text-blue-600 text-sm mt-1 hover:underline"
          >
            {isNewSource ? `Use Select` : `+ Add New Source`}
          </button>
          {errors["source"] && (
            <p className="text-sm text-red-500 mt-1">
              {errors["source"]?.message as string}
            </p>
          )}
        </div>

        {/* 🔹 Location Field */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            Location:
          </label>
          {isNewLocation ? (
            <input
              {...register("location")}
              className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
            />
          ) : (
            <select
              {...register("location")}
              className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
            >
              <option value="" className="">
                Select a location
              </option>
              {productMeta.locations &&
                productMeta.locations.flatMap((optArr, groupIndex) => {
                  const marker = colorEmoji[groupIndex % colorEmoji.length];
                  return optArr.map((opt) => (
                    <option key={opt} value={opt}>
                      {marker} {opt}
                    </option>
                  ));
                })}
            </select>
          )}
          <button
            type="button"
            onClick={() => setIsNewLocation((prev) => !prev)}
            className="text-blue-600 text-sm mt-1 hover:underline"
          >
            {isNewLocation ? `Use Select` : `+ Add New Location`}
          </button>
          {errors["location"] && (
            <p className="text-sm text-red-500 mt-1">
              {errors["location"]?.message as string}
            </p>
          )}
        </div>

        {/* Number Inputs */}
        {[
          { label: "No. of Items in Stock", name: "noOfItemsInStock" },
          { label: "Buying Price", name: "buyingPrice" },
          { label: "Selling Price", name: "sellingPrice" },
          { label: "Low Stock Threshold", name: "lowStockThreshold" },
        ].map(({ label, name }) => (
          <div key={name}>
            <label className="block font-medium text-zinc-700 mb-1">
              {label}:
            </label>
            <input
              type="number"
              step="0.01"
              {...register(
                name as
                  | "noOfItemsInStock"
                  | "buyingPrice"
                  | "sellingPrice"
                  | "lowStockThreshold",
                { valueAsNumber: true }
              )}
              className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
            />
            {errors[name as keyof typeof errors] && (
              <p className="text-sm text-red-500 mt-1">
                {errors[name as keyof typeof errors]?.message as string}
              </p>
            )}
          </div>
        ))}

        {/* Description */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            Description:
          </label>
          <textarea
            {...register("description")}
            className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
            rows={3}
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <SubmitButton isLoading={isPendingUpdateProduct}>
            Update Product
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default Page;
