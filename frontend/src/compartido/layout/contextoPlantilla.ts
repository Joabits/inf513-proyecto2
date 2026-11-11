import { createContext, useContext } from 'react'

/** En qué plantilla se muestra la página: cambia cómo se ve su título (TituloPagina). */
export type TipoPlantilla = 'publica' | 'gestion' | 'acceso'

export const ContextoPlantilla = createContext<TipoPlantilla>('publica')

export const usePlantilla = () => useContext(ContextoPlantilla)
