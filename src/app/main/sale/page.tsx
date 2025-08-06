"use client";

import { ProductCount } from "@/components/ProdCount";
import { Sale } from "@/Interfaces/Sale";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetSales, useRestockSaleMutation } from "@/query/sale";
import { useCartStore, useUpdatedSaleIdStore } from "@/store";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react"; // Import useRef and useState
import toast from "react-hot-toast";

const Page = () => {
  const t = useTranslations("ViewSalesPage");
  const {
    data: myPermissions,
    isFetching: isFetchingMyPermissions,
    isPending: isPendingMyPermissions,
  } = useGetMyPermissions();
  const [createdDate, setCreatedDate] = useState(new Date());
  const {
    data: sales,
    isPending: isPendingSales,
    isFetching: isFetchingSales,
    isError: isErrorSales,
  } = useGetSales({ createdDate });

  const { mutate: restockMutate } = useRestockSaleMutation();

  const router = useRouter();
  const { setUpdatedSaleId } = useUpdatedSaleIdStore();
  const { setCart, setBuyer } = useCartStore();

  // 🎯 New: Ref to store references to each sale card element
  const saleCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  // 🎯 New: State to control which sale card is highlighted
  const [highlightedSaleId, setHighlightedSaleId] = useState<string | null>(
    null
  );

  const handleUpdateClick = (sale: Sale) => {
    const prodsToRestock = sale.soldProducts.map((item) => ({
      _id: item.product._id,
      itemsToSell: item.itemsToSell,
    }));
    const typesOfRestockedProds = [
      ...new Set(
        sale.soldProducts.flatMap((soldProd) => soldProd.product.type)
      ),
    ];
    const prepUpdateSaleToast = toast.loading("Preparing update...");
    restockMutate(
      { prodsToRestock, typesOfRestockedProds },
      {
        onSuccess(data, variables, context) {
          toast.success("Ready to update", { id: prepUpdateSaleToast });
          setUpdatedSaleId(sale._id);
          setBuyer(sale.buyer ? sale.buyer._id : "");
          const cartProducts = sale.soldProducts.map((item) => ({
            product: {
              ...item.product,
              noOfItemsInStock:
                item.product.noOfItemsInStock + item.itemsToSell,
            },
            itemsToSell: item.itemsToSell,
          }));
          setCart(cartProducts);
          router.push(`/main/sale/create`);
        },
        onError(error, variables, context) {
          toast.error("failed to update the sale!", {
            id: prepUpdateSaleToast,
          });
        },
      }
    );
  };

  // 🎯 New: useEffect to handle scrolling and highlighting
  useEffect(() => {
    // Check if we are in the browser environment
    if (typeof window !== "undefined") {
      const hash = window.location.hash.substring(1); // Get the ID from the URL hash (e.g., #sale123 -> sale123)

      // Only proceed if there's a hash and sales data has loaded
      if (hash && sales && sales.length > 0) {
        const targetCard = saleCardRefs.current[hash];

        if (targetCard) {
          // Scroll the card into view
          targetCard.scrollIntoView({ behavior: "smooth", block: "center" });

          // Apply the highlight animation
          setHighlightedSaleId(hash);

          // Remove the highlight after a delay
          const timer = setTimeout(() => {
            setHighlightedSaleId(null);
            // Optionally, clear the hash from the URL to prevent re-scrolling on refresh
            router.replace(window.location.pathname, { scroll: false });
          }, 2500); // Highlight for 2.5 seconds

          return () => clearTimeout(timer); // Cleanup timeout on component unmount or re-run
        }
      }
    }
  }, [sales, router]); // Depend on sales data and router for hash changes

  if (isFetchingMyPermissions || isPendingMyPermissions) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-600 animate-pulse text-center">
          Checking permissions...
        </p>
      </div>
    );
  }

  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.SALE.PERMISSION_READ.name
    )
  ) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-red-600 text-center text-lg font-medium">
          You are not permitted to view{" "}
          {MODULES_AND_PERMISSIONS.SALE.PERMISSION_READ.displayName}.
        </p>
      </div>
    );
  }

  let content;
  if (isPendingSales || isFetchingSales) {
    content = (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-600 animate-pulse text-center">
          Loading sales...
        </p>
      </div>
    );
  } else if (isErrorSales) {
    content = (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-red-600 text-center font-medium">
          Error while loading sales...
        </p>
      </div>
    );
  } else if (sales.length <= 0) {
    content = (
      <p className="text-center text-zinc-500 mt-8">No sales recorded yet.</p>
    );
  } else {
    content = (
      <>
        <ProductCount showing={sales.length} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sales.map((sale) => (
            <div
              key={sale._id}
              ref={(el) => {
                saleCardRefs.current[sale._id] = el;
              }}
              className={`bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm
              ${
                highlightedSaleId === sale._id
                  ? "animate-highlight-pulse border-red-500 ring-4 ring-red-300"
                  : "hover:shadow-md transition"
              }
              flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <div className="text-sm text-zinc-500">
                  🗓️ {format(new Date(sale.createdAt), "dd MMM, HH:mm")}
                </div>
                <div className="text-sm text-zinc-600">
                  👤 {t("buyer")}: {sale.buyer?.username || "N/A"}
                </div>
                <div className="text-sm font-medium text-green-600">
                  💰 {t("total")}:{" "}
                  {sale.soldProducts.reduce(
                    (sum, sp) => sum + sp.itemsToSell * sp.sellingPrice,
                    0
                  )}{" "}
                  MMK
                </div>

                <div className="border-t pt-2 max-h-56 overflow-y-auto pr-1 space-y-2">
                  {sale.soldProducts.map((sp, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-50 p-2 rounded-md border border-zinc-200 text-sm flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-red-600">
                          {sp.product.type.join(", ")}
                        </div>
                        <div className="text-zinc-500 text-xs">
                          {sp.product.brand}
                        </div>
                        <div className="text-zinc-700 text-xs">
                          {sp.product.description}
                        </div>
                      </div>
                      <div className="text-red-600 font-medium ml-2">
                        {sp.itemsToSell} × {sp.sellingPrice} MMK
                      </div>
                    </div>
                  ))}
                </div>

                {hasPermission(
                  myPermissions!,
                  MODULES_AND_PERMISSIONS.SALE.PERMISSION_UPDATE.name
                ) && (
                  <button
                    onClick={() => handleUpdateClick(sale)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                  >
                    {t("updateSale")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-zinc-800">{t("sales")}</h2>
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <span>📅 {t("pickDate")}:</span>
          <input
            type="date"
            value={format(createdDate, "yyyy-MM-dd")}
            onChange={(e) => setCreatedDate(new Date(e.target.value))}
            className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </label>
      </div>

      {content}
    </section>
  );
};

export default Page;
