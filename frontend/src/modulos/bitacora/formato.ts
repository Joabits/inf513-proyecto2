import type { Registro } from './tipos'

const FECHA_HORA = new Intl.DateTimeFormat('es-BO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

const RELATIVO = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

/** Fecha y hora completas, para el detalle y para el texto que aparece al pasar el cursor. */
export const formatoFechaHora = (iso: string) => FECHA_HORA.format(new Date(iso))

/**
 * «hace 2 horas», «ayer»; pasada una semana, la fecha. No se actualiza sola (no hay temporizadores en el panel):
 * se recalcula cada vez que se consulta la lista.
 */
export function tiempoRelativo(iso: string, ahora = Date.now()) {
  const segundos = Math.round((new Date(iso).getTime() - ahora) / 1000)
  const pasado = Math.abs(segundos)

  if (pasado < 60) return 'hace un momento'
  if (pasado < 3600) return RELATIVO.format(Math.round(segundos / 60), 'minute')
  if (pasado < 86_400) return RELATIVO.format(Math.round(segundos / 3600), 'hour')
  if (pasado < 7 * 86_400) return RELATIVO.format(Math.round(segundos / 86_400), 'day')
  return new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

// ---------- Acciones ----------

/** Verbo en pasado de cada acción que registran los módulos y los triggers. Una acción nueva sin traducir se muestra legible igual. */
const VERBOS: Record<string, string> = {
  crear: 'creó',
  editar: 'editó',
  eliminar: 'eliminó',
  publicar: 'publicó',
  ocultar: 'ocultó',
  atender: 'atendió',
  exportar: 'exportó',
  crear_usuario: 'creó',
  eliminar_usuario: 'eliminó',
  activar_usuario: 'activó',
  desactivar_usuario: 'desactivó',
  cambiar_rol: 'cambió el rol de',
}

/** Acción como la nombra la lista de filtros: verbo en infinitivo y con mayúscula. */
const NOMBRES_ACCION: Record<string, string> = {
  crear: 'Crear',
  editar: 'Editar',
  eliminar: 'Eliminar',
  publicar: 'Publicar',
  ocultar: 'Ocultar',
  atender: 'Atender solicitudes',
  exportar: 'Exportar',
  cambiar_clave: 'Cambiar contraseñas',
  editar_perfil: 'Editar el perfil propio',
  crear_usuario: 'Crear cuentas',
  eliminar_usuario: 'Eliminar cuentas',
  activar_usuario: 'Activar cuentas',
  desactivar_usuario: 'Desactivar cuentas',
  cambiar_rol: 'Cambiar roles',
  asignar_permiso: 'Asignar permisos',
  quitar_permiso: 'Quitar permisos',
}

export function nombreAccion(accion: string) {
  return NOMBRES_ACCION[accion] ?? accion.charAt(0).toUpperCase() + accion.slice(1).replaceAll('_', ' ')
}

/** Los módulos registran el modelo como «Clase #id» (class_basename de Laravel); se dice en español. */
const MODELOS: Record<string, string> = {
  User: 'la cuenta',
  Usuario: 'la cuenta',
  Proyecto: 'el proyecto',
  Documento: 'el documento',
  Categoria: 'la categoría',
  Edicion: 'la edición',
  Articulo: 'el artículo',
  Persona: 'la ficha de personal',
  Solicitud: 'la solicitud',
  Galeria: 'la galería',
  Noticia: 'la noticia',
  Evento: 'el evento',
}

const MODELO = /^(\w+) #(\d+)$/

/** «el proyecto "Estudio de mercado"»; sin nombre guardado, «el proyecto n.º 5». */
function elemento(recurso: string, detalle: string | null) {
  const modelo = MODELO.exec(recurso)
  if (!modelo) return null
  const [, clase, id] = modelo
  const tipo = MODELOS[clase] ?? clase.toLowerCase()
  return detalle ? `${tipo} «${detalle}»` : `${tipo} n.º ${id}`
}

// ---------- La frase de cada registro ----------

export interface Frase {
  /** Quién lo hizo: la persona, «El sistema» (seeders, consola) o «Alguien» si no había sesión */
  actor: string
  /** Lo que hizo, en minúscula para continuar después del nombre */
  texto: string
}

const VERBO_HTTP: Record<string, string> = { GET: 'ver', POST: 'crear contenido en', PUT: 'modificar', PATCH: 'modificar', DELETE: 'eliminar contenido en' }

/** Nombre de la persona; sin cuenta, quien actuó fue el sistema o alguien que no había iniciado sesión. */
export function actorDe(registro: Registro) {
  if (registro.nombre ?? registro.usuario) return (registro.nombre ?? registro.usuario) as string
  if (registro.tipo === 'ingreso_fallido') return 'Alguien'
  return registro.tipo === 'acceso' ? 'Alguien sin sesión' : 'El sistema'
}

export function frase(registro: Registro): Frase {
  const actor = actorDe(registro)

  switch (registro.tipo) {
    case 'ingreso_ok':
      return { actor, texto: 'inició sesión' }
    case 'salida':
      return { actor, texto: 'cerró sesión' }
    case 'ingreso_fallido': {
      const correo = /^Correo: (.+)$/.exec(registro.detalle ?? '')?.[1]
      return { actor, texto: correo ? `intentó iniciar sesión con el correo ${correo} y no lo logró` : 'intentó iniciar sesión y no lo logró' }
    }
    case 'acceso': {
      const donde = registro.seccion ? `«${registro.seccion}»` : 'una sección del panel'
      const que = VERBO_HTTP[registro.accion ?? ''] ?? 'entrar a'
      const motivo = registro.codigo_http === 401 ? 'sin haber iniciado sesión' : 'sin tener permiso'
      return { actor, texto: `intentó ${que} ${donde} ${motivo}` }
    }
    default:
      return { actor, texto: accionRealizada(registro) }
  }
}

export const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

/** El texto de un cambio de contenido o de cuentas. Va con minúscula inicial cuando lo precede el nombre de la persona. */
function accionRealizada(registro: Registro) {
  const accion = registro.accion ?? ''
  const recurso = registro.recurso ?? ''
  const detalle = registro.detalle

  if (accion === 'editar_perfil') return 'editó su perfil'
  if (accion === 'cambiar_clave') {
    return detalle?.startsWith('Desde ') ? `cambió su contraseña (${detalle.charAt(6).toLowerCase()}${detalle.slice(7)})` : `cambió la contraseña de ${elemento(recurso, detalle) ?? recurso}`
  }
  if (accion === 'asignar_permiso' || accion === 'quitar_permiso') {
    const rol = /^Rol (.+)$/.exec(recurso)?.[1]
    const de = rol ? `rol «${rol}»` : recurso
    return accion === 'asignar_permiso' ? `asignó el permiso «${detalle}» al ${de}` : `quitó el permiso «${detalle}» del ${de}`
  }
  if (accion === 'cambiar_rol' && detalle) {
    // El trigger guarda «Rol anterior -> Rol nuevo»
    return `cambió el rol de la cuenta n.º ${MODELO.exec(recurso)?.[2]}: ${detalle.replace('->', '→')}`
  }
  if (accion === 'exportar') return `exportó la bitácora${detalle ? ` (${detalle})` : ''}`

  const verbo = VERBOS[accion] ?? accion.replaceAll('_', ' ')
  const cosa = elemento(recurso, detalle)
  // Un recurso en texto («Página de inicio: cifras») ya dice qué se tocó; el detalle, si hay, lo aclara
  return cosa ? `${verbo} ${cosa}` : `${verbo} ${recurso}${detalle ? ` — ${detalle}` : ''}`
}

/** Frase completa en una línea, para listas y lectores de pantalla. */
export function fraseCompleta(registro: Registro) {
  const { actor, texto } = frase(registro)
  return `${actor} ${texto}`
}

// ---------- Detalles técnicos ----------

/** «Chrome en Windows» a partir del texto que envía el navegador. */
export function navegadorLegible(agente: string | null) {
  if (!agente) return null
  if (agente === 'Correo electrónico') return agente

  const navegador =
    /Edg\//.test(agente) ? 'Edge' : /OPR\/|Opera/.test(agente) ? 'Opera' : /Firefox\//.test(agente) ? 'Firefox' : /Chrome\//.test(agente) ? 'Chrome' : /Safari\//.test(agente) ? 'Safari' : null
  const sistema =
    /Windows/.test(agente) ? 'Windows' : /Android/.test(agente) ? 'Android' : /iPhone|iPad|iOS/.test(agente) ? 'iOS' : /Mac OS X|Macintosh/.test(agente) ? 'macOS' : /Linux/.test(agente) ? 'Linux' : null

  if (navegador && sistema) return `${navegador} en ${sistema}`
  return navegador ?? sistema ?? 'Navegador desconocido'
}

/** Valor de un campo modificado, tal como lo guardó la bitácora. */
export function valorCambio(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') return '(vacío)'
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
  return String(valor)
}

/** Columnas de la base con nombre en inglés o abreviado; las demás se leen bien cambiando «_» por espacio. */
const CAMPOS: Record<string, string> = {
  name: 'nombre',
  email: 'correo',
  rol_id: 'rol',
  linea_id: 'línea',
  categoria_id: 'categoría',
  anio: 'año',
  titulo: 'título',
  descripcion: 'descripción',
  publicado: 'publicado',
  publicada: 'publicada',
}

export const nombreCampo = (campo: string) => CAMPOS[campo] ?? campo.replaceAll('_', ' ')
