"use client";

import AllowedPermissions from "@/components/AllowedPermissions";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useCreateSaleMutation, useUpdateSaleMutation } from "@/query/sale";
import { useGetUsers } from "@/query/user";
import { useCartStore, useUpdatedSaleIdStore } from "@/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { SubmitButton } from "@/components/SubmitButton";

const Page = () => {
  const {
    data: myPermissions,
    isFetching: isFetchingMyPermissions,
    isPending: isPendingMyPermissions,
  } = useGetMyPermissions();
  const { cart, clearCart, buyer, setBuyer } = useCartStore();
  const { updatedSaleId, setUpdatedSaleId } = useUpdatedSaleIdStore();
  const total = useCartStore((state) => state.totalPrice());

  const {
    data: buyers,
    isError: isErrorBuyers,
    isFetching: isFetchingBuyers,
    isPending: isPendingBuyers,
  } = useGetUsers({ role: "commissioner" });
  const { mutate: createSaleMutate, isPending: isCreating } =
    useCreateSaleMutation();
  const { mutate: updateSaleMutate, isPending: isUpdating } =
    useUpdateSaleMutation();
  const router = useRouter();

  if (isFetchingMyPermissions || isPendingMyPermissions) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-100">
        <p className="text-red-600 text-lg font-medium">
          Checking permission...
        </p>
      </div>
    );
  }

  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.SALE.PERMISSION_CREATE.name
    )
  ) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-100">
        <p className="text-red-600 text-lg font-medium text-center">
          You are not permitted to create sale.
        </p>
      </div>
    );
  }

  if (cart.length <= 0) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-100">
        <p className="text-zinc-600 text-lg">No items in cart yet!</p>
      </div>
    );
  }

  if (isFetchingBuyers || isPendingBuyers) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-100">
        <p className="text-zinc-600 text-lg">Preparing your sale...</p>
      </div>
    );
  }

  if (isErrorBuyers) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-100">
        <p className="text-red-600 text-lg">Error preparing sale!</p>
      </div>
    );
  }

  function handleSell() {
    const b = buyer === "" ? null : buyer;
    const soldProducts = cart.map(({ product, itemsToSell }) => ({
      _id: product._id,
      itemsToSell,
      sellingPrice: product.sellingPrice,
    }));

    const soldProductsTypes = [
      ...new Set(cart.flatMap(({ product }) => product.type)),
    ];

    const commonOptions = {
      onSuccess: () => {
        toast.success(updatedSaleId ? "Updated sale!" : "Created sale!");
        router.push("/main/product");
        clearCart();
        setUpdatedSaleId(null);
      },
      onError: () => {
        toast.error("Something went wrong while processing sale!");
      },
    };

    if (updatedSaleId) {
      updateSaleMutate(
        { saleId: updatedSaleId, salePayload: { soldProducts, buyer: b } },
        commonOptions
      );
    } else {
      createSaleMutate(
        { payload: { soldProducts, buyer: b }, soldProductsTypes },
        commonOptions
      );
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-zinc-200 shadow-md rounded-2xl p-6 space-y-6">
        <h1 className="text-xl font-semibold text-red-600 border-b pb-2">
          Confirm Sale
        </h1>

        <div className="space-y-4">
          {cart.map((val) => (
            <div
              key={val.product._id}
              className="p-3 rounded border border-zinc-200 bg-zinc-50"
            >
              <div className="flex flex-wrap gap-2 text-sm text-zinc-600">
                {val.product.type.map((typeVal) => (
                  <span
                    key={typeVal}
                    className="bg-red-200 px-2 py-0.5 rounded"
                  >
                    {typeVal}
                  </span>
                ))}
              </div>
              {val.product.description && (
                <div className="mt-2 text-zinc-800 font-medium">
                  {val.product.description}
                </div>
              )}
              <div className="text-sm text-zinc-500">{val.product.brand}</div>
              <div className="text-sm text-zinc-700">
                Price: {val.product.sellingPrice} × {val.itemsToSell} ={" "}
                {val.product.sellingPrice * val.itemsToSell}
              </div>
            </div>
          ))}
          <p className="text-right text-lg font-semibold text-zinc-800">
            Total: {total}
          </p>
        </div>

        <div>
          <label className="block font-medium text-zinc-700 mb-1">Buyer</label>
          <select
            value={buyer}
            onChange={(e) => setBuyer(e.currentTarget.value)}
            className="w-full text-zinc-800 border border-zinc-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">No buyer selected</option>
            {buyers?.map((val) => (
              <option key={val._id} value={val._id}>
                {val.username}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4">
          <SubmitButton
            isLoading={isCreating || isUpdating}
            onClick={handleSell}
          >
            Sell
          </SubmitButton>
        </div>
      </div>
    </div>
  );
};

export default Page;
