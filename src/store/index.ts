import { Product } from "@/Interfaces/Product";
import { create } from "zustand";

interface PopUpsStore {
  isOpenGlobalNavbar: boolean;
  setIsOpenGlobalNavbar: (newState: boolean) => void;
}

export const usePopUpsStore = create<PopUpsStore>()((set) => ({
  isOpenGlobalNavbar: false,
  setIsOpenGlobalNavbar: (newState) => {
    set((prev) => {
      return { ...prev, isOpenGlobalNavbar: newState };
    });
  },
}));

interface BookMarkedProductsStore {
  bookmarkedProducts: Product[];
  addToBookmark: (newProduct: Product) => void;
  removeFromBookmark: (productId: string) => void;
}

export const useBookmarkedProductsStore = create<BookMarkedProductsStore>()(
  (set) => ({
    bookmarkedProducts: [],
    addToBookmark(newProduct) {
      set((prev) => {
        return {
          ...prev,
          bookmarkedProducts: [...prev.bookmarkedProducts, newProduct],
        };
      });
    },
    removeFromBookmark(productId) {
      set((prev) => {
        const updatedProducts = prev.bookmarkedProducts.filter(
          (product) => product._id !== productId
        );
        return {
          ...prev,
          bookmarkedProducts: updatedProducts,
        };
      });
    },
  })
);
