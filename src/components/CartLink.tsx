"use client";
import { useCartStore } from "@/store";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CartLink() {
  const t = useTranslations("BrowsePage");

  const totalItems = useCartStore((state) => state.totalNoOfItems());

  return (
    <Link
      href="/main/sale/create"
      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow transition"
    >
      <ShoppingCart className="w-5 h-5" />
      {t("cart")}: <span>{totalItems}</span>
    </Link>
  );
}
