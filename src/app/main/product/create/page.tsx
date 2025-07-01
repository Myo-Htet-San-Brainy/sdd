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

const Page = () => {
  const [conflictModal, setConflictModal] = useState<{
    currentProduct: any;
    similarProducts: Product[];
    variables: any;
  } | null>(null);

  const { data: myPermissions, isFetching, isPending } = useGetMyPermissions();
  const [suggestionPrompt, setSuggestionPrompt] = useState<{
    value: string;
    index: number;
  } | null>(null);

  const {
    data: productMeta,
    isFetching: isMetaFetching,
    isPending: isMetaPending,
    isError: isMetaError,
  } = useGetProductMeta({ brand: true, source: true, location: true });

  const { data: suggestions } = useGetSuggestions({
    type: suggestionPrompt?.value || "",
    mode: "arrays",
  });

  const { mutate, isPending: isPendingCreateProduct } =
    useCreateProductMutation();

  const [isNewBrand, setIsNewBrand] = useState(false);
  const [isNewSource, setIsNewSource] = useState(false);
  const [isNewLocation, setIsNewLocation] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
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

  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setSuggestionPrompt(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleSuggestionClick = (suggestionArray: string[]) => {
    const modifiedSugs = suggestionArray.map((sug) => {
      return { value: sug };
    });
    setValue("type", modifiedSugs);

    setSuggestionPrompt(null);
  };

  // --- Permission and Loading States (Unchanged) ---
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full space-y-4">
            <h2 className="text-lg font-semibold text-red-600">
              Similar Products Found
            </h2>
            <div className="space-y-2">
              <h3 className="font-medium text-zinc-800">
                Product You Tried to Create:
              </h3>
              <p className="text-sm text-zinc-700">
                <strong>Brand:</strong>{" "}
                {conflictModal.currentProduct.brand || "N/A"} <br />
                <strong>Type:</strong>{" "}
                {conflictModal.currentProduct.type.join(", ")} <br />
                <strong>Description:</strong>{" "}
                {conflictModal.currentProduct.description}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-zinc-800">Similar Products:</h3>
              {conflictModal.similarProducts.map((prod, i) => (
                <div key={prod._id} className="border p-2 rounded-md">
                  <p className="text-sm text-zinc-800">
                    <strong>Brand:</strong> {prod.brand || "N/A"} <br />
                    <strong>Type:</strong> {prod.type.join(", ")} <br />
                    <strong>Description:</strong> {prod.description}
                  </p>
                  <Link
                    href={`/main/product/${prod._id}/update`}
                    className="mt-1 text-red-600 text-sm hover:underline"
                  >
                    Update This Product
                  </Link>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4">
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
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Confirm Create New
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-zinc-200 shadow-md rounded-2xl max-w-2xl mx-auto p-6 space-y-6"
      >
        <h1 className="text-xl font-semibold text-red-600 border-b pb-2">
          Create New Product
        </h1>

        {/* 🔹 Type Fields with Suggestions */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            Type(s):
          </label>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 relative">
                <input
                  {...register(`type.${index}.value`)}
                  className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
                  onChange={(e) => {
                    setValue(`type.${index}.value`, e.target.value);
                    setSuggestionPrompt({ value: e.target.value, index });
                  }}
                  onFocus={() => {
                    // Correctly get the current value for the focused input
                    const currentValue = getValues(`type.${index}.value`);
                    setSuggestionPrompt({ value: currentValue || "", index });
                  }}
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      remove(index);
                      if (suggestionPrompt?.index === index) {
                        setSuggestionPrompt(null);
                      }
                    }}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}

                {/* Suggestions dropdown for THIS specific input */}
                {suggestionPrompt?.index === index &&
                  suggestions &&
                  (suggestions as string[][]).length > 0 && (
                    <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-zinc-300 rounded-md shadow-md z-20">
                      {(suggestions as string[][]).map((suggestionArray, i) => (
                        <button
                          type="button"
                          key={`${suggestionArray.join("-")}-${i}`}
                          // Pass the entire suggestionArray (e.g., ['ball', 'ee']) to the handler
                          onClick={() => handleSuggestionClick(suggestionArray)}
                          className="w-full text-left px-4 py-2 hover:bg-zinc-100 text-zinc-700"
                        >
                          {suggestionArray.join(", ")}
                        </button>
                      ))}
                    </div>
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
            <p className="text-sm text-red-500 mt-1">
              {errors.type.message as string}
            </p>
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

        {/* 🔹 Select/Toggle Fields */}
        {[
          {
            label: "Source",
            name: "source",
            isNew: isNewSource,
            toggle: setIsNewSource,
            options: productMeta.sources,
          },
          {
            label: "Location",
            name: "location",
            isNew: isNewLocation,
            toggle: setIsNewLocation,
            options: productMeta.locations,
          },
        ].map(({ label, name, isNew, toggle, options }) => (
          <div key={name}>
            <label className="block font-medium text-zinc-700 mb-1">
              {label}:
            </label>
            {isNew ? (
              <input
                {...register(name as "source" | "location")}
                className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
              />
            ) : (
              <select
                {...register(name as "source" | "location")}
                className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
              >
                <option value="" className="">
                  Select a {label.toLowerCase()}
                </option>
                {name === "location"
                  ? (options as string[][])?.flatMap((optArr, groupIndex) => {
                      const colorEmoji = [
                        "🔴",
                        "🟢",
                        "🔵",
                        "🟣",
                        "🟡",
                        "🟤",
                        "⚫",
                        "⚪",
                      ];
                      const marker = colorEmoji[groupIndex % colorEmoji.length];
                      return optArr.map((opt) => (
                        <option value={opt} key={opt}>
                          {marker} {opt}
                        </option>
                      ));
                    })
                  : (options as string[])?.map((opt) => (
                      <option key={opt} value={opt} className="">
                        {opt}
                      </option>
                    ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => toggle((prev) => !prev)}
              className="text-blue-600 text-sm mt-1 hover:underline"
            >
              {isNew ? `Use Select` : `+ Add New ${label}`}
            </button>
            {errors[name as keyof typeof errors] && (
              <p className="text-sm text-red-500 mt-1">
                {errors[name as keyof typeof errors]?.message as string}
              </p>
            )}
          </div>
        ))}

        {/* 🔹 Number Inputs */}
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

        {/* 🔹 Description */}
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

        {/* 🔹 Submit */}
        <div className="pt-4">
          <SubmitButton isLoading={isPendingCreateProduct}>
            Submit Product
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default Page;
