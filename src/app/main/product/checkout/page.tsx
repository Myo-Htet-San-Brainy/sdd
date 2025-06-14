"use client";

import { useGetUsers } from "@/query/user";
import { useCartStore } from "@/store";
import { useState } from "react";

const Page = () => {
  const { cart } = useCartStore();
  const total = useCartStore((state) => state.totalPrice());
  const [buyer, setBuyer] = useState("");
  const {
    data: buyers,
    isError: isErrorBuyers,
    isFetching: isFetchingBuyers,
  } = useGetUsers({ role: "commissioner" });
  if (cart.length <= 0) {
    return <p>no items in cart yet!</p>;
  }
  if (isFetchingBuyers) {
    return <p>Preparing your sale</p>;
  }
  if (isErrorBuyers) {
    return <p>Error preping sale!</p>;
  }
  function handleSell() {
    if (buyer === "") {
      console.log({
        buyer: null,
        cart,
      });
    }
    console.log({
      buyer,
      cart,
    });
  }

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
      <div>
        <label>Buyer</label>
        <select
          value={buyer}
          onChange={(e) => setBuyer(e.currentTarget.value)}
          className="select"
        >
          <option value="">No buyer selected.</option>
          {buyers?.map((val) => {
            return (
              <option key={val._id} value={val._id}>
                {val.username}
              </option>
            );
          })}
        </select>
      </div>
      <button type="button" onClick={handleSell}>
        sell
      </button>
    </div>
  );
};

export default Page;
