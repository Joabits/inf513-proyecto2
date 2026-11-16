import type { Registro } from './tipos'

const FECHA_HORA = new Intl.DateTimeFormat('es-BO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

export const formatoFechaHora = (iso: string) => FECHA_HORA.format(new Date(iso))

/** Verbos de las acciones que registran los módulos y los triggers. Una acción nueva sin traducir se muestra legible igual. */
const ACCIONES: Record<string, string> = {
  crear: 'Creó',
  editar: 'Editó',
  eliminar: 'Eliminó',
  publicar: 'Publicó',
  ocultar: 'Ocultó',
  atender: 'Atendió',
  exportar: 'Exportó',
  cambiar_clave: 'Cambió la contraseña de',
  editar_perfil: 'Editó su perfil',
  crear_usuario: 'Creó la cuenta',
  eliminar_usuario: 'Eliminó la cuenta',
  activar_usuario: 'Activó la cuenta',
  desactivar_usuario: 'Desactivó la cuenta',
  cambiar_rol: 'Cambió el rol de la cuenta',
  asignar_permiso: 'Asignó un permiso',
  quitar_permiso: 'Quitó un permiso',
}

export function verboAccion(accion: string) {
  return ACCIONES[accion] ?? accion.charAt(0).toUpperCase() + accion.slice(1).replaceAll('_', ' ')
}

/** Acciones que ya dicen sobre qué se hicieron: el recurso sobra. */
const SIN_RECURSO = new Set(['editar_perfil'])

/** Los módulos registran el modelo como «Clase #id» (class_basename de Laravel); se muestra en español. */
const MODELOS: Record<string, string> = {
  User: 'la cuenta',
  Usuario: 'la cuenta',
  Proyecto: 'el proyecto',
  Documento: 'el documento',
  Edicion: 'la edición',
  Articulo: 'el artículo',
  Persona: 'la ficha de personal',
  Solicitud: 'la solicitud',
  Mensaje: 'el mensaje',
  MensajeContacto: 'el mensaje',
  Galeria: 'la galería',
  Noticia: 'la noticia',
  Evento: 'el evento',
}

export function recursoLegible(recurso: string) {
  const modelo = /^(\w+) #(\d+)$/.exec(recurso)
  if (!modelo) return recurso
  const [, clase, id] = modelo
  return `${MODELOS[clase] ?? clase} n.º ${id}`
}

/** Frase principal de un registro, según su tipo. */
export function describir(registro: Registro) {
  switch (registro.tipo) {
    case 'ingreso_ok':
      return 'Inició sesión'
    case 'ingreso_fallido':
      return 'Intento de inicio de sesión fallido'
    case 'salida':
      return 'Cerró sesión'
    case 'acceso':
      return `${registro.accion} /${registro.recurso}`
    default: {
      const accion = registro.accion ?? ''
      if (SIN_RECURSO.has(accion) || !registro.recurso) return verboAccion(accion)
      return `${verboAccion(accion)} ${recursoLegible(registro.recurso)}`
    }
  }
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
