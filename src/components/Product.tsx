import { Product as ProductI } from "@/Interfaces/Product";
import { isItemInList } from "@/lib/utils";
import { useBookmarkedProductsStore } from "@/store";
import React from "react";

const Product = ({ product }: { product: ProductI }) => {
  const { addToBookmark, removeFromBookmark, bookmarkedProducts } =
    useBookmarkedProductsStore();
  const isBookmarked = isItemInList(product, bookmarkedProducts);
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
    </div>
  );
};

export default Product;
