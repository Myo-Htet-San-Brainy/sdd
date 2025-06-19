"use client";

import Link from "next/link";
import { useGetLowStockProducts } from "@/query/report";
import { Product } from "@/Interfaces/Product";

const Page = () => {
  const {
    data: lowStockProducts,
    isFetching,
    isError,
  } = useGetLowStockProducts();

  if (isFetching) return <p className="text-gray-500">Loading data...</p>;
  if (isError) return <p className="text-red-500">Something went wrong 😢</p>;
  if (!lowStockProducts || lowStockProducts.length === 0)
    return (
      <p className="text-green-600">All products have sufficient stock 🎉</p>
    );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Low Stock Alerts 🚨</h1>
      <ul className="space-y-4">
        {lowStockProducts.map((product: Product) => (
          <li key={product._id}>
            <Link
              href={`/main/product/${product._id}`}
              className="block border border-yellow-400 bg-yellow-50 rounded-xl p-4 shadow-sm hover:bg-yellow-100 transition-colors"
            >
              <div className="font-bold text-lg">
                {product.brand} – {product.description}
              </div>
              <div className="text-sm text-gray-700">
                In Stock:{" "}
                <span className="font-semibold">
                  {product.noOfItemsInStock}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                Threshold:{" "}
                <span className="font-semibold">
                  {product.lowStockThreshold ?? "Not Set"}
                </span>
              </div>
              <div className="text-sm mt-2">
                Location:{" "}
                <span className="font-medium">{product.location}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Page;
