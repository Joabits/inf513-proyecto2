const ORDINALES = ['Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo']

/** 1 -> «Primer semestre» */
export const nombreSemestre = (numero: number) => `${ORDINALES[numero - 1] ?? `${numero}.º`} semestre`

/** Para buscar sin importar mayúsculas ni tildes. */
export const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
