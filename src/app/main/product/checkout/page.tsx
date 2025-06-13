"use client";

import { useCartStore } from "@/store";

const Page = () => {
  const { cart } = useCartStore();
  const total = useCartStore((state) => state.totalPrice());
  return (
    <div>
      <div>
        {cart.map((val) => {
          return (
            <div key={val.product._id}>
              <div>
                {val.product.type.map((typeVal) => (
                  <p key={typeVal}>{typeVal}</p>
                ))}
              </div>
              <div>{val.product.description}</div>
              <div>{val.product.brand}</div>
              <div>{val.product.sellingPrice}</div>
              <div>{val.product.sellingPrice * val.itemsToSell}</div>
            </div>
          );
        })}
        <p>{total}</p>
      </div>
      <div>{/* select  */}</div>
    </div>
  );
};

export default Page;
