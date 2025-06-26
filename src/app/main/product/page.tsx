"use client";

import Product from "@/components/Product";
import CartLink from "@/components/CartLink";
import BookmarkedProductsPopUp from "@/components/BookmarkedProductsPopUp";
import Link from "next/link";
import toast from "react-hot-toast";
import React, { useEffect, useRef, useState } from "react";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetProductsByType, useGetSuggestions } from "@/query/product";
import { useCartStore } from "@/store";

const Page = () => {
  const [type, setType] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [suggestionPrompt, setSuggestionPrompt] = useState("");

  const {
    data: myPermissions,
    isFetching: isFetchingMyPermissions,
    isPending: isPendingMyPermissions,
  } = useGetMyPermissions();

  const {
    data: products,
    isFetching: isFetchingProducts,
    isError: isErrorProducts,
    isPending: isPendingProducts,
  } = useGetProductsByType({ type: searchInput });

  const { data: suggestions } = useGetSuggestions({ type: suggestionPrompt });

  const formRef = useRef<HTMLFormElement | null>(null);

  const { cart } = useCartStore(); // may be used elsewhere

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setSuggestionPrompt("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSearch() {
    const trimmedType = type.trim();
    if (!trimmedType) {
      toast.error("Please enter a product type");
      return;
    }
    setSuggestionPrompt("");
    setSearchInput(trimmedType);
  }

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
    content = (
      <div className="min-h-[300px] flex justify-center items-center">
        <p className="text-zinc-500 animate-pulse">🔄 Fetching products...</p>
      </div>
    );
  } else if (isPendingProducts) {
    content = (
      <div className="min-h-[300px] flex justify-center items-center">
        <p className="text-zinc-500">🚀 Ready To Fetch...</p>
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
  } else if (products?.length <= 0) {
    content = (
      <div className="min-h-[300px] flex justify-center items-center">
        <p className="text-red-600 font-semibold">
          😕 No products found with that type.
        </p>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-6 gap-4">
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

        {hasPermission(
          myPermissions!,
          MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_CREATE.name
        ) && (
          <Link
            href={MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_CREATE.link}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition"
          >
            {MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_CREATE.displayName}
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
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
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

        {/* 🔽 Suggestions dropdown */}
        {suggestions && suggestions.length > 0 && (
          <div className="absolute top-[100%] left-0 w-full bg-white border border-zinc-300 rounded-md shadow-md z-10 mt-1">
            {(suggestions as string[]).map(
              (
                suggestion // <--- Add the type assertion here
              ) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => {
                    setSearchInput(suggestion);
                    setType(suggestion);
                    setSuggestionPrompt("");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-zinc-100 text-zinc-700"
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        )}

        <button
          disabled={isFetchingProducts}
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition w-full sm:w-fit self-end"
        >
          Search
        </button>
      </form>

      {/* 📦 Products Content */}
      <div className="mt-10">{content}</div>
    </div>
  );
};

export default Page;
