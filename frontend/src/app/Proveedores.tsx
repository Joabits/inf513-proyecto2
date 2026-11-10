import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import type { ReactNode } from 'react'
import { TemaProveedor } from '@/compartido/tema/TemaProveedor'

/** Sesión vencida (401 o 419): el usuario pasa a visitante y RutaProtegida lo lleva a /ingresar. */
function revisarSesionVencida(error: unknown) {
  if (isAxiosError(error) && [401, 419].includes(error.response?.status ?? 0)) {
    clienteConsultas.setQueryData(['sesion'], null)
    void clienteConsultas.invalidateQueries({ queryKey: ['menu'] })
  }
}

const clienteConsultas = new QueryClient({
  queryCache: new QueryCache({ onError: revisarSesionVencida }),
  mutationCache: new MutationCache({ onError: revisarSesionVencida }),
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

export function Proveedores({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={clienteConsultas}>
      <TemaProveedor>{children}</TemaProveedor>
    </QueryClientProvider>
  )
}
