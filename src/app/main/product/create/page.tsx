"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const dummyBrands = ["Nike", "Adidas", "Puma"];
const dummySources = ["Factory", "Distributor", "Local"];
const dummyLocations = ["Warehouse A", "Warehouse B"];

const schema = z.object({
  type: z
    .array(
      z.object({
        value: z.string().min(1, "Each type must have at least 1 character"),
      })
    )
    .min(1, "At least one type is required"),

  brand: z.string().min(1, "Brand is required"),
  source: z.string().min(1, "Source is required"),
  location: z.string().min(1, "Location is required"),

  noOfItemsInStock: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be an integer")
    .min(0, "Must be 0 or more"),

  buyingPrice: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Must be 0 or more"),

  sellingPrice: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Must be 0 or more"),

  description: z.string().optional(),

  lowStockThreshold: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be an integer")
    .min(0, "Must be 0 or more"),
});

const Page = () => {
  const [isNewBrand, setIsNewBrand] = useState(false);
  const [isNewSource, setIsNewSource] = useState(false);
  const [isNewLocation, setIsNewLocation] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
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

  const { fields, append, remove } = useFieldArray({
    name: "type",
    control,
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 p-4 max-w-xl mx-auto"
    >
      <div>
        <label>Type(s):</label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-center">
            <input
              {...register(`type.${index}.value`)}
              className="border p-2"
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            append({
              value: "",
            })
          }
          className="text-blue-500"
        >
          + Add Type
        </button>
        {errors.type && <p className="text-red-500">{errors.type.message}</p>}
      </div>

      <div>
        <label>Brand:</label>
        {isNewBrand ? (
          <input {...register("brand")} className="border p-2" />
        ) : (
          <select {...register("brand")} className="border p-2">
            <option value="">Please select a brand</option>
            {dummyBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={() => setIsNewBrand((prev) => !prev)}
          className="ml-2 text-blue-500"
        >
          {isNewBrand ? "Use Select" : "Add New"}
        </button>
        {errors.brand && <p className="text-red-500">{errors.brand.message}</p>}
      </div>

      <div>
        <label>Source:</label>
        {isNewSource ? (
          <input {...register("source")} className="border p-2" />
        ) : (
          <select {...register("source")} className="border p-2">
            <option value="">Please select a source</option>
            {dummySources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={() => setIsNewSource((prev) => !prev)}
          className="ml-2 text-blue-500"
        >
          {isNewSource ? "Use Select" : "Add New"}
        </button>
        {errors.source && (
          <p className="text-red-500">{errors.source.message}</p>
        )}
      </div>

      <div>
        <label>Location:</label>
        {isNewLocation ? (
          <input {...register("location")} className="border p-2" />
        ) : (
          <select {...register("location")} className="border p-2">
            <option value="">Please select a location</option>
            {dummyLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={() => setIsNewLocation((prev) => !prev)}
          className="ml-2 text-blue-500"
        >
          {isNewLocation ? "Use Select" : "Add New"}
        </button>
        {errors.location && (
          <p className="text-red-500">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label>No. of Items in Stock:</label>
        <input
          type="number"
          {...register("noOfItemsInStock", { valueAsNumber: true })}
          className="border p-2"
        />
        {errors.noOfItemsInStock && (
          <p className="text-red-500">{errors.noOfItemsInStock.message}</p>
        )}
      </div>

      <div>
        <label>Buying Price:</label>
        <input
          type="number"
          step="0.01"
          {...register("buyingPrice", { valueAsNumber: true })}
          className="border p-2"
        />
        {errors.buyingPrice && (
          <p className="text-red-500">{errors.buyingPrice.message}</p>
        )}
      </div>

      <div>
        <label>Selling Price:</label>
        <input
          type="number"
          step="0.01"
          {...register("sellingPrice", { valueAsNumber: true })}
          className="border p-2"
        />
        {errors.sellingPrice && (
          <p className="text-red-500">{errors.sellingPrice.message}</p>
        )}
      </div>

      <div>
        <label>Description:</label>
        <textarea {...register("description")} className="border p-2 w-full" />
      </div>

      <div>
        <label>Low Stock Threshold:</label>
        <input
          type="number"
          {...register("lowStockThreshold", { valueAsNumber: true })}
          className="border p-2"
        />
        {errors.lowStockThreshold && (
          <p className="text-red-500">{errors.lowStockThreshold.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  );
};

export default Page;

//AI PROMPTS

//use RHF and ZOD for validations
//TYPE
//type is a dynamic field.
//its state - string[]
//default state - ['']
//thus, showing an text input field by default
//should be a plus btn to add more name textinput field, also remove for each, well..the first default field won't have remove ofc
//validations - the state array must have min 1 string, and the strings inside must have min 1 char
//BRAND
//brand could either be a select or an text input, controlled by combination of isNewBrand state(default - 'false')[false - select, true - an text input] and a button
//default state - ''
//select element - use dummy for eg select options
//one select option with val '' and text 'Please select a brand'
//validations - string must be min 1
//SOURCE
//exactly same as BRAND
//noOfItemsInStock
//a number input
//validations - not optional, must be full no and >= 0
//buyingPrice
//a number input
//validations - not optional, can be full or 1.3(point no) etc and >= 0
//sellingPrice
//exactly same as buyingPrice
//description
//textarea
//default state - ''
//validations - optional
//lowStockThreshold
//exactly same as noOfItemsInStock
//location
//exactly same as BRAND

// follow the comments thoroughly and code
