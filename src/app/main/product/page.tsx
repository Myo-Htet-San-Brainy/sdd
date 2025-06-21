"use client";
import AllowedPermissions from "@/components/AllowedPermissions";
import BookmarkedProductsPopUp from "@/components/BookmarkedProductsPopUp";
import CartLink from "@/components/CartLink";
import FallbackPermissions from "@/components/FallbackPermissions";
import Product from "@/components/Product";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { CustomError } from "@/lib/CustomError";
import { hasAnyModulePermission, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetProductsByType, useGetSuggestions } from "@/query/product";
import { useDeleteRoleMutation, useGetRoles } from "@/query/role";
import { useDeleteUserMutation, useGetUsers } from "@/query/user";
import {
  useBookmarkedProductsStore,
  useCartStore,
  usePopUpsStore,
} from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const {
    data: myPermissions,
    isFetching: isFetchingMyPermissions,
    isPending: isPendingMyPermissions,
  } = useGetMyPermissions();
  const [type, setType] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [suggestionPrompt, setSuggestionPrompt] = useState("");
  const {
    data: products,
    isFetching: isFetchingProducts,
    isError: isErrorProducts,
    isPending: isPendingProducts,
  } = useGetProductsByType({ type: searchInput });
  const formRef: React.RefObject<HTMLFormElement | null> = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click occurred outside the form
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setSuggestionPrompt("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: suggestions } = useGetSuggestions({ type: suggestionPrompt });
  const { cart } = useCartStore();

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

  let content;
  // console.log(isPendingProducts);
  // console.log(isFetchingProducts);
  // console.log(isErrorProducts);

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
  } else {
    if (products.length <= 0) {
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
  }

  function handleSearch() {
    const trimmedType = type.trim();
    if (!trimmedType) {
      toast.error("Please enter a product type");
      return;
    }
    setSuggestionPrompt("");
    setSearchInput(trimmedType);
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
        className="max-w-xl mx-auto flex  gap-2 items-stretch relative"
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

        {/* 🔽 Suggestions dropdown like YouTube */}
        {suggestions && suggestions.length > 0 && (
          <div className="absolute top-[100%] left-0 w-full bg-white border border-zinc-300 rounded-md shadow-md z-10 mt-1">
            {suggestions.map((suggestion) => (
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
            ))}
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

      {/* 📦 Content */}
      <div className="mt-10">{content}</div>
    </div>
  );
};

export default Page;
