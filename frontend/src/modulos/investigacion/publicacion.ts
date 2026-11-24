/**
 * Si el resumen de un proyecto termina en «Publicado en <revista>. Artículo completo: <enlace>», separa esa cita
 * del texto para mostrarla como etiqueta de la revista y botón al PDF. Si no, null y el resumen queda como está.
 */
export function publicacionDe(resumen: string): { resumen: string; revista: string; enlace: string } | null {
  const cita = resumen.match(/\s*Publicado en (.+?)\.\s*Artículo completo:\s*(https?:\/\/\S+)\s*$/s)
  if (!cita) return null
  return { resumen: resumen.slice(0, cita.index).trim(), revista: cita[1], enlace: cita[2] }
}
