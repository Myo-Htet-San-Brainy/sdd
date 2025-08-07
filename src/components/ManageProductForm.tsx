import { useGetSuggestions } from "@/query/product";
import { productSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { SubmitButton } from "@/components/SubmitButton";
import { forwardRef, useImperativeHandle } from "react";
import { Product } from "@/Interfaces/Product";
import { sortEnglishFirst } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ExistingProduct extends Omit<Product, "type"> {
  type: {
    value: string;
  }[];
}

interface ManageProductFormProps {
  titleText: string;
  submitText: string;
  productMeta: {
    brands: string[] | null;
    locations: string[][] | null;
    sources: string[] | null;
  };
  isPending: boolean;
  // submitBtnText: string;
  existingProduct?: ExistingProduct;
  onSubmit: (data: any) => void;
}

export type ManageProductFormRef = {
  resetForm: (values?: any) => void;
};

const colorEmoji = ["🔴", "🟢", "🔵", "🟣", "🟡", "🟤", "⚫", "⚪"];

const ManageProductForm = forwardRef<
  ManageProductFormRef,
  ManageProductFormProps
>(
  (
    {
      titleText,
      submitText,
      productMeta,
      isPending,
      existingProduct,
      onSubmit,
    },
    ref
  ) => {
    const t = useTranslations("createProdPage");

    const [suggestionPrompt, setSuggestionPrompt] = useState<{
      value: string;
      index: number;
    } | null>(null);
    const { data: suggestions } = useGetSuggestions({
      type: suggestionPrompt?.value || "",
      mode: "arrays",
    });

    const formRef = useRef<HTMLFormElement | null>(null);
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          formRef.current &&
          !formRef.current.contains(event.target as Node)
        ) {
          setSuggestionPrompt(null);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

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

    useImperativeHandle(ref, () => ({
      resetForm: (values) => {
        reset(
          values || {
            type: [{ value: "" }],
            brand: "",
            source: "",
            location: "",
            noOfItemsInStock: 0,
            buyingPrice: 0,
            sellingPrice: 0,
            description: "",
            lowStockThreshold: 0,
          }
        );
      },
    }));

    const handleSuggestionClick = (suggestionArray: string[]) => {
      const modifiedSugs = suggestionArray.map((sug) => {
        return { value: sug };
      });
      setValue("type", modifiedSugs);

      setSuggestionPrompt(null);
    };

    useEffect(() => {
      if (existingProduct) {
        reset(existingProduct);
      }
    }, [existingProduct]);

    return (
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-zinc-200 shadow-md rounded-2xl max-w-2xl mx-auto p-6 space-y-6"
      >
        <h1 className="text-xl font-semibold text-red-600 border-b pb-2">
          {titleText}
        </h1>

        {/* 🔹 Type Fields with Suggestions */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            {t("type")}:
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
                    {t("remove")}
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
              + {t("addType")}
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
          <label className="block font-medium text-zinc-700 mb-1">
            {t("brand")}
          </label>
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
              {sortEnglishFirst(productMeta.brands as string[]).map(
                (opt: string) => {
                  return (
                    opt !== "" && (
                      <option key={opt} value={opt} className="">
                        {opt}
                      </option>
                    )
                  );
                }
              )}
            </select>
          )}
          <button
            type="button"
            onClick={() => setIsNewBrand((prev) => !prev)}
            className="text-blue-600 text-sm mt-1 hover:underline"
          >
            {isNewBrand ? t("selectFromExisting") : `+ ${t("addNew")}`}
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
            {t("source")}:
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
                sortEnglishFirst(productMeta.sources).map((opt) => (
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
            {isNewSource ? t("selectFromExisting") : `+ ${t("addNew")}`}
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
            {t("location")}:
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
            {isNewLocation ? t("selectFromExisting") : `+ ${t("addNew")}`}
          </button>
          {errors["location"] && (
            <p className="text-sm text-red-500 mt-1">
              {errors["location"]?.message as string}
            </p>
          )}
        </div>

        {/* 🔹 Number Inputs */}
        {[
          { label: t("noOfItemsInStock"), name: "noOfItemsInStock" },
          { label: t("buyingPrice"), name: "buyingPrice" },
          { label: t("sellingPrice"), name: "sellingPrice" },
          { label: t("lowStockThreshold"), name: "lowStockThreshold" },
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
            {t("description")}:
          </label>
          <textarea
            {...register("description")}
            className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
            rows={3}
          />
        </div>

        {/* 🔹 Submit */}
        <div className="pt-4">
          <SubmitButton isLoading={isPending}>{submitText}</SubmitButton>
        </div>
      </form>
    );
  }
);

export default ManageProductForm;
