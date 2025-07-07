"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { ModalProvider } from "@/context/modalContext";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 1000 * 60 * 60 } },
      })
  );

  return (
    <ModalProvider>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
        </QueryClientProvider>
      </SessionProvider>
    </ModalProvider>
  );
}
