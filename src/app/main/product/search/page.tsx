"use client";

import React, { useState, useRef, useEffect } from "react";
import { useGetSuggestions, useGetProductMeta } from "@/query/product";
import { getProducts } from "@/services/product";
import Product from "@/components/Product";
import { Product as ProductI } from "@/Interfaces/Product";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { hasPermission } from "@/lib/utils";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";

const Page = () => {
  const {
    data: myPermissions,
    isFetching: isFetchingMyPermissions,
    isPending: isPendingMyPermissions,
  } = useGetMyPermissions();

  const [type, setType] = useState("");
  const [suggestionPrompt, setSuggestionPrompt] = useState("");
  const [brand, setBrand] = useState("");
  const [source, setSource] = useState("");
  const [location, setLocation] = useState("");
  const [products, setProducts] = useState<ProductI[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const typeRef = useRef<HTMLDivElement | null>(null);

  const { data: suggestions } = useGetSuggestions({ type: suggestionPrompt });
  const {
    data: productMeta,
    isFetching: isMetaFetching,
    isPending: isMetaPending,
    isError: isMetaError,
  } = useGetProductMeta({ brand: true, source: true, location: true });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setSuggestionPrompt("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isFetchingMyPermissions || isPendingMyPermissions) {
    return (
      <div className="w-full min-h-[calc(100vh-72px)] py-6 text-center bg-zinc-50">
        <p className="text-zinc-800 animate-pulse">Checking permissions...</p>
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
      <p className="mt-6 text-center text-red-700">
        You are not permitted to view{" "}
        {MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_READ.displayName}.
      </p>
    );
  }

  const handleSearch = async () => {
    setIsLoading(true);
    setError("");
    setProducts(undefined);
    try {
      const filterObj: Record<string, string> = {};
      if (type.trim() !== "") filterObj["type"] = type.trim();
      if (brand.trim() !== "") filterObj["brand"] = brand.trim();
      if (source.trim() !== "") filterObj["source"] = source.trim();
      if (location.trim() !== "") filterObj["location"] = location.trim();
      const res = await getProducts(filterObj);
      setProducts(res.products);
    } catch (err) {
      setError("Error fetching products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  let content = null;
  if (isLoading) {
    content = (
      <div className="min-h-[300px] flex justify-center items-center">
        <p className="text-zinc-500 animate-pulse">🔄 Fetching products...</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="min-h-[300px] flex justify-center items-center">
        <p className="text-red-600 font-medium">❌ {error}</p>
      </div>
    );
  } else if (products === undefined) {
    content = null;
  } else if (Array.isArray(products) && products.length === 0) {
    content = (
      <div className="min-h-[300px] flex justify-center items-center">
        <p className="text-red-600 font-semibold">
          😕 No products found with that search/filter.
        </p>
      </div>
    );
  } else if (Array.isArray(products)) {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {products.map((product: ProductI) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
    );
  }

  if (isMetaFetching || isMetaPending) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-600 animate-pulse text-center">
          Preparing product filters...
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

  return (
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-8">
      <div
        ref={typeRef}
        className="max-w-xl mx-auto flex gap-2 items-stretch relative"
      >
        <input
          type="text"
          value={type}
          onChange={(e) => {
            const value = e.target.value;
            setType(value);
            setSuggestionPrompt(value);
          }}
          placeholder="🔍 Search product type..."
          className="border border-zinc-300 text-zinc-500 placeholder-zinc-500 px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-red-600"
          onFocus={(e) => setSuggestionPrompt(e.target.value)}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition w-full sm:w-fit self-end"
        >
          Search
        </button>
        {/* 🔽 Suggestions dropdown */}
        {suggestionPrompt && suggestions && suggestions.length > 0 && (
          <div className="absolute top-[100%] left-0 w-full bg-white border border-zinc-300 rounded-md shadow-md z-10 mt-1">
            {(suggestions as string[]).map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onClick={() => {
                  setType(suggestion);
                  setSuggestionPrompt("");
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-100 text-zinc-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters Section */}
      {productMeta && (
        <div className="max-w-xl mx-auto flex flex-wrap gap-4 mt-6 p-4 border border-zinc-200 rounded-lg bg-white shadow-sm">
          {/* Brand Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Brand:
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">All Brands</option>
              {productMeta.brands?.map((opt: string) => (
                <option key={opt} value={opt} className="">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Source:
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full p-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">All Sources</option>
              {productMeta.sources?.map((opt: string) => (
                <option key={opt} value={opt} className="">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Location:
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">All Locations</option>
              {productMeta.locations?.flatMap(
                (optArr: string[], groupIndex: number) => {
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
                    <option key={opt} value={opt} className="">
                      {marker} {opt}
                    </option>
                  ));
                }
              )}
            </select>
          </div>
        </div>
      )}

      {/* Products Content */}
      <div className="mt-10">{content}</div>
    </div>
  );
};

export default Page;
