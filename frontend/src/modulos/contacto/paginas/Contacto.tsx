import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { DatosDeContacto } from '../componentes/DatosDeContacto'
import { FormMensaje } from '../componentes/FormMensaje'

/** CU-08 Enviar mensaje de contacto. */
export function Contacto() {
  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina
        titulo="Contacto"
        subtitulo="¿Tiene una consulta sobre la Carrera, la titulación o los trámites? Escríbanos o visítenos."
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:gap-10">
        <DatosDeContacto />
        <FormMensaje />
      </div>
    </div>
  )
}
