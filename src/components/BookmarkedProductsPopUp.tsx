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
          <div className="w-[400px] h-full">
            {bookmarkedProducts.length <= 0 ? (
              <div className=" h-full grid place-items-center text-red-600">
                No Bookmarked Products...
              </div>
            ) : (
              <div className="p-2 h-full flex flex-col">
                <div className="flex justify-between p-2">
                  <h1 className="text-red-600">Bookmarked Products</h1>
                  <button
                    className="text-red-600"
                    onClick={() => setIsOpenBookmarkedProductsPopUp(false)}
                  >
                    close
                  </button>
                </div>
                <div className="grow overflow-y-scroll flex flex-col gap-2">
                  {bookmarkedProducts.map((product) => {
                    return (
                      <Product
                        key={product._id}
                        product={product}
                        myPermissions={myPermissions}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
