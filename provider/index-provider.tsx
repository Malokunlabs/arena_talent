import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { type ReactNode } from 'react'


const DefaultIndexProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        {children}
      <Toaster position="top-right" richColors
       duration={500} />
      </NuqsAdapter>
    </QueryClientProvider >
  );
}
