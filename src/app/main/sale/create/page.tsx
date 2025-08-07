"use client";

import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import {
  useCreateSaleMutation,
  useDeleteSaleMutation,
  useUpdateSaleMutation,
} from "@/query/sale";
import { useGetUsers } from "@/query/user";
import { useCartStore, useUpdatedSaleIdStore } from "@/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast, { ToastIcon } from "react-hot-toast";
import { SubmitButton } from "@/components/SubmitButton";
import { useTranslations } from "next-intl";

const Page = () => {
  const t = useTranslations("createSalePage");
  const {
    data: myPermissions,
    isFetching: isFetchingMyPermissions,
    isPending: isPendingMyPermissions,
  } = useGetMyPermissions();
  const { cart, clearCart, buyer, setBuyer, addToCart, removeFromCart } =
    useCartStore();
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
  const { mutate: deleteSaleMutate, isPending: isDeleting } =
    useDeleteSaleMutation();
  const router = useRouter();

  function handleDeleteSale() {
    const toastId = toast.loading("Deleting the sale");
    deleteSaleMutate(
      { saleId: updatedSaleId as string },
      {
        onSuccess(data, variables, context) {
          toast.success("Deleted Sale Successfully", { id: toastId });
          clearCart();
          setBuyer("");
          router.push("/main/product");
          setUpdatedSaleId(null);
        },
        onError(error, variables, context) {
          toast.error("Deleting Sale Failed!", { id: toastId });
        },
      }
    );
  }

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

  if (cart.length <= 0 && updatedSaleId) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center bg-zinc-100">
        <p className="text-zinc-600 text-lg mb-4">
          {t("noItemsLeftForThisSale")}
        </p>
        <button
          onClick={handleDeleteSale}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
        >
          {t("removeSale")}
        </button>
      </div>
    );
  }

  if (cart.length <= 0) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-100">
        <p className="text-zinc-600 text-lg">{t("noItemsInCart")}!</p>
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

  function handleCreateOrUpdateSale() {
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
        toast.success(
          updatedSaleId
            ? `${t("saleUpdatedToastMsg")}!`
            : `${t("saleCreatedToastMsg")}!`
        );
        router.push("/main/product");
        clearCart();
        setBuyer("");
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

  function handleClearCart() {
    clearCart();
    toast.success(t("cartClearToastMsg"));
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-zinc-200 shadow-md rounded-2xl p-6 space-y-6">
        <h1 className="text-xl font-semibold text-red-600 border-b pb-2">
          {t("sale")}
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
                {t("priceForThisElement")}: {val.product.sellingPrice} ×{" "}
                {val.itemsToSell} = {val.product.sellingPrice * val.itemsToSell}
              </div>

              {/* Added Cart Controls */}
              <div className="flex items-center justify-between border-t pt-3 mt-3">
                <button
                  onClick={() => removeFromCart(val.product._id)}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                >
                  -
                </button>
                <p className="text-sm text-zinc-700 font-medium">
                  {val.itemsToSell}
                </p>
                <button
                  disabled={val.product.noOfItemsInStock <= val.itemsToSell}
                  onClick={() => addToCart(val.product)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    val.product.noOfItemsInStock <= val.itemsToSell
                      ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <p className="text-right text-lg font-semibold text-zinc-800">
            {t("totalPrice")}: {total}
          </p>
        </div>

        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            {t("selectBuyer")}
          </label>
          <select
            value={buyer}
            onChange={(e) => setBuyer(e.currentTarget.value)}
            className="w-full text-zinc-800 border border-zinc-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">{t("noBuyerSelected")}</option>
            {buyers?.map((val) => (
              <option key={val._id} value={val._id}>
                {val.username}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <button
            onClick={handleClearCart}
            className="px-6 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors"
          >
            {t("clearCart")}
          </button>
          <SubmitButton
            isLoading={isCreating || isUpdating}
            onClick={handleCreateOrUpdateSale}
          >
            {updatedSaleId ? t("update") : t("sell")}
          </SubmitButton>
        </div>
      </div>
    </div>
  );
};

export default Page;
