import { z } from 'zod'

export const esquemaCredenciales = z.object({
  email: z.string().trim().pipe(z.email('Ingrese un correo electrónico válido.')),
  password: z.string().min(1, 'Ingrese su contraseña.').max(255, 'La contraseña es demasiado larga.'),
})

export type Credenciales = z.infer<typeof esquemaCredenciales>
