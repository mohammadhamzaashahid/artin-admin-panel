"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

// Retry once on network/server errors only. Retrying a 4xx (including 429
// rate limiting) can't succeed and just adds load when the API is busiest.
function shouldRetryQuery(failureCount, error) {
  const status = error?.response?.status;
  if (status && status < 500) return false;
  return failureCount < 1;
}

export default function AppProviders({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: shouldRetryQuery,
            staleTime: 1000 * 30,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}