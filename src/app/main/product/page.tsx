"use client";

import CartLink from "@/components/CartLink";
import BookmarkedProductsPopUp from "@/components/BookmarkedProductsPopUp";
import Link from "next/link";
import toast from "react-hot-toast";
import React, { useEffect, useRef, useState } from "react";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission, sortEnglishFirst } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetProductsByType, useGetSuggestions } from "@/query/product";
import { Product as ProductI } from "@/Interfaces/Product";
import Product from "@/components/Product";
import { useTranslations } from "next-intl";

const Page = () => {
  const t = useTranslations("BrowsePage");
  const [type, setType] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [suggestionPrompt, setSuggestionPrompt] = useState("");
  const [products, setProducts] = useState<ProductI[] | undefined>(undefined);
  // New state for filters
  const [filter, setFilter] = useState({
    brand: "all brands",
    description: "all descriptions",
  });

  const {
    data: myPermissions,
    isFetching: isFetchingMyPermissions,
    isPending: isPendingMyPermissions,
  } = useGetMyPermissions();

  const {
    data, // This 'data' now contains products, distinctBrands, distinctDescriptions
    isFetching: isFetchingProducts,
    isError: isErrorProducts,
    isPending: isPendingProducts,
  } = useGetProductsByType({ type: searchInput });

  const { data: suggestions } = useGetSuggestions({ type: suggestionPrompt });

  const typeRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (data?.products) {
      let filteredProducts = data.products;

      // Apply brand filter
      if (filter.brand !== "all brands") {
        filteredProducts = filteredProducts.filter(
          (product) => product.brand === filter.brand
        );
      }

      // Apply description filter
      if (filter.description !== "all descriptions") {
        filteredProducts = filteredProducts.filter(
          (product) => product.description === filter.description
        );
      }

      setProducts(filteredProducts);
    } else {
      setProducts(undefined); // Reset products if no data or data.products is empty/undefined
    }
  }, [data, filter]); // Re-run effect when data or filter changes

  // function handleSearch() {
  //   const trimmedType = type.trim();
  //   if (!trimmedType) {
  //     toast.error("Please enter a product type");
  //     return;
  //   }
  //   setSuggestionPrompt("");
  //   setSearchInput(trimmedType);
  //   // Reset filters when a new search is performed
  //   setFilter({ brand: "all brands", description: "all descriptions" });
  // }

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

  let content = null;

  if (isFetchingProducts) {
    // Check for undefined to differentiate initial state
    content = (
      <div className="min-h-[300px] flex justify-center items-center">
        <p className="text-zinc-500 animate-pulse">🔄 {t("searching")}...</p>
      </div>
    );
  } else if (isPendingProducts) {
    // This state indicates query is not yet started or has no data
    content = (
      <div className="min-h-[300px] flex justify-center items-center">
        <p className="text-zinc-500">🚀 {t("readyToSearch")}...</p>
      </div>
    );
  } else if (isErrorProducts) {
    content = (
      <div className="min-h-[300px] flex justify-center items-center">
        <p className="text-red-600 font-medium">
          ❌ Error fetching products. Please try again.
        </p>
      </div>
    );
  } else if (!products) {
    content = (
      <div className="min-h-[300px] flex justify-center items-center">
        <p className="text-zinc-500 animate-pulse">🔄 {t("searching")}...</p>
      </div>
    );
  } else if (products.length <= 0) {
    // Check filtered products length
    content = (
      <div className="min-h-[300px] flex justify-center items-center">
        <p className="text-red-600 font-semibold">
          😕 No products found with that type or matching filters.
        </p>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {products.map((product) => (
          <Product
            key={product._id}
            product={product}
            myPermissions={myPermissions}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-8">
      {/* 🔺 Top Actions Row */}
      <div className="flex justify-end gap-3 mb-8">
        <BookmarkedProductsPopUp myPermissions={myPermissions} />

        <Link
          href={"/main/product/search"}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition"
        >
          {t("search")}
        </Link>

        {hasPermission(
          myPermissions!,
          MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_CREATE.name
        ) && (
          <Link
            href={"/main/product/create"}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition"
          >
            {t("createProd")}
          </Link>
        )}

        {(hasPermission(
          myPermissions!,
          MODULES_AND_PERMISSIONS.SALE.PERMISSION_CREATE.name
        ) ||
          hasPermission(
            myPermissions!,
            MODULES_AND_PERMISSIONS.SALE.PERMISSION_UPDATE.name
          )) && <CartLink />}
      </div>

      {/* 🔍 Centered Search Form */}
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
          placeholder={`🔍 ${t("enterProdAType")}...`}
          className="border border-zinc-300 text-zinc-500 placeholder-zinc-500 px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-red-600"
          onFocus={(e) => setSuggestionPrompt(e.target.value)}
        />

        {/* 🔽 Suggestions dropdown */}
        {suggestionPrompt && suggestions && suggestions.length > 0 && (
          <div className="absolute top-[100%] left-0 w-full bg-white border border-zinc-300 rounded-md shadow-md z-10 mt-1">
            {(suggestions as string[]).map(
              (
                suggestion // <--- Type assertion here for safety
              ) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => {
                    setSearchInput(suggestion);
                    setType(suggestion);
                    setSuggestionPrompt("");
                    // Reset filters when a suggestion is clicked
                    setFilter({
                      brand: "all brands",
                      description: "all descriptions",
                    });
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-zinc-100 text-zinc-700"
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        )}

        {/* <button
          disabled={isFetchingProducts}
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition w-full sm:w-fit self-end"
        >
          Search
        </button> */}
      </div>

      {/* ⚙️ Filters Section */}
      {searchInput &&
        data &&
        (data.distinctBrands.length > 0 ||
          data.distinctDescriptions.length > 0) && (
          <div className="max-w-xl mx-auto  mt-6 p-4 border border-zinc-200 rounded-lg bg-white shadow-sm">
            <h1 className="text-zinc-700 mb-2 text-base">{t("filter")}</h1>
            <div className="flex flex-wrap gap-4">
              {data.distinctBrands.length > 0 && (
                <div className="flex-1 min-w-[150px]">
                  <label
                    htmlFor="brand-filter"
                    className="block text-sm font-medium text-zinc-700 mb-1"
                  >
                    {t("brand")}:
                  </label>
                  <select
                    id="brand-filter"
                    value={filter.brand}
                    onChange={(e) =>
                      setFilter({ ...filter, brand: e.target.value })
                    }
                    className="w-full p-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="all brands">All Brands</option>{" "}
                    {/* "nothing selected" option */}
                    {sortEnglishFirst(data.distinctBrands).map((brand) => (
                      <option key={brand} value={brand}>
                        {brand === "" ? "no brand" : brand}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {data.distinctDescriptions.length > 0 && (
                <div className="flex-1 min-w-[150px]">
                  <label
                    htmlFor="description-filter"
                    className="block text-sm font-medium text-zinc-700 mb-1"
                  >
                    {t("description")}:
                  </label>
                  <select
                    id="description-filter"
                    value={filter.description}
                    onChange={(e) =>
                      setFilter({ ...filter, description: e.target.value })
                    }
                    className="w-full p-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="all descriptions">All Descriptions</option>{" "}
                    {/* "nothing selected" option */}
                    {data.distinctDescriptions.map((description) => (
                      <option key={description} value={description}>
                        {description === "" ? "no description" : description}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

      {/* 📦 Products Content */}
      {Array.isArray(products) && (
        <div className="mb-4 text-red-500 font-medium text-right">
          Showing {products.length} product{products.length !== 1 ? "s" : ""}
        </div>
      )}
      <div className="mt-10">{content}</div>
    </div>
  );
};

export default Page;
