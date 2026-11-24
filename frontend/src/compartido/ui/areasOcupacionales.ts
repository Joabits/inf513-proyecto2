/**
 * Áreas del campo ocupacional sacadas del texto oficial que carga el personal:
 * «…en áreas ocupacionales de Alta Gerencia, Finanzas, Recursos Humanos, …; y en cualquier área…».
 * Devuelve la lista (entre 3 y 12 áreas) o null si el texto no tiene esa forma: entonces se muestra el párrafo.
 */
export function areasOcupacionales(texto: string | null | undefined): string[] | null {
  const lista = texto?.match(/[áa]reas ocupacionales de ([^;.]+)/i)?.[1]
  if (!lista) return null
  const areas = lista
    .split(/,\s*/)
    .map((area) => area.trim())
    .filter(Boolean)
  return areas.length >= 3 && areas.length <= 12 ? areas : null
}
