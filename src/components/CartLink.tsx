"use client";
import { useCartStore } from "@/store";
import Link from "next/link";

export default function CartLink() {
  const totalItems = useCartStore((state) => state.totalNoOfItems());

  return <Link href={"/main/product/checkout"}>cart: {totalItems}</Link>;
}
