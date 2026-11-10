import { cliente } from '@/compartido/api/cliente'
import type { DatosAccesos, DatosCifras, DatosContenido } from './inicio.esquema'
import type { ContenidoInicio } from './tipos'

export const obtenerInicio = () => cliente.get<ContenidoInicio>('/inicio').then((r) => r.data)

export const actualizarPortada = (datos: DatosContenido) =>
  cliente.put<ContenidoInicio>('/inicio/portada', datos).then((r) => r.data)

export const guardarCifras = (datos: DatosCifras) => cliente.put<ContenidoInicio>('/inicio/cifras', datos).then((r) => r.data)

export const guardarAccesos = (datos: DatosAccesos) => cliente.put<ContenidoInicio>('/inicio/accesos', datos).then((r) => r.data)

export const agregarBanner = (datos: FormData) => cliente.post<ContenidoInicio>('/inicio/banners', datos).then((r) => r.data)

export const eliminarBanner = (id: number) => cliente.delete<ContenidoInicio>(`/inicio/banners/${id}`).then((r) => r.data)

export const ordenarBanners = (ids: number[]) => cliente.put<ContenidoInicio>('/inicio/banners/orden', { ids }).then((r) => r.data)

export const subirFotoDirector = (foto: File) => {
  const datos = new FormData()
  datos.append('foto', foto)
  return cliente.post<ContenidoInicio>('/inicio/portada/foto', datos).then((r) => r.data)
}

export const quitarFotoDirector = () => cliente.delete<ContenidoInicio>('/inicio/portada/foto').then((r) => r.data)
