import { QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { createQueryClient } from '@/lib/query-client'
import { AppRouter } from './router'

export function AppProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  )
}

export function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  )
}
