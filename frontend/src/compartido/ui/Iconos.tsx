import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Contrast,
  ExternalLink,
  ImagePlus,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Menu,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react'
import type { LucideIcon, LucideProps } from 'lucide-react'

/** Íconos de Lucide: toda la aplicación los importa desde aquí. Heredan el color del texto. */
const icono = (Icono: LucideIcon) => (props: LucideProps) => <Icono size={20} {...props} />

export const IconoBuscar = icono(Search)
export const IconoMenu = icono(Menu)
export const IconoCerrar = icono(X)
export const IconoFlecha = icono(ArrowRight)
export const IconoAbajo = icono(ChevronDown)
export const IconoUsuario = icono(User)
export const IconoVisualizacion = icono(Contrast)
export const IconoCorreo = icono(Mail)
export const IconoClave = icono(Lock)
export const IconoIngresar = icono(LogIn)
export const IconoSalir = icono(LogOut)
export const IconoAnterior = icono(ChevronLeft)
export const IconoSiguiente = icono(ChevronRight)
export const IconoAgregar = icono(Plus)
export const IconoEliminar = icono(Trash2)
export const IconoSubir = icono(ArrowUp)
export const IconoBajar = icono(ArrowDown)
export const IconoExterno = icono(ExternalLink)
export const IconoImagen = icono(ImagePlus)
export const IconoListo = icono(Check)
export const IconoPanel = icono(LayoutDashboard)
