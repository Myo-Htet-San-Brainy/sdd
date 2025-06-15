import { Product as ProductI } from "@/Interfaces/Product";
import { isItemInList } from "@/lib/utils";
import { CartProduct, useBookmarkedProductsStore, useCartStore } from "@/store";
import Link from "next/link";
import React from "react";

const Product = ({ product }: { product: ProductI }) => {
  const { addToBookmark, removeFromBookmark, bookmarkedProducts } =
    useBookmarkedProductsStore();
  const isBookmarked = isItemInList(product, bookmarkedProducts);
  const { cart, addToCart, removeFromCart } = useCartStore();
  const products = cart.map((val) => val.product);
  const isInCart = isItemInList(product, products);
  const cartProduct = cart.find((val) => val.product._id === product._id);
  return (
    <div>
      <p>
        {product.type.map((type) => {
          return <i key={type}>{type}</i>;
        })}
      </p>
      <p>{product.description}</p>
      <p>{product.brand}</p>
      <p>{product.noOfItemsInStock}</p>
      <p>{product.sellingPrice}</p>
      <p>{product.location}</p>
      <div>
        {isBookmarked ? (
          <button onClick={() => removeFromBookmark(product._id)}>
            already bookmarked
          </button>
        ) : (
          <button onClick={() => addToBookmark(product)}>bookmark this</button>
        )}
      </div>
      <div>
        {isInCart ? (
          <div>
            <button onClick={() => removeFromCart(product._id)}>remove</button>
            <p>{(cartProduct as CartProduct).itemsToSell}</p>
            <button
              disabled={
                product.noOfItemsInStock <=
                (cartProduct as CartProduct).itemsToSell
              }
              onClick={() => addToCart(product)}
            >
              add
            </button>
          </div>
        ) : (
          <div>
            <button disabled>remove</button>
            <p>0</p>
            <button
              disabled={product.noOfItemsInStock <= 0}
              onClick={() => addToCart(product)}
            >
              add
            </button>
          </div>
        )}
      </div>
      <Link href={`/main/product/${product._id}`}>details</Link>
    </div>
  );
};

export default Product;
