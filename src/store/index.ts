import { Product } from "@/Interfaces/Product";
import { create } from "zustand";

interface PopUpsStore {
  isOpenGlobalNavbar: boolean;
  setIsOpenGlobalNavbar: (newState: boolean) => void;
  isOpenBookmarkedProductsPopUp: boolean;
  setIsOpenBookmarkedProductsPopUp: (newState: boolean) => void;
}

export const usePopUpsStore = create<PopUpsStore>()((set) => ({
  isOpenGlobalNavbar: false,
  setIsOpenGlobalNavbar: (newState) => {
    set((prev) => {
      return { ...prev, isOpenGlobalNavbar: newState };
    });
  },
  isOpenBookmarkedProductsPopUp: false,
  setIsOpenBookmarkedProductsPopUp: (newState) => {
    set((prev) => {
      return { ...prev, isOpenBookmarkedProductsPopUp: newState };
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

export interface CartProduct {
  product: Product;
  itemsToSell: number;
}
interface CartStore {
  cart: CartProduct[];
  addToCart: (newProduct: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalNoOfItems: () => number;
}

export const useCartStore = create<CartStore>()((set, get) => ({
  cart: [],
  addToCart(newProduct) {
    set((prev) => {
      const product = prev.cart.find(
        (cartProduct) => cartProduct.product._id === newProduct._id
      );
      if (!product) {
        return {
          ...prev,
          cart: [
            ...prev.cart,
            {
              product: newProduct,
              itemsToSell: 1,
            },
          ],
        };
      } else {
        const updated = prev.cart.map((val) => {
          if (val.product._id === newProduct._id) {
            return {
              ...val,
              itemsToSell: val.itemsToSell + 1,
            };
          } else {
            return val;
          }
        });
        return {
          ...prev,
          cart: updated,
        };
      }
    });
  },
  removeFromCart(productId: string) {
    set((prev) => {
      const product = prev.cart.find(
        (cartProduct) => cartProduct.product._id === productId
      );

      if (!product) return prev;

      if (product.itemsToSell > 1) {
        const updated = prev.cart.map((val) => {
          if (val.product._id === productId) {
            return {
              ...val,
              itemsToSell: val.itemsToSell - 1,
            };
          }
          return val;
        });
        return { ...prev, cart: updated };
      } else {
        const updated = prev.cart.filter(
          (val) => val.product._id !== productId
        );
        return { ...prev, cart: updated };
      }
    });
  },
  clearCart() {
    set((prev) => {
      return {
        ...prev,
        cart: [],
      };
    });
  },
  totalPrice() {
    return get().cart.reduce((total, item) => {
      return total + item.product.sellingPrice * item.itemsToSell;
    }, 0);
  },
  totalNoOfItems() {
    return get().cart.reduce((total, item) => {
      return total + item.itemsToSell;
    }, 0);
  },
}));
