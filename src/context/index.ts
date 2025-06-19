// context/MyContext.tsx
import { createContext, useContext } from "react";

export const MyPermissionsContext = createContext<{
  myPermissions: string[];
  isFetchingMyPermissions: boolean;
} | null>(null);

export const useMyPermissionsContext = () => {
  const context = useContext(MyPermissionsContext);
  if (!context) {
    throw new Error("useMyData must be used within MyDataContext.Provider");
  }
  return context;
};
