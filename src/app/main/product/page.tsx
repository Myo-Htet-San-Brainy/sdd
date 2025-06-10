"use client";
import AllowedPermissions from "@/components/AllowedPermissions";
import FallbackPermissions from "@/components/FallbackPermissions";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { CustomError } from "@/lib/CustomError";
import { hasAnyModulePermission, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetProductsByType, useGetSuggestions } from "@/query/product";
import { useDeleteRoleMutation, useGetRoles } from "@/query/role";
import { useDeleteUserMutation, useGetUsers } from "@/query/user";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();
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

  if (isFetchingMyPermissions) {
    return <div>checking permission...</div>;
  }
  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.PRODUCT.PERMISSION_READ.name
    )
  ) {
    return (
      <AllowedPermissions
        actionNotPermitted={MODULES_AND_PERMISSIONS.PRODUCT.displayName}
        myPermissions={myPermissions!}
      />
    );
  }

  let content;
  // console.log(isPendingProducts);
  // console.log(isFetchingProducts);
  // console.log(isErrorProducts);

  if (isFetchingProducts) {
    content = <p>fetching...</p>;
  } else if (isPendingProducts) {
    content = <p>start</p>;
  }

  if (isErrorProducts) {
    content = <p>error getting products with such type</p>;
  } else if (products) {
    if (products.length <= 0) {
      content = <p>no products with such type</p>;
    } else {
      content = <p>products</p>;
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
    <div>
      {hasPermission(
        myPermissions!,
        MODULES_AND_PERMISSIONS.USER.PERMISSION_CREATE.name
      ) && (
        <Link href={MODULES_AND_PERMISSIONS.USER.PERMISSION_CREATE.link}>
          {MODULES_AND_PERMISSIONS.USER.PERMISSION_CREATE.displayName}
        </Link>
      )}
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(); // pass it to your handler or set it to state
        }}
        className="flex items-center gap-2 my-4"
      >
        <input
          type="text"
          value={type}
          onChange={(e) => {
            const value = e.target.value;
            setType(value);
            setSuggestionPrompt(value);
          }}
          placeholder="Search by product type..."
          className="border px-4 py-2 rounded-md w-full max-w-xs"
          onFocus={(e) => {
            const currentValue = e.target.value;
            setSuggestionPrompt(currentValue);
          }}
        />
        <button
          disabled={isFetchingProducts}
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Search
        </button>
        <div>
          {suggestions?.map((suggestion) => {
            return (
              <button
                key={suggestion}
                onClick={(e) => {
                  setSearchInput(suggestion);
                  setType(suggestion);
                  setSuggestionPrompt("");
                }}
              >
                {suggestion}
              </button>
            );
          })}
        </div>
      </form>

      {content}
    </div>
  );
};

export default Page;
