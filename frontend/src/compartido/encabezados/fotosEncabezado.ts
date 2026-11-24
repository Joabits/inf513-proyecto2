import contacto from './fotos/contacto.webp'
import docentes from './fotos/docentes.webp'
import documentos from './fotos/documentos.webp'
import empresaJunior from './fotos/empresa-junior.webp'
import eventos from './fotos/eventos.webp'
import galeria from './fotos/galeria.webp'
import graduados from './fotos/graduados.webp'
import informacionAcademica from './fotos/informacion-academica.webp'
import investigacion from './fotos/investigacion.webp'
import laCarrera from './fotos/la-carrera.webp'
import mallaCurricular from './fotos/malla-curricular.webp'
import noticias from './fotos/noticias.webp'
import revista from './fotos/revista.webp'
import vinculacion from './fotos/vinculacion.webp'

export interface FotoEncabezado {
  src: string
  alt: string
  /** Placa azul sobre la foto: un dato real y estable de la sección (no cifras que cambian a diario) */
  rotulo?: string
  detalle?: string
  /** Atribución que exige la licencia de la foto */
  credito?: string
  /**
   * Otra foto para el carrusel de accesos de la portada, cuando la del encabezado ya trae textos propios que
   * chocarían con el título que va encima.
   */
  srcAcceso?: string
}

/**
 * Foto del encabezado de cada página del portal (diseño «foto al costado»). Son fotos oficiales publicadas por la
 * UAGRM, la FCEE y la Carrera en uagrm.edu.bo, recortadas a 960 × 600 px en WebP. La del campus es de Wikimedia
 * Commons y lleva su crédito. Una página sin foto aquí muestra el encabezado con el ícono de su sección.
 */
export const FOTOS_ENCABEZADO: Record<string, FotoEncabezado> = {
  '/carrera': {
    src: laCarrera,
    alt: 'Edificio de la Carrera de Administración de Empresas con su logo',
    rotulo: 'Desde 1970',
    detalle: 'Acreditada ante el CEUB',
    // La foto del encabezado trae «ADMINISTRACIÓN DE EMPRESAS» abajo: en el carrusel va el ingreso de la FCEE
    srcAcceso: informacionAcademica,
  },
  '/informacion-academica': {
    src: informacionAcademica,
    alt: 'Ingreso a la Facultad de Ciencias Económicas y Empresariales',
    rotulo: 'Plan 101-4',
    detalle: 'Licenciatura en 10 semestres',
  },
  '/malla-curricular': {
    src: mallaCurricular,
    alt: 'Edificios del campus de la Ciudad Universitaria de la UAGRM',
    rotulo: 'Plan 101-4',
    detalle: 'Con salidas de Técnico Medio y Superior',
    credito: 'Foto: Parallelepiped09, Wikimedia Commons, CC BY-SA 4.0',
  },
  '/docentes': { src: docentes, alt: 'Personal de la Carrera de Administración de Empresas frente a su edificio' },
  '/investigacion': {
    src: investigacion,
    alt: 'Docentes de la FCEE en la Universidad de São Paulo',
    rotulo: '11 líneas de investigación',
    detalle: 'Semilleros y Proyectos de Investigación en Aula',
  },
  '/revista-innovar': { src: revista, alt: 'Docentes de la UAGRM reunidos en una comisión académica' },
  '/empresa-junior': { src: empresaJunior, alt: 'Presentación de la alianza de la FCEE con la Fundación CRE' },
  '/vinculacion': { src: vinculacion, alt: 'Delegación de docentes de la FCEE antes de viajar a la Universidad Nacional Mayor de San Marcos' },
  '/noticias': { src: noticias, alt: 'Estudiantes Embajadores de la UAGRM en el programa CRISCOS 2026' },
  '/eventos': { src: eventos, alt: 'Semana Facultativa por el 87.º aniversario de la FCEE' },
  '/galeria': { src: galeria, alt: 'Equipo de la Carrera de Administración de Empresas' },
  '/documentos': { src: documentos, alt: 'Entrega del certificado ISO 9001:2015 a la FCEE' },
  '/contacto': {
    src: contacto,
    alt: 'Autoridades de la Facultad de Ciencias Económicas y Empresariales',
    rotulo: 'Módulo 255, primer piso',
    detalle: 'Ciudad Universitaria, Av. Busch',
  },
  '/alumni': { src: graduados, alt: 'Jornada Académica 2026 de la FCEE' },
  '/graduados': { src: graduados, alt: 'Jornada Académica 2026 de la FCEE' },
}
