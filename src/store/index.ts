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
