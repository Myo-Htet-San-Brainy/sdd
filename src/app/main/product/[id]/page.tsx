"use client";

import { Product } from "@/Interfaces/Product";
import { CustomError } from "@/lib/CustomError";
import { useGetProduct } from "@/query/product";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

const dummyProduct: Omit<Product, "_id"> = {
  type: ["Footwear", "Sports"],
  description: "Lightweight and durable running shoes.",
  brand: "Nike",
  noOfItemsInStock: 12,
  sellingPrice: 120.5,
  location: "Yangon",
  buyingPrice: 80.0,
  source: "USA",
  lowStockThreshold: 5,
};

const Page = () => {
  const { id }: { id?: string } = useParams();
  const {
    data: product,
    isFetching: isFetchingProduct,
    isPending: isPendingProduct,
    isError: isErrorProduct,
    error: errorProduct,
  } = useGetProduct(id);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (
      errorProduct &&
      errorProduct instanceof CustomError &&
      errorProduct.status === 404
    ) {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    }
  }, [isErrorProduct]);

  if (isPendingProduct || isFetchingProduct) {
    return <p>loading product details...</p>;
  }

  if (isErrorProduct) {
    if (errorProduct instanceof CustomError && errorProduct.status === 404) {
      return <p>Product Not Found!</p>;
    } else {
      return <p>Smth went wrong loading product!</p>;
    }
  }

  if (!product) {
    return <p>Smth went wrong loading product!</p>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 rounded-2xl shadow-md border space-y-4">
      <h2 className="text-2xl font-bold mb-4">Product Details</h2>
      <div className="space-y-2">
        <Detail label="Type" value={product.type.join(", ")} />
        <Detail label="Description" value={product.description} />
        <Detail label="Brand" value={product.brand} />
        <Detail label="Items in Stock" value={product.noOfItemsInStock} />
        <Detail label="Selling Price" value={`$${product.sellingPrice}`} />
        <Detail label="Location" value={product.location} />
        {product.buyingPrice !== undefined && (
          <Detail label="Buying Price" value={`$${product.buyingPrice}`} />
        )}
        {product.source && <Detail label="Source" value={product.source} />}
        {product.lowStockThreshold !== undefined && (
          <Detail
            label="Low Stock Threshold"
            value={product.lowStockThreshold}
          />
        )}
      </div>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
        Update
      </button>
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
  <div className="flex justify-between">
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </div>
);

export default Page;
