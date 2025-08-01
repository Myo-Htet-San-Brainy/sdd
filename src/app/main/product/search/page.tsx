"use client";

import React, { useState, useRef, useEffect } from "react";
import { useGetSuggestions, useGetProductMeta } from "@/query/product";
import { getProducts } from "@/services/product";
import Product from "@/components/Product";
import { Product as ProductI } from "@/Interfaces/Product";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { hasPermission, sortEnglishFirst } from "@/lib/utils";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import Pagination from "@/components/Pagination";
import { ProductCount } from "@/components/ProdCount";

const Page = () => {
  const {
    data: myPermissions,
    isFetching: isFetchingMyPermissions,
    isPending: isPendingMyPermissions,
  } = useGetMyPermissions();
  const [type, setType] = useState("");
  const [suggestionPrompt, setSuggestionPrompt] = useState("");
  const [brand, setBrand] = useState("all brands");
  const [source, setSource] = useState("all sources");
  const [location, setLocation] = useState("all locations");
  const [products, setProducts] = useState<ProductI[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const typeRef = useRef<HTMLDivElement | null>(null);
  const [stockFilterEnabled, setStockFilterEnabled] = useState(false);
  const [stockCondition, setStockCondition] = useState<
    "exact" | "greater" | "less"
  >("exact");
  const [stockValue, setStockValue] = useState<number>(0);
  const [buyingPriceFilterEnabled, setBuyingPriceFilterEnabled] =
    useState(false);
  const [buyingPriceCondition, setBuyingPriceCondition] = useState<
    "exact" | "greater" | "less"
  >("exact");
  const [buyingPriceValue, setBuyingPriceValue] = useState<number>(0);
  const [sellingPriceFilterEnabled, setSellingPriceFilterEnabled] =
    useState(false);
  const [sellingPriceCondition, setSellingPriceCondition] = useState<
    "exact" | "greater" | "less"
  >("exact");
  const [sellingPriceValue, setSellingPriceValue] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { data: suggestions } = useGetSuggestions({ type: suggestionPrompt });
  const {
    data: productMeta,
    isFetching: isMetaFetching,
    isPending: isMetaPending,
    isError: isMetaError,
  } = useGetProductMeta({ brand: true, source: true, location: true });

  // ✅ the handle for sorting
  const handleSort = (value: string) => {
    if (!products || products.length <= 0) return;

    function getCreatedTime(prod: ProductI) {
      if (prod._id && typeof prod._id === "string" && prod._id.length === 24) {
        const timestampHex = prod._id.substring(0, 8);
        return parseInt(timestampHex, 16) * 1000;
      }
      return 0;
    }
    function getLastUpdated(prod: ProductI) {
      if (prod.lastUpdated) {
        return new Date(prod.lastUpdated).getTime();
      }
      return 0;
    }

    let sorted = [...products];
    if (value === "createdTime-recent") {
      sorted.sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
    } else if (value === "createdTime-old") {
      sorted.sort((a, b) => getCreatedTime(a) - getCreatedTime(b));
    } else if (value === "lastUpdated-recent") {
      sorted.sort((a, b) => getLastUpdated(b) - getLastUpdated(a));
    } else if (value === "lastUpdated-old") {
      sorted.sort((a, b) => getLastUpdated(a) - getLastUpdated(b));
    }
    setProducts(sorted);
  };

  //adding listeners
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

  // // When filters change, reset to page 1
  // useEffect(() => {
  //   setPage(1);
  // }, [
  //   type,
  //   brand,
  //   source,
  //   location,
  //   stockFilterEnabled,
  //   stockCondition,
  //   stockValue,
  //   buyingPriceFilterEnabled,
  //   buyingPriceCondition,
  //   buyingPriceValue,
  //   sellingPriceFilterEnabled,
  //   sellingPriceCondition,
  //   sellingPriceValue,
  // ]);
  // // Fetch products when page or limit changes
  // useEffect(() => {
  //   handleSearch();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [page, limit]);

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

  const handleSearch = async (pageOverride?: number) => {
    setIsLoading(true);
    setError("");
    setProducts(undefined);
    try {
      const filterObj: Record<string, any> = {};
      if (type.trim() !== "") filterObj["type"] = type.trim();
      if (brand.trim() !== "all brands") filterObj["brand"] = brand.trim();
      if (source.trim() !== "all sources") filterObj["source"] = source.trim();
      if (location.trim() !== "all locations")
        filterObj["location"] = location.trim();
      if (stockFilterEnabled) {
        filterObj["noOfItemsInStock"] = JSON.stringify({
          val: stockValue,
          condition: stockCondition,
        });
      }
      if (buyingPriceFilterEnabled) {
        filterObj["buyingPrice"] = JSON.stringify({
          val: buyingPriceValue,
          condition: buyingPriceCondition,
        });
      }
      if (sellingPriceFilterEnabled) {
        filterObj["sellingPrice"] = JSON.stringify({
          val: sellingPriceValue,
          condition: sellingPriceCondition,
        });
      }
      // Add pagination params
      const pageToFetch = pageOverride || 1;
      filterObj["page"] = pageToFetch;
      filterObj["limit"] = limit;
      // console.log("filterObj", filterObj);
      const res = await getProducts(filterObj);
      setProducts(res.products);
      setPage(res.page || 1);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
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
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map((product: ProductI) => (
            <Product key={product._id} product={product} />
          ))}
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => {
            setPage(newPage);
            handleSearch(newPage);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-8">
      {/* Type */}
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
          onClick={() => handleSearch()}
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
              <option value="all brands">All Brands</option>
              {sortEnglishFirst(productMeta.brands as string[]).map(
                (opt: string) => (
                  <option key={opt} value={opt} className="">
                    {opt === "" ? "no brand" : opt}
                  </option>
                )
              )}
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
              <option value="all sources">All Sources</option>
              {sortEnglishFirst(productMeta.sources as string[]).map(
                (opt: string) => (
                  <option key={opt} value={opt} className="">
                    {opt}
                  </option>
                )
              )}
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
              <option value="all locations">All Locations</option>
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
          {/* Stock Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              <input
                type="checkbox"
                checked={stockFilterEnabled}
                onChange={(e) => setStockFilterEnabled(e.target.checked)}
                className="mr-2"
              />
              Filter by Stock
            </label>
            {stockFilterEnabled && (
              <div className="flex gap-2 mt-1">
                <select
                  value={stockCondition}
                  onChange={(e) =>
                    setStockCondition(
                      e.target.value as "exact" | "greater" | "less"
                    )
                  }
                  className="p-2 border border-zinc-300 rounded-md text-black"
                >
                  <option value="exact">Exact</option>
                  <option value="greater">Greater than</option>
                  <option value="less">Less than</option>
                </select>
                <input
                  type="number"
                  value={stockValue}
                  onChange={(e) => setStockValue(Number(e.target.value))}
                  className="p-2 border border-zinc-300 rounded-md w-20 text-black"
                  min={0}
                />
              </div>
            )}
          </div>
          {/* Buying Price Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              <input
                type="checkbox"
                checked={buyingPriceFilterEnabled}
                onChange={(e) => setBuyingPriceFilterEnabled(e.target.checked)}
                className="mr-2"
              />
              Filter by Buying Price
            </label>
            {buyingPriceFilterEnabled && (
              <div className="flex gap-2 mt-1">
                <select
                  value={buyingPriceCondition}
                  onChange={(e) =>
                    setBuyingPriceCondition(
                      e.target.value as "exact" | "greater" | "less"
                    )
                  }
                  className="p-2 border border-zinc-300 rounded-md text-black"
                >
                  <option value="exact">Exact</option>
                  <option value="greater">Greater than</option>
                  <option value="less">Less than</option>
                </select>
                <input
                  type="number"
                  value={buyingPriceValue}
                  onChange={(e) => setBuyingPriceValue(Number(e.target.value))}
                  className="p-2 border border-zinc-300 rounded-md w-20 text-black"
                  min={0}
                />
              </div>
            )}
          </div>
          {/* Selling Price Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              <input
                type="checkbox"
                checked={sellingPriceFilterEnabled}
                onChange={(e) => setSellingPriceFilterEnabled(e.target.checked)}
                className="mr-2"
              />
              Filter by Selling Price
            </label>
            {sellingPriceFilterEnabled && (
              <div className="flex gap-2 mt-1">
                <select
                  value={sellingPriceCondition}
                  onChange={(e) =>
                    setSellingPriceCondition(
                      e.target.value as "exact" | "greater" | "less"
                    )
                  }
                  className="p-2 border border-zinc-300 rounded-md text-black"
                >
                  <option value="exact">Exact</option>
                  <option value="greater">Greater than</option>
                  <option value="less">Less than</option>
                </select>
                <input
                  type="number"
                  value={sellingPriceValue}
                  onChange={(e) => setSellingPriceValue(Number(e.target.value))}
                  className="p-2 border border-zinc-300 rounded-md w-20 text-black"
                  min={0}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sorting */}
      {/* Sorting — uncontrolled select, disabled if products undefined or empty */}
      <div className="flex justify-end mb-2">
        <label className="text-sm text-zinc-700 mr-2">Order by:</label>
        <select
          onChange={(e) => handleSort(e.target.value)}
          disabled={!products || products.length === 0}
          className="p-2 border border-zinc-300 rounded-md text-black"
          style={{ minWidth: 180 }}
        >
          <option value="">Nothing (default)</option>
          <option value="createdTime-recent">
            Created Time: Recent to Old
          </option>
          <option value="createdTime-old">Created Time: Old to Recent</option>
          <option value="lastUpdated-recent">
            Last Updated: Recent to Old
          </option>
          <option value="lastUpdated-old">Last Updated: Old to Recent</option>
        </select>
      </div>

      {/* Total data */}
      {Array.isArray(products) && (
        <ProductCount showing={products.length} total={total} />
      )}
      <div className="mt-10">{content}</div>
    </div>
  );
};

export default Page;
