import {
  type ComponenteIcono,
  IconoAnuncio,
  IconoBuscar,
  IconoComunidad,
  IconoDiagnostico,
  IconoDigital,
  IconoDocentes,
  IconoEmpresa,
  IconoFinanzas,
  IconoGraduacion,
  IconoInnova,
  IconoInstitucion,
  IconoInvestigacion,
  IconoObjetivo,
  IconoOrganizacion,
  IconoPlan,
  IconoProduccion,
  IconoVerificado,
} from './Iconos'

/**
 * Ícono según el tema de un texto (un área ocupacional, una línea de investigación, un servicio de INNOVA).
 * Se busca por palabras clave, sin tildes ni mayúsculas, en orden: la primera que coincide gana.
 * Si el personal escribe un tema nuevo, recibe el ícono genérico de organización.
 */
const TEMAS: [RegExp, ComponenteIcono][] = [
  [/plan de negocio/, IconoPlan],
  [/estudio de mercado|mercado/, IconoBuscar],
  [/diagnostico/, IconoDiagnostico],
  [/capacitacion|educacion|formacion|ensenanza/, IconoGraduacion],
  [/gerencia|estrateg|direccion/, IconoObjetivo],
  [/finanz|financ|valor|costo/, IconoFinanzas],
  [/talento|recursos humanos|personal|liderazgo/, IconoDocentes],
  [/produccion|operaciones/, IconoProduccion],
  [/marketing|comercial|consumidor|ventas/, IconoAnuncio],
  [/calidad|acredit/, IconoVerificado],
  [/digital|datos|tecnolog/, IconoDigital],
  [/emprend|innovacion|empresarial/, IconoInnova],
  [/publica|gobern|responsabilidad social/, IconoInstitucion],
  [/social|solidaria|territorial|comunidad/, IconoComunidad],
  [/investigacion|conocimiento/, IconoInvestigacion],
  [/empresa|negocio/, IconoEmpresa],
]

const normalizar = (texto: string) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function iconoPorTema(texto: string): ComponenteIcono {
  const limpio = normalizar(texto)
  return TEMAS.find(([patron]) => patron.test(limpio))?.[1] ?? IconoOrganizacion
}
