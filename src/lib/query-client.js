import { QueryClient } from '@tanstack/react-query';

// PASS 7: staleTime 60s — prevents redundant refetches on mobile navigation
export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000,      // 60s — data stays fresh, no duplicate requests
      gcTime: 5 * 60 * 1000,     // 5min garbage collection window
    },
  },
});