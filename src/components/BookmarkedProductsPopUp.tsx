"use client";

import { useBookmarkedProductsStore, usePopUpsStore } from "@/store";
import Product from "./Product";
import {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/BuildingBlocks/Drawer";
import React from "react";

const BookmarkedProductsPopUp = ({
  myPermissions,
}: {
  myPermissions?: string[];
}) => {
  const { bookmarkedProducts } = useBookmarkedProductsStore();
  const { isOpenBookmarkedProductsPopUp, setIsOpenBookmarkedProductsPopUp } =
    usePopUpsStore();

  return (
    <>
      <Drawer
        direction="left"
        open={isOpenBookmarkedProductsPopUp}
        onOpenChange={(newState) => setIsOpenBookmarkedProductsPopUp(newState)}
      >
        <DrawerContent>
          {bookmarkedProducts.length <= 0 ? (
            <div className="w-[400px] h-full grid place-items-center">
              No Bookmarked Products...
            </div>
          ) : (
            <DrawerHeader className="w-[400px]">
              <DrawerTitle className="flex justify-between">
                <h1>Bookmarked Products</h1>
                <DrawerClose>close</DrawerClose>
              </DrawerTitle>
              <DrawerDescription className="">
                {bookmarkedProducts.map((product) => {
                  return (
                    <Product
                      key={product._id}
                      product={product}
                      myPermissions={myPermissions}
                    />
                  );
                })}
              </DrawerDescription>
            </DrawerHeader>
          )}
        </DrawerContent>
      </Drawer>
      <button
        onClick={() => setIsOpenBookmarkedProductsPopUp(true)}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
      >
        Open Bookmarks
      </button>
    </>
  );
};

export default BookmarkedProductsPopUp;
