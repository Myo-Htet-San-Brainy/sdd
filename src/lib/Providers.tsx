"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { ModalProvider } from "@/context/modalContext";
import { NextIntlClientProvider } from "next-intl";

export default function Providers({
  children,
  msgs,
  locale,
}: {
  children: ReactNode;
  msgs: Record<string, any>;
  locale: string;
}) {
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
          <NextIntlClientProvider messages={msgs} locale={locale}>
            {children}
          </NextIntlClientProvider>
          <Toaster />
        </QueryClientProvider>
      </SessionProvider>
    </ModalProvider>
  );
}
