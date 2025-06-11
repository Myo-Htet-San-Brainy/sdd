import { Product as ProductI } from "@/Interfaces/Product";
import React from "react";

const Product = ({ product }: { product: ProductI }) => {
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
    </div>
  );
};

export default Product;
