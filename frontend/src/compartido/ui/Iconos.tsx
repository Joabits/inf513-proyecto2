import { ArrowRight, ChevronDown, Contrast, Lock, LogIn, LogOut, Mail, Menu, Search, User, X } from 'lucide-react'
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
