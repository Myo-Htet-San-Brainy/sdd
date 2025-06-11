"use client";

import { useBookmarkedProductsStore, usePopUpsStore } from "@/store";
import Product from "./Product";

const BookmarkedProductsPopUp = () => {
  const { bookmarkedProducts } = useBookmarkedProductsStore();
  const { isOpenBookmarkedProductsPopUp, setIsOpenBookmarkedProductsPopUp } =
    usePopUpsStore();

  return (
    isOpenBookmarkedProductsPopUp && (
      <div>
        <button onClick={() => setIsOpenBookmarkedProductsPopUp(false)}>
          close
        </button>
        {bookmarkedProducts.map((product) => {
          return <Product key={product._id} product={product} />;
        })}
      </div>
    )
  );
};

export default BookmarkedProductsPopUp;
