import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Award,
  BadgeCheck,
  BookMarked,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Construction,
  Contrast,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FileUp,
  FlaskConical,
  GraduationCap,
  Handshake,
  History,
  House,
  ImagePlus,
  Images,
  Inbox,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  MessageCircle,
  MoveHorizontal,
  Newspaper,
  Pencil,
  Phone,
  Plus,
  Quote,
  Rocket,
  ScrollText,
  Search,
  Send,
  Settings,
  Target,
  Trash2,
  TriangleAlert,
  User,
  UserCheck,
  UserCog,
  Users,
  UserX,
  X,
} from 'lucide-react'
import type { LucideIcon, LucideProps } from 'lucide-react'

/** Íconos de Lucide: toda la aplicación los importa desde aquí. Heredan el color del texto. */
const icono = (Icono: LucideIcon) => (props: LucideProps) => <Icono size={20} {...props} />

/** Cualquiera de los íconos de abajo, para pasarlo como propiedad (por ejemplo a ChipIcono). */
export type ComponenteIcono = ReturnType<typeof icono>

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
export const IconoSubirArchivo = icono(FileUp)
export const IconoEditar = icono(Pencil)
export const IconoHistorial = icono(History)
export const IconoVer = icono(Eye)
export const IconoOcultar = icono(EyeOff)
export const IconoLlave = icono(KeyRound)
export const IconoActivar = icono(UserCheck)
export const IconoDesactivar = icono(UserX)
export const IconoUbicacion = icono(MapPin)
export const IconoTelefono = icono(Phone)
export const IconoMensaje = icono(MessageCircle)
export const IconoHorario = icono(Clock)
export const IconoEnviar = icono(Send)

// Secciones del portal y del panel (ver compartido/menu/iconosRuta.ts)
export const IconoCasa = icono(House)
export const IconoInstitucion = icono(Landmark)
export const IconoDocentes = icono(Users)
export const IconoUsuarios = icono(UserCog)
export const IconoLibro = icono(BookOpen)
export const IconoGraduacion = icono(GraduationCap)
export const IconoDocumento = icono(FileText)
export const IconoInvestigacion = icono(FlaskConical)
export const IconoRevista = icono(BookMarked)
export const IconoConvenio = icono(Handshake)
export const IconoInnova = icono(Rocket)
export const IconoEmpresa = icono(BriefcaseBusiness)
export const IconoMedalla = icono(Award)
export const IconoNoticias = icono(Newspaper)
export const IconoCalendario = icono(CalendarDays)
export const IconoGaleria = icono(Images)
export const IconoBandeja = icono(Inbox)
export const IconoEstadisticas = icono(ChartColumn)
export const IconoAjustes = icono(Settings)
export const IconoAnuncio = icono(Megaphone)

// Contenido de las páginas
export const IconoObjetivo = icono(Target)
export const IconoVision = icono(Eye)
export const IconoCita = icono(Quote)
export const IconoVerificado = icono(BadgeCheck)
export const IconoResolucion = icono(ScrollText)
export const IconoConstruccion = icono(Construction)
export const IconoCorrecto = icono(CircleCheck)
export const IconoDeslizar = icono(MoveHorizontal)
export const IconoAlerta = icono(TriangleAlert)
