"use client";
import AllowedPermissions from "@/components/AllowedPermissions";
import FallbackPermissions from "@/components/FallbackPermissions";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { CustomError } from "@/lib/CustomError";
import { hasAnyModulePermission, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetProductsByType } from "@/query/product";
import { useDeleteRoleMutation, useGetRoles } from "@/query/role";
import { useDeleteUserMutation, useGetUsers } from "@/query/user";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();
  const [type, setType] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const {
    data: products,
    isFetching: isFetchingProducts,
    isError: isErrorProducts,
    isPending: isPendingProducts,
  } = useGetProductsByType({ type: searchInput });

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
        onSubmit={(e) => {
          e.preventDefault();

          handleSearch(); // pass it to your handler or set it to state
        }}
        className="flex items-center gap-2 my-4"
      >
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Search by product type..."
          className="border px-4 py-2 rounded-md w-full max-w-xs"
        />
        <button
          disabled={isFetchingProducts}
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Search
        </button>
      </form>
      {content}
    </div>
  );
};

export default Page;
