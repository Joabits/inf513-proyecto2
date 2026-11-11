export function EstadoCarga({ texto = 'Cargando...' }: { texto?: string }) {
  return (
    <p role="status" className="py-8 text-center text-texto-suave">
      {texto}
    </p>
  )
}

export function MensajeError({ texto = 'No se pudo cargar la información. Intente nuevamente.' }: { texto?: string }) {
  return (
    <p role="alert" className="rounded-tema border border-primario bg-tarjeta p-4 text-acento">
      {texto}
    </p>
  )
}
