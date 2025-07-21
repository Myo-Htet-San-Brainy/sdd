import { Product as ProductI } from "@/Interfaces/Product";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission, isItemInList } from "@/lib/utils";
import { CartProduct, useBookmarkedProductsStore, useCartStore } from "@/store";
import Link from "next/link";
import React from "react";

const Product = ({
  product,
  myPermissions,
}: {
  product: ProductI;
  myPermissions?: string[];
}) => {
  const { addToBookmark, removeFromBookmark, bookmarkedProducts } =
    useBookmarkedProductsStore();
  const isBookmarked = isItemInList(product, bookmarkedProducts);
  const { cart, addToCart, removeFromCart } = useCartStore();
  const products = cart.map((val) => val.product);
  const isInCart = isItemInList(product, products);
  const cartProduct = cart.find((val) => val.product._id === product._id);

  return (
    <div className="border border-zinc-300 bg-white p-4 rounded-xl shadow hover:shadow-md transition space-y-3">
      {/* Product Type (Top & Bold) */}
      <div className="flex flex-wrap gap-2 mb-1">
        {product.type.map((type) => (
          <span
            key={type}
            className="text-base font-bold bg-red-100 text-red-700 px-3 py-1 rounded-lg"
          >
            {type}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-zinc-800 font-semibold text-lg">
        {product.description}
      </p>

      {/* Brand */}
      <p className="text-zinc-600 italic">{product.brand}</p>

      {/* Product Info */}
      <div className="text-sm text-zinc-600 space-y-1 mt-2">
        <p>
          <span className="font-medium">Stock:</span> {product.noOfItemsInStock}
        </p>
        <p>
          <span className="font-medium">Price:</span>{" "}
          {product.sellingPrice.toLocaleString()} MMK
        </p>
        <p>
          <span className="font-medium">Location:</span> {product.location}
        </p>
      </div>

      {/* Cart Controls */}
      {(myPermissions &&
        hasPermission(
          myPermissions,
          MODULES_AND_PERMISSIONS.SALE.PERMISSION_CREATE.name
        )) ||
      (myPermissions &&
        hasPermission(
          myPermissions,
          MODULES_AND_PERMISSIONS.SALE.PERMISSION_UPDATE.name
        )) ? (
        <div className="flex items-center justify-between border-t pt-3">
          {isInCart ? (
            <>
              <button
                onClick={() => removeFromCart(product._id)}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
              >
                -
              </button>
              <p className="text-sm text-zinc-700 font-medium">
                {(cartProduct as CartProduct).itemsToSell}
              </p>
              <button
                disabled={
                  product.noOfItemsInStock <=
                  (cartProduct as CartProduct).itemsToSell
                }
                onClick={() => addToCart(product)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  product.noOfItemsInStock <=
                  (cartProduct as CartProduct).itemsToSell
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                +
              </button>
            </>
          ) : (
            <>
              <button
                disabled
                className="px-3 py-1 bg-zinc-200 text-zinc-400 rounded-md cursor-not-allowed"
              >
                -
              </button>
              <p className="text-sm text-zinc-700 font-medium">0</p>
              <button
                disabled={product.noOfItemsInStock <= 0}
                onClick={() => addToCart(product)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  product.noOfItemsInStock <= 0
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                +
              </button>
            </>
          )}
        </div>
      ) : null}

      {/* Details Link */}
      <div className="pt-2 flex justify-between">
        <Link
          href={{
            pathname: `/main/product/${product._id}`,
            query: {
              type: JSON.stringify(product.type),
            },
          }}
          className="inline-block text-sm text-red-600 hover:underline"
        >
          View Details →
        </Link>
        {/* Bookmark */}
        <button
          onClick={() =>
            isBookmarked
              ? removeFromBookmark(product._id)
              : addToBookmark(product)
          }
          className={`text-sm px-3 py-1 rounded-md transition ${
            isBookmarked
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          {isBookmarked ? "💖 Bookmarked" : "🤍 Bookmark"}
        </button>
      </div>
    </div>
  );
};

export default Product;
