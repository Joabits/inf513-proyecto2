import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { TemaProveedor } from '@/compartido/tema/TemaProveedor'

const clienteConsultas = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

export function Proveedores({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={clienteConsultas}>
      <TemaProveedor>{children}</TemaProveedor>
    </QueryClientProvider>
  )
}
