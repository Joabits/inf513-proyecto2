import { cliente } from '@/compartido/api/cliente'
import type { DatosComplementos, DatosLineas, DatosProyecto } from './investigacion.esquema'
import type { Complementos, GestionInvestigacion, InvestigacionPublica, Linea, Proyecto } from './tipos'

const GESTION = '/gestion/investigacion'

/** Lo que ve el visitante (CU-03): líneas, proyectos publicados, semilleros y textos. */
export const obtenerPublica = () => cliente.get<InvestigacionPublica>('/investigacion').then((r) => r.data)

export const obtenerGestion = () => cliente.get<GestionInvestigacion>(GESTION).then((r) => r.data)

export const crearProyecto = (datos: DatosProyecto) =>
  cliente.post<{ data: Proyecto }>(`${GESTION}/proyectos`, datos).then((r) => r.data.data)

export const actualizarProyecto = (id: number, datos: DatosProyecto) =>
  cliente.put<{ data: Proyecto }>(`${GESTION}/proyectos/${id}`, datos).then((r) => r.data.data)

export const cambiarPublicacion = (id: number, publicado: boolean) =>
  cliente.patch<{ data: Proyecto }>(`${GESTION}/proyectos/${id}/publicacion`, { publicado }).then((r) => r.data.data)

export const eliminarProyecto = (id: number) => cliente.delete(`${GESTION}/proyectos/${id}`)

/** En el formulario el id va como «clave» (useFieldArray usa «id» para sí): aquí se devuelve a «id». */
export const guardarLineas = ({ lineas }: DatosLineas) =>
  cliente
    .put<{ data: Linea[] }>(`${GESTION}/lineas`, { lineas: lineas.map(({ clave, ...linea }) => ({ id: clave, ...linea })) })
    .then((r) => r.data.data)

export const guardarComplementos = (datos: DatosComplementos) =>
  cliente.put<Complementos>(`${GESTION}/complementos`, datos).then((r) => r.data)
