import {
  type ComponenteIcono,
  IconoAjustes,
  IconoAnuncio,
  IconoBandeja,
  IconoCalendario,
  IconoCasa,
  IconoConvenio,
  IconoCorreo,
  IconoDocentes,
  IconoDocumento,
  IconoEstadisticas,
  IconoGaleria,
  IconoGraduacion,
  IconoHistorial,
  IconoInnova,
  IconoInstitucion,
  IconoInvestigacion,
  IconoLibro,
  IconoMedalla,
  IconoNoticias,
  IconoPanel,
  IconoRevista,
  IconoUsuario,
  IconoUsuarios,
} from '@/compartido/ui/Iconos'

/**
 * Ícono de cada sección. Las rutas vienen del menú de la BD (MenuSeeder):
 * al agregar una opción nueva al menú, agregue aquí su ícono.
 * El portal y el panel usan el mismo ícono para la misma sección.
 */
const POR_SECCION: Record<string, ComponenteIcono> = {
  '': IconoCasa,
  inicio: IconoCasa,
  carrera: IconoInstitucion,
  institucional: IconoInstitucion,
  docentes: IconoDocentes,
  'malla-curricular': IconoLibro,
  'informacion-academica': IconoGraduacion,
  documentos: IconoDocumento,
  investigacion: IconoInvestigacion,
  'revista-innovar': IconoRevista,
  vinculacion: IconoConvenio,
  'empresa-junior': IconoInnova,
  'solicitudes-innova': IconoBandeja,
  alumni: IconoMedalla,
  graduados: IconoMedalla,
  noticias: IconoNoticias,
  eventos: IconoCalendario,
  galeria: IconoGaleria,
  contacto: IconoCorreo,
  mensajes: IconoCorreo,
  estadisticas: IconoEstadisticas,
  usuarios: IconoUsuarios,
  bitacora: IconoHistorial,
  configuracion: IconoAjustes,
  graduado: IconoUsuario,
}

/** Grupos del menú de gestión (por su título en la BD). */
const POR_GRUPO: Record<string, ComponenteIcono> = {
  'Contenido institucional': IconoInstitucion,
  'Investigación y vinculación': IconoInvestigacion,
  Comunicación: IconoAnuncio,
  Administración: IconoAjustes,
  'Mi cuenta': IconoUsuario,
}

/** '/gestion/usuarios' → ícono de usuarios; '/gestion' → ícono del panel. */
export function iconoDeRuta(ruta?: string | null): ComponenteIcono | undefined {
  if (ruta == null) return undefined
  const limpia = ruta.replace(/\/+$/, '')
  if (limpia === '/gestion') return IconoPanel
  const seccion = limpia.replace(/^\/(gestion|mi-cuenta)(\/|$)/, '/').split('/')[1] ?? ''
  return POR_SECCION[seccion]
}

export function iconoDeGrupo(titulo: string): ComponenteIcono | undefined {
  return POR_GRUPO[titulo]
}
